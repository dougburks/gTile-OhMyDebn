#!/usr/bin/env gjs
//
// Unit tests for 5.4/tile-rules.js's pure functions - no live Cinnamon
// session required. Loads the file by reading and eval()'ing its source
// rather than via GJS's imports.searchPath/ES module machinery, since
// this file is also embedded (byte-for-byte, see check-sync.sh) inside a
// hand-patched compiled bundle at runtime and this keeps the test
// independent of whichever module-loading convention that bundle ends up
// using.

const GLib = imports.gi.GLib;

let failures = 0;
let total = 0;

function assertEq(name, actual, expected) {
    total++;
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a === e) {
        print('PASS - ' + name);
    } else {
        failures++;
        print('FAIL - ' + name + ' (got ' + a + ', want ' + e + ')');
    }
}

const scriptDir = GLib.path_get_dirname(imports.system.programInvocationName || ARGV[0] || '.');
const tileRulesPath = GLib.build_filenamev([scriptDir, '..', '5.4', 'tile-rules.js']);
const [ok, contents] = GLib.file_get_contents(tileRulesPath);
if (!ok) {
    printerr('Could not read ' + tileRulesPath);
    imports.system.exit(1);
}
eval(imports.byteArray.toString(contents));

// --- matchTileRule ---

const rules = [
    { wmClass: 'Alacritty', titleRegex: '^cliamp$', grid: [2, 2, 1, 1, 1, 1] },
    { wmClass: 'Alacritty', titleRegex: '^SO-CRATES$', grid: [2, 2, 1, 0, 1, 2] },
    { wmClass: 'brave-browser', grid: [2, 2, 0, 0, 2, 2] },
];

assertEq('matches on wm_class + title', matchTileRule('Alacritty', 'cliamp', rules), [2, 2, 1, 1, 1, 1]);
assertEq('a different title under the same wm_class matches its own rule, not another app\'s',
    matchTileRule('Alacritty', 'SO-CRATES', rules), [2, 2, 1, 0, 1, 2]);
assertEq('an unrecognized title under a shared wm_class matches nothing',
    matchTileRule('Alacritty', 'just a terminal', rules), null);
assertEq('matches on wm_class alone when the rule has no titleRegex',
    matchTileRule('brave-browser', 'anything at all', rules), [2, 2, 0, 0, 2, 2]);
assertEq('an unknown wm_class matches nothing', matchTileRule('nautilus', 'Files', rules), null);
assertEq('a missing/undefined title does not throw and matches nothing against a titled rule',
    matchTileRule('Alacritty', undefined, rules), null);
assertEq('an empty rule table matches nothing', matchTileRule('Alacritty', 'cliamp', []), null);

// One bad entry in the (hand-editable) rule table must only disable
// that one rule - not throw out of the loop and kill matching for
// every rule after it.
const rulesWithBadEntries = [
    null,
    { wmClass: 'Alacritty', titleRegex: '[unclosed', grid: [2, 2, 0, 0, 1, 1] },
    { wmClass: 'Alacritty', titleRegex: '^htop$', grid: [2, 2, 1, 0, 1, 2] },
];
assertEq('a null rule entry is skipped, not thrown on',
    matchTileRule('Alacritty', 'htop', rulesWithBadEntries), [2, 2, 1, 0, 1, 2]);
assertEq('a rule with a malformed titleRegex is skipped, later rules still match',
    matchTileRule('Alacritty', 'htop', [rulesWithBadEntries[1], rulesWithBadEntries[2]]),
    [2, 2, 1, 0, 1, 2]);
assertEq('a malformed titleRegex alone simply matches nothing',
    matchTileRule('Alacritty', 'htop', [rulesWithBadEntries[1]]), null);

// --- computeGridRect ---

assertEq('full-screen grid (2x2, span the whole thing) on a 1920x1080 usable area at origin',
    computeGridRect(0, 0, 1920, 1080, 2, 2, 0, 0, 2, 2), [0, 0, 1920, 1080]);
assertEq('right-half grid (colIndex 1 of 2, 1x2 span)',
    computeGridRect(0, 0, 1920, 1080, 2, 2, 1, 0, 1, 2), [960, 0, 960, 1080]);
assertEq('bottom-right quadrant (colIndex 1, rowIndex 1, 1x1 span)',
    computeGridRect(0, 0, 1920, 1080, 2, 2, 1, 1, 1, 1), [960, 540, 960, 540]);
assertEq('an offset usable area (panel eating into the top) is respected',
    computeGridRect(0, 30, 1920, 1050, 2, 2, 0, 0, 2, 2), [0, 30, 1920, 1050]);
assertEq('a zero/negative span falls back to 1 rather than producing a zero-size or negative rect',
    computeGridRect(0, 0, 1920, 1080, 2, 2, 0, 0, 0, -1), [0, 0, 960, 540]);
assertEq('a zero/negative cols/rows falls back to 1 rather than dividing by zero (Infinity/NaN geometry)',
    computeGridRect(0, 0, 1920, 1080, 0, -1, 0, 0, 1, 1), [0, 0, 1920, 1080]);

// --- validateTileArgs (the DBus TileFocusedWindow guard) ---

assertEq('a normal in-range request passes its spans through',
    validateTileArgs(2, 2, 0, 0, 1, 2), { colSpan: 1, rowSpan: 2 });
assertEq('omitted spans (DBus callers may send only 4 useful args) fall back to 1',
    validateTileArgs(2, 2, 1, 1, undefined, undefined), { colSpan: 1, rowSpan: 1 });
assertEq('zero/negative spans fall back to 1',
    validateTileArgs(2, 2, 0, 0, 0, -3), { colSpan: 1, rowSpan: 1 });
assertEq('spans clamp to the grid edge instead of running past it',
    validateTileArgs(4, 4, 3, 2, 5, 5), { colSpan: 1, rowSpan: 2 });
assertEq('a zero-column grid is rejected (would divide by zero)',
    validateTileArgs(0, 2, 0, 0, 1, 1), null);
assertEq('a negative-row grid is rejected',
    validateTileArgs(2, -1, 0, 0, 1, 1), null);
assertEq('a column index outside the grid is rejected (would place the window offscreen)',
    validateTileArgs(2, 2, 2, 0, 1, 1), null);
assertEq('a negative row index is rejected',
    validateTileArgs(2, 2, 0, -1, 1, 1), null);
assertEq('non-integer grid arguments are rejected',
    validateTileArgs(2.5, 2, 0, 0, 1, 1), null);

print('');
print(total + ' assertion(s), ' + failures + ' failure(s)');
imports.system.exit(failures === 0 ? 0 : 1);
