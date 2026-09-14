#!/usr/bin/env gjs
//
// Unit tests for 5.4/tile-labels.js's letter<->index mapping pair - no
// live Cinnamon session required. Loads the file by reading and
// eval()'ing its source, same as the other test-*.js suites, for the
// same reason (this file is also embedded byte-for-byte, see
// check-sync.sh, inside a hand-patched compiled bundle at runtime).

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
const path = GLib.build_filenamev([scriptDir, '..', '5.4', 'tile-labels.js']);
const [ok, contents] = GLib.file_get_contents(path);
if (!ok) {
    printerr('Could not read ' + path);
    imports.system.exit(1);
}
eval(imports.byteArray.toString(contents));

assertEq('index 0 is "a"', tileIndexToLabel(0), 'a');
assertEq('index 25 is "z"', tileIndexToLabel(25), 'z');
assertEq('index 26 rolls over to "A"', tileIndexToLabel(26), 'A');
assertEq('index 51 is "Z"', tileIndexToLabel(51), 'Z');

// The reason both directions live in one file: GridElement draws the
// label with one mapping and getGridElementFromLetter decodes the
// pressed key with the other - if they ever disagreed, pressing the
// letter shown on a tile would select a different tile. The round trip
// over every valid index makes disagreement impossible to miss.
{
    let roundTripFailures = 0;
    for (let i = 0; i < 52; i++) {
        if (tileLabelToIndex(tileIndexToLabel(i)) !== i)
            roundTripFailures++;
    }
    assertEq('label -> index round-trips for every valid index (0-51)', roundTripFailures, 0);
}

assertEq('index 52 (past "Z") gets no label, not punctuation', tileIndexToLabel(52), null);
assertEq('negative index gets no label', tileIndexToLabel(-1), null);
assertEq('non-integer index gets no label', tileIndexToLabel(1.5), null);

assertEq('a digit is not a tile letter', tileLabelToIndex('1'), null);
assertEq('punctuation is not a tile letter', tileLabelToIndex('['), null);
assertEq('a multi-character string is not a tile letter', tileLabelToIndex('ab'), null);
assertEq('an empty string is not a tile letter', tileLabelToIndex(''), null);
assertEq('a non-string is not a tile letter', tileLabelToIndex(undefined), null);

print('');
print(total + ' assertion(s), ' + failures + ' failure(s)');
imports.system.exit(failures === 0 ? 0 : 1);
