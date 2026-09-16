#!/usr/bin/env gjs
//
// Unit tests for 5.4/scrollable-tiling.js's pure column-strip logic
// (the "Scrollable tiling" mode) - no live Cinnamon session required.
// Windows are opaque string tokens ('A', 'B', ...) rather than real
// Meta.Window objects, since the strip logic itself never calls any
// method on them. Loads the file by reading and eval()'ing its source,
// same as the other test-*.js suites, for the same reason (this file
// is also embedded byte-for-byte, see check-sync.sh, inside a
// hand-patched compiled bundle at runtime).

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
const path = GLib.build_filenamev([scriptDir, '..', '5.4', 'scrollable-tiling.js']);
const [ok, contents] = GLib.file_get_contents(path);
if (!ok) {
    printerr('Could not read ' + path);
    imports.system.exit(1);
}
eval(imports.byteArray.toString(contents));

// --- columnWidthFraction (raw percent setting -> width fraction) ---

assertEq('50% -> 0.5', columnWidthFraction(50), 0.5);
assertEq('a numeric string is accepted', columnWidthFraction('25'), 0.25);
assertEq('null falls back to 50%', columnWidthFraction(null), 0.5);
assertEq('non-numeric falls back to 50%', columnWidthFraction('abc'), 0.5);
assertEq('zero/negative falls back to 50% (would blow up the fit division)',
    [columnWidthFraction(0), columnWidthFraction(-10)], [0.5, 0.5]);
assertEq('tiny values clamp to the schema minimum (20%)', columnWidthFraction(3), 0.2);
assertEq('values past the schema maximum clamp to 50% - wider fits only one column per screen', columnWidthFraction(80), 0.5);

// --- normalizeScrollDuration (raw ms setting -> effective slide time) ---

assertEq('the default duration passes through', normalizeScrollDuration(200), 200);
assertEq('0 stays 0 - the "scroll animation disabled" contract', normalizeScrollDuration(0), 0);
assertEq('a numeric string is accepted', normalizeScrollDuration('200'), 200);
assertEq('null falls back to the default of 200', normalizeScrollDuration(null), 200);
assertEq('undefined falls back to the default of 200', normalizeScrollDuration(undefined), 200);
assertEq('non-numeric falls back to the default of 200', normalizeScrollDuration('abc'), 200);
assertEq('a negative duration clamps to 0', normalizeScrollDuration(-50), 0);
assertEq('a fractional duration floors', normalizeScrollDuration(99.9), 99);
assertEq('an absurd duration clamps to the schema maximum (500)', normalizeScrollDuration(5000), 500);

// --- nextTilingMode (the Super+L cycle) ---

assertEq('forward steps to the next mode in combobox order', nextTilingMode('off', 1), 'rules');
assertEq('forward from traditional-full reaches scrollable', nextTilingMode('traditional-full', 1), 'scrollable');
assertEq('forward wraps from the last mode to the first', nextTilingMode('scrollable', 1), 'off');
assertEq('backward steps to the previous mode', nextTilingMode('scrollable', -1), 'traditional-full');
assertEq('backward wraps from the first mode to the last', nextTilingMode('off', -1), 'scrollable');
assertEq('an unknown mode recovers to off (forward)', nextTilingMode('garbage', 1), 'off');
assertEq('an unset mode recovers to off (backward)', nextTilingMode(undefined, -1), 'off');
{
    // One full forward lap visits every mode exactly once and returns
    // home - the property that makes "press until you see the one you
    // want" reliable.
    const visited = [];
    let mode = 'off';
    for (let i = 0; i < TILING_MODE_CYCLE.length; i++) {
        visited.push(mode);
        mode = nextTilingMode(mode, 1);
    }
    assertEq('a full forward lap visits every mode once and wraps home',
        [visited, mode], [TILING_MODE_CYCLE, 'off']);
}

// --- stripVisibleCount (how many whole columns fit at once) ---

assertEq('half-width columns: 2 fit', stripVisibleCount(0.5), 2);
assertEq('full-width columns: 1 fits', stripVisibleCount(1), 1);
assertEq('a third: 3 fit (float noise absorbed)', stripVisibleCount(1 / 3), 3);
assertEq('40%: 2 fit (a third column would not)', stripVisibleCount(0.4), 2);
assertEq('at least 1 even for a nonsense fraction', stripVisibleCount(0), 1);

// --- stripInsert ---

assertEq('insert into an empty strip', stripInsert([], 'A', -1), ['A']);
assertEq('insert right of the focused column', stripInsert(['A', 'C'], 'B', 0), ['A', 'B', 'C']);
assertEq('insert right of the last column appends', stripInsert(['A', 'B'], 'C', 1), ['A', 'B', 'C']);
assertEq('an invalid afterIndex appends at the end', stripInsert(['A', 'B'], 'C', null), ['A', 'B', 'C']);
{
    const original = ['A'];
    stripInsert(original, 'B', 0);
    assertEq('insert does not mutate the input array', original, ['A']);
}

