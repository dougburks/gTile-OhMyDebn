#!/usr/bin/env gjs
//
// Unit tests for 5.4/grid-ui-math.js - the pure decision logic behind the
// grid popup UI (monitor lookup, popup clamping, current-grid selection,
// keyboard-cursor lookup). No live Cinnamon session required; monitors,
// grids and elements are plain objects/tokens. Loads the file by reading
// and eval()'ing its source, same as the other test-*.js suites, for the
// same reason (this file is also embedded byte-for-byte, see
// check-sync.sh, inside a hand-patched compiled bundle at runtime).
//
// Three of the four helpers exist because of inherited upstream bugs
// found in review; each such case below is marked "(the bug)".

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
const path = GLib.build_filenamev([scriptDir, '..', '5.4', 'grid-ui-math.js']);
const [ok, contents] = GLib.file_get_contents(path);
if (!ok) {
    printerr('Could not read ' + path);
    imports.system.exit(1);
}
eval(imports.byteArray.toString(contents));

// --- monitorForIndex ---

const primary = { index: 0, x: 0, y: 0, width: 1920, height: 1080 };
const second = { index: 1, x: 1920, y: 0, width: 2560, height: 1440 };

assertEq('monitorForIndex: finds a monitor by its .index',
    monitorForIndex([primary, second], 1, primary), second);
assertEq('monitorForIndex: get_monitor() == -1 (window on no monitor) falls back instead of yielding undefined (the bug)',
    monitorForIndex([primary, second], -1, primary), primary);
assertEq('monitorForIndex: an index past the end falls back',
    monitorForIndex([primary, second], 7, primary), primary);
assertEq('monitorForIndex: matches on .index, not array position',
    monitorForIndex([second, primary], 0, second), primary);
assertEq('monitorForIndex: empty monitor list falls back',
    monitorForIndex([], 0, primary), primary);

// --- clampGridTopLeft ---
// Popup 300x200 on a 1920x1080 monitor at the origin.

assertEq('clamp: a centred window gives a centred popup',
    clampGridTopLeft(960, 540, 300, 200, primary), [810, 440]);
assertEq('clamp: window centre 10px from the left edge pins the popup to x=0, not x=-140 (the bug)',
    clampGridTopLeft(10, 540, 300, 200, primary), [0, 440]);
assertEq('clamp: window centre 10px from the top edge pins the popup to y=0 (the bug)',
    clampGridTopLeft(960, 10, 300, 200, primary), [810, 0]);
assertEq('clamp: window centre 10px from the right edge keeps the popup fully on screen, not a full width too far in',
    clampGridTopLeft(1910, 540, 300, 200, primary), [1620, 440]);
assertEq('clamp: window centre 10px from the bottom edge keeps the popup fully on screen',
    clampGridTopLeft(960, 1070, 300, 200, primary), [810, 880]);
assertEq('clamp: exactly at the corner limits is unchanged',
    clampGridTopLeft(150, 100, 300, 200, primary), [0, 0]);
assertEq('clamp: an offset second monitor clamps against its own origin, not x=0',
    clampGridTopLeft(1925, 700, 300, 200, second), [1920, 600]);
assertEq('clamp: right edge of an offset monitor',
    clampGridTopLeft(4470, 700, 300, 200, second), [4180, 600]);
assertEq('clamp: a popup larger than the monitor pins to the monitor origin',
    clampGridTopLeft(960, 540, 2000, 1200, primary), [0, 0]);
assertEq('clamp: fractional centres are floored',
    clampGridTopLeft(960.5, 540.5, 301, 201, primary), [810, 440]);

// --- selectCurrentGrid ---

const gridOnPrimary = { monitor: primary, name: 'g0' };
const gridOnSecond = { monitor: second, name: 'g1' };

assertEq('current grid: single-grid mode returns the only grid even when it has already moved to another monitor than App.currentMonitor (the bug)',
    selectCurrentGrid([gridOnSecond], false, 0), gridOnSecond);
