#!/usr/bin/env gjs
//
// Unit tests for 5.4/gap-math.js's pure gap-padding math - no live
// Cinnamon session required. Loads the file by reading and eval()'ing
// its source, same as the other test-*.js suites, for the same reason
// (this file is also embedded byte-for-byte, see check-sync.sh, inside
// a hand-patched compiled bundle at runtime).

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
const path = GLib.build_filenamev([scriptDir, '..', '5.4', 'gap-math.js']);
const [ok, contents] = GLib.file_get_contents(path);
if (!ok) {
    printerr('Could not read ' + path);
    imports.system.exit(1);
}
eval(imports.byteArray.toString(contents));

// A 1920x1080 monitor with a 40px top panel: usable area starts at
// y=40. gap 10 -> half gap 5.
const U = [0, 40, 1920, 1040]; // usableLeft, usableTop, usableWidth, usableHeight

assertEq('full-area rect touches all four edges: full gap on every side',
    computeGappedRect(0, 40, 1920, 1040, ...U, 10), [10, 50, 1900, 1020]);

assertEq('left-half tile: full gap left/top/bottom, half gap on the internal right side',
    computeGappedRect(0, 40, 960, 1040, ...U, 10), [10, 50, 945, 1020]);

assertEq('right-half tile: half gap on the internal left side, full gap right/top/bottom',
    computeGappedRect(960, 40, 960, 1040, ...U, 10), [965, 50, 945, 1020]);

// The point of the half-gap scheme: two adjacent tiles end up exactly
// gapSize apart. Left tile's right edge = 10+945 = 955; right tile's
// left edge = 965; 965 - 955 = 10 = the gap.
{
    const left = computeGappedRect(0, 40, 960, 1040, ...U, 10);
    const right = computeGappedRect(960, 40, 960, 1040, ...U, 10);
    assertEq('two adjacent half tiles are exactly gapSize apart',
        right[0] - (left[0] + left[2]), 10);
}

assertEq('an interior rect (a middle cell, touching no edges) gets half gap on all sides',
    computeGappedRect(640, 300, 640, 400, ...U, 10), [645, 305, 630, 390]);

assertEq('a rect extending past the usable area still counts as touching that edge (<=/>=, not ==)',
    computeGappedRect(-5, 30, 1930, 1060, ...U, 10), [5, 40, 1910, 1040]);

// Odd gap: floor(9/2) = 4, so internal sides pad by 4 and adjacent
// tiles end up 8 apart, not 9 - accepted rounding, pinned here so it
// can't change silently.
assertEq('odd gap size floors the half gap (internal sides pad by floor(gap/2))',
    computeGappedRect(640, 300, 640, 400, ...U, 9), [644, 304, 632, 392]);

// A second monitor to the right of the first: its usable area starts at
// x=1920, so "touches the left edge" means x <= 1920 there, not x <= 0 -
// the case a single-monitor test suite never exercises.
{
    const U2 = [1920, 0, 2560, 1440];
    assertEq('offset monitor: left-half tile at the monitor\'s own left edge gets the full gap there',
        computeGappedRect(1920, 0, 1280, 1440, ...U2, 10), [1930, 10, 1265, 1420]);
    assertEq('offset monitor: right-half tile gets the half gap on its internal left side',
        computeGappedRect(3200, 0, 1280, 1440, ...U2, 10), [3205, 10, 1265, 1420]);
}

assertEq('gap of 0 leaves the rect untouched',
    computeGappedRect(0, 40, 960, 1040, ...U, 0), [0, 40, 960, 1040]);

assertEq('a gap larger than the rect clamps width/height to 0, not negative',
    computeGappedRect(0, 0, 15, 15, 0, 0, 15, 15, 10), [10, 10, 0, 0]);

// --- normalizeGapSize (the raw-setting-value -> pixel-count guard) ---

// The regression this pins: a `|| 10`-style fallback at the call site
// once silently turned a configured gap of 0 (the schema's own
// minimum) into 10.
assertEq('a configured gap of 0 stays 0, not the default',
    normalizeGapSize(0), 0);
assertEq('a normal value passes through', normalizeGapSize(15), 15);
assertEq('a numeric string is accepted', normalizeGapSize('15'), 15);
assertEq('a fractional value floors', normalizeGapSize(7.9), 7);
assertEq('a negative value clamps to 0', normalizeGapSize(-5), 0);
assertEq('an unset (null) value falls back to the default of 10',
    normalizeGapSize(null), 10);
assertEq('an unset (undefined) value falls back to the default of 10',
    normalizeGapSize(undefined), 10);
assertEq('a non-numeric value falls back to the default of 10',
    normalizeGapSize('abc'), 10);
assertEq('Infinity falls back to the default rather than an infinite gap',
    normalizeGapSize(Infinity), 10);

// --- HiDPI: the gap setting is logical pixels, window geometry physical ---
assertEq('UI scale: 2 (a 200% HiDPI screen) is used as-is', normalizeUiScale(2), 2);
assertEq('UI scale: a fractional scale is used as-is', normalizeUiScale(1.5), 1.5);
assertEq('UI scale: missing (undefined) falls back to 1', normalizeUiScale(undefined), 1);
assertEq('UI scale: 0 falls back to 1 rather than collapsing every size', normalizeUiScale(0), 1);
assertEq('UI scale: a negative or non-numeric scale falls back to 1',
    [normalizeUiScale(-2), normalizeUiScale('abc'), normalizeUiScale(Infinity)], [1, 1, 1]);
assertEq('physical gap: at 1x the gap is unchanged', physicalGapSize(10, 1), 10);
assertEq('physical gap: at 2x a 10px gap is 20 physical px (it used to stay 10, half as wide on screen)',
    physicalGapSize(10, 2), 20);
assertEq('physical gap: a gap of 0 stays 0 at any scale', physicalGapSize(0, 2), 0);
assertEq('physical gap: fractional results round to whole pixels', physicalGapSize(5, 1.5), 8);
assertEq('physical gap: no scale available behaves like 1x', physicalGapSize(10, undefined), 10);
assertEq('a full-area tile at 2x: 20px from every edge of the usable area',
    computeGappedRect(0, 40, 1920, 1040, ...U, physicalGapSize(10, 2)), [20, 60, 1880, 1000]);

print('');
print(total + ' assertion(s), ' + failures + ' failure(s)');
imports.system.exit(failures === 0 ? 0 : 1);