// --- stripRemove ---

assertEq('remove a middle column', stripRemove(['A', 'B', 'C'], 'B'), ['A', 'C']);
assertEq('remove the last remaining column', stripRemove(['A'], 'A'), []);
{
    const columns = ['A', 'B'];
    assertEq('removing an unknown window returns the input array itself (same reference)',
        stripRemove(columns, 'X') === columns, true);
}

// --- stripMoveColumn ---

assertEq('move a column right', stripMoveColumn(['A', 'B', 'C'], 'A', 1), ['B', 'A', 'C']);
assertEq('move a column left', stripMoveColumn(['A', 'B', 'C'], 'C', -1), ['A', 'C', 'B']);
{
    const columns = ['A', 'B'];
    assertEq('moving the leftmost column left is a no-op (same reference)',
        stripMoveColumn(columns, 'A', -1) === columns, true);
    assertEq('moving the rightmost column right is a no-op (same reference)',
        stripMoveColumn(columns, 'B', 1) === columns, true);
    assertEq('moving an unknown window is a no-op (same reference)',
        stripMoveColumn(columns, 'X', 1) === columns, true);
}

// --- scrollToShow (the viewport rule) ---

assertEq('a target already in view leaves the viewport alone', scrollToShow(1, 2, 2, 4), 1);
assertEq('a target right of the view shifts minimally (target becomes rightmost)',
    scrollToShow(0, 3, 2, 4), 2);
assertEq('a target left of the view shifts minimally (target becomes leftmost)',
    scrollToShow(2, 0, 2, 4), 0);
assertEq('firstVisible clamps so the viewport never shows empty space past the strip',
    scrollToShow(5, null, 2, 3), 1);
assertEq('fewer columns than fit: viewport pins to 0', scrollToShow(3, 1, 2, 2), 0);
assertEq('a non-integer firstVisible is treated as 0', scrollToShow(null, null, 2, 4), 0);

// --- stripLayout ---

assertEq('a lone column always fills the screen (the Omarchy rule), whatever its configured width',
    stripLayout(['A'], 0, 0.5),
    [{ window: 'A', visible: true, region: { x: 0, width: 1 } }]);

assertEq('two half-width columns split the screen',
    stripLayout(['A', 'B'], 0, 0.5),
    [
        { window: 'A', visible: true, region: { x: 0, width: 0.5 } },
        { window: 'B', visible: true, region: { x: 0.5, width: 0.5 } },
    ]);

assertEq('a third column past the viewport is hidden (minimized by the impure layer)',
    stripLayout(['A', 'B', 'C'], 0, 0.5),
    [
        { window: 'A', visible: true, region: { x: 0, width: 0.5 } },
        { window: 'B', visible: true, region: { x: 0.5, width: 0.5 } },
        { window: 'C', visible: false, region: null },
    ]);

assertEq('scrolling right by one hides the leftmost column instead',
    stripLayout(['A', 'B', 'C'], 1, 0.5),
    [
        { window: 'A', visible: false, region: null },
        { window: 'B', visible: true, region: { x: 0, width: 0.5 } },
        { window: 'C', visible: true, region: { x: 0.5, width: 0.5 } },
    ]);

assertEq('an out-of-range firstVisible clamps rather than hiding everything',
    stripLayout(['A', 'B'], 7, 0.5),
    [
        { window: 'A', visible: true, region: { x: 0, width: 0.5 } },
        { window: 'B', visible: true, region: { x: 0.5, width: 0.5 } },
    ]);

assertEq('an empty strip lays out nothing', stripLayout([], 0, 0.5), []);

// --- the Omarchy open/close cycle end to end ---
// Window 1 opens full screen; window 2 collapses it to a column;
// closing window 2 expands window 1 back to full screen. The lone-
// column rule is "exactly one column = full width", not "the first
// window is special" - symmetric in both directions.

{
    let columns = stripInsert([], 'A', -1);
    assertEq('cycle: lone window A is full width',
        stripLayout(columns, 0, 0.5)[0].region, { x: 0, width: 1 });
    columns = stripInsert(columns, 'B', 0);
    assertEq('cycle: opening B collapses A to a half-width column',
        stripLayout(columns, 0, 0.5)[0].region, { x: 0, width: 0.5 });
    columns = stripRemove(columns, 'B');
    assertEq('cycle: closing B expands A back to full width',
        stripLayout(columns, 0, 0.5)[0].region, { x: 0, width: 1 });
}

print('');
print(total + ' assertion(s), ' + failures + ' failure(s)');
imports.system.exit(failures === 0 ? 0 : 1);
