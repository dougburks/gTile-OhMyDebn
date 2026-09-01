#!/usr/bin/env gjs
//
// Unit tests for 5.4/screen-area.js's pure usable-area math - no live
// Cinnamon session required. Loads the file by reading and eval()'ing its
// source, same as test-tile-rules.js and test-traditional-tiling.js, for
// the same reason (this file is also embedded byte-for-byte, see
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
const path = GLib.build_filenamev([scriptDir, '..', '5.4', 'screen-area.js']);
const [ok, contents] = GLib.file_get_contents(path);
if (!ok) {
    printerr('Could not read ' + path);
    imports.system.exit(1);
}
eval(imports.byteArray.toString(contents));

const monitor = { x: 0, y: 0, width: 1920, height: 1080 };

assertEq('no panels: the whole monitor is usable',
    computeUsableArea(monitor, []), [0, 0, 1920, 1080]);

assertEq('a non-hideable top panel insets the top edge',
    computeUsableArea(monitor, [{ position: 'top', size: 30, hideable: false }]),
    [0, 30, 1920, 1050]);

assertEq('a hideable top panel is ignored entirely',
    computeUsableArea(monitor, [{ position: 'top', size: 30, hideable: true }]),
    [0, 0, 1920, 1080]);

assertEq('a non-hideable bottom panel insets the bottom edge',
    computeUsableArea(monitor, [{ position: 'bottom', size: 40, hideable: false }]),
    [0, 0, 1920, 1040]);

// Regression: getUsableScreenArea used to pass a panel's HEIGHT for its
// left/right insets instead of its WIDTH (a copy-paste bug from the
// top/bottom cases) - these two cases are exactly what that bug would
// have gotten wrong. A left/right panel's "size" here is its width; if
// this function ever used the wrong dimension by mistake, these
// assertions would only happen to pass when the panel's width and
// height were equal, so a panel deliberately shaped rectangular (not
// square) is used to make sure the bug can't hide again.
assertEq('a non-hideable left panel insets the left edge by its WIDTH, not height',
    computeUsableArea(monitor, [{ position: 'left', size: 200, hideable: false }]),
    [200, 0, 1720, 1080]);
assertEq('a non-hideable right panel insets the right edge by its WIDTH, not height',
    computeUsableArea(monitor, [{ position: 'right', size: 250, hideable: false }]),
    [0, 0, 1670, 1080]);

assertEq('multiple non-hideable panels on different edges all apply',
    computeUsableArea(monitor, [
        { position: 'top', size: 30, hideable: false },
        { position: 'left', size: 200, hideable: false },
        { position: 'right', size: 250, hideable: false },
    ]),
    [200, 30, 1470, 1050]);

assertEq('a monitor offset from the origin is respected',
    computeUsableArea({ x: 1920, y: 0, width: 1920, height: 1080 },
        [{ position: 'top', size: 30, hideable: false }]),
    [1920, 30, 1920, 1050]);

assertEq('insets that would overlap/exceed the monitor clamp to a zero-size rect, not negative',
    computeUsableArea(monitor, [
        { position: 'left', size: 1000, hideable: false },
        { position: 'right', size: 1000, hideable: false },
    ]),
    [1000, 0, 0, 1080]);

print('');
print(total + ' assertion(s), ' + failures + ' failure(s)');
imports.system.exit(failures === 0 ? 0 : 1);