assertEq('current grid: single-grid mode, the ordinary case',
    selectCurrentGrid([gridOnPrimary], false, 0), gridOnPrimary);
assertEq('current grid: per-monitor mode looks up by the current monitor index',
    selectCurrentGrid([gridOnPrimary, gridOnSecond], true, 1), gridOnSecond);
assertEq('current grid: per-monitor mode with no grid on that monitor yields undefined (caller guards)',
    selectCurrentGrid([gridOnPrimary, gridOnSecond], true, 5), undefined);
assertEq('current grid: single-grid mode with no grids yet yields undefined',
    selectCurrentGrid([], false, 0), undefined);

// --- keyCursorFits ---

assertEq('cursor fits: no cursor (-1/-1) always fits', keyCursorFits(-1, -1, 2, 2), true);
assertEq('cursor fits: last cell of a 3x2 grid fits', keyCursorFits(2, 1, 3, 2), true);
assertEq('cursor fits: column past a narrower new grid does not', keyCursorFits(3, 0, 3, 2), false);
assertEq('cursor fits: row past a shorter new grid does not', keyCursorFits(0, 2, 3, 2), false);

// --- resolveKeyElement ---
// Elements are rows of columns of opaque tokens, as Grid builds them.

const elements = [['r0c0', 'r0c1', 'r0c2'], ['r1c0', 'r1c1', 'r1c2']];

assertEq('key element: no cursor yet resolves to null', resolveKeyElement(elements, -1, -1), null);
assertEq('key element: in-range cursor resolves to that cell', resolveKeyElement(elements, 1, 2), 'r1c2');
assertEq('key element: row past the end resolves to null', resolveKeyElement(elements, 2, 0), null);
assertEq('key element: column past the end resolves to null', resolveKeyElement(elements, 0, 3), null);
assertEq('key element: a rebuilt (new) elements array resolves to the NEW cell, never a token from the old build (the bug)',
    resolveKeyElement([['new00', 'new01'], ['new10', 'new11']], 1, 1), 'new11');
assertEq('key element: empty elements resolves to null', resolveKeyElement([], 0, 0), null);

// --- HiDPI: popup sizes set from JavaScript are physical pixels ---
assertEq('popup metrics at 1x: the original 1x layout',
    gridPopupMetrics(1), { tableWidth: 220, tableHeight: 200, panelBorderOffset: 40, borderWidth: 2, iconSize: 24 });
assertEq('popup metrics at 2x: everything doubled, matching the stylesheet St doubles (it used to stay at 1x)',
    gridPopupMetrics(2), { tableWidth: 440, tableHeight: 400, panelBorderOffset: 80, borderWidth: 4, iconSize: 48 });
assertEq('popup metrics: panel = table + border offset scales together at 2x',
    gridPopupMetrics(2).tableWidth + gridPopupMetrics(2).panelBorderOffset, 2 * (220 + 40));
assertEq('table size without aspect ratio: 220x200 at 1x', gridTableSize(false, { widthIsLonger: true, ratio: 1.5 }, 1), [220, 200]);
assertEq('table size without aspect ratio: 440x400 at 2x', gridTableSize(false, { widthIsLonger: true, ratio: 1.5 }, 2), [440, 400]);
assertEq('table size following a 3:2 landscape monitor at 1x', gridTableSize(true, { widthIsLonger: true, ratio: 1.5 }, 1), [300, 200]);
assertEq('table size following a 3:2 landscape monitor at 2x', gridTableSize(true, { widthIsLonger: true, ratio: 1.5 }, 2), [600, 400]);
assertEq('table size following a portrait monitor at 2x', gridTableSize(true, { widthIsLonger: false, ratio: 1.5 }, 2), [400, 600]);

print('');
print(total + ' assertion(s), ' + failures + ' failure(s)');
imports.system.exit(failures === 0 ? 0 : 1);
