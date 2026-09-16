// Pure decision logic behind gTile's grid popup UI: which monitor a
// window is on, where the popup may sit on that monitor, which Grid is
// "current", and which grid element the keyboard cursor points at. Each
// of these used to be an inline expression in gTile.js's App/Grid code,
// and three of them carried inherited-from-upstream bugs that a unit test
// would have caught (see each function's comment). No imports.gi/global.*
// references on purpose - this exact file is loaded and unit-tested
// standalone via plain `gjs`, with no live Cinnamon session required
// (tests/test-grid-ui-math.js); monitors, grids and elements are plain
// objects/tokens here.
//
// This file is NOT loaded directly by the running extension at runtime -
// gTile.js is a hand-patched compiled webpack bundle with no build step
// (no package.json/webpack config anywhere in this repo), so the block
// below is copied byte-for-byte into gTile.js between the
// "BEGIN/END grid-ui-math.js" markers instead of being require()'d.
// tests/check-sync.sh fails if the two copies ever drift - keep them
// identical when editing either one.

// The monitor whose .index is `monitorIndex`, else `fallback`. Meta's
// window.get_monitor() returns -1 for a window that isn't on any monitor
// (mid-unmanage, or during a monitor change), and layoutManager.monitors
// is looked up by .index rather than array position on purpose: the two
// usually agree, but nothing guarantees it. gTile.js used to index the
// array directly (this.monitors[win.get_monitor()]) in one place and
// .find() with a fallback in another; -1 through the former produced
// `undefined` and a throw on the next property access.
function monitorForIndex(monitors, monitorIndex, fallback) {
    for (const monitor of monitors) {
        if (monitor.index === monitorIndex) return monitor;
    }
    return fallback;
}

// Top-left [x, y] for a popup of gridWidth x gridHeight whose *centre*
// should sit at (centerX, centerY), kept fully inside `monitor`. The
// upstream code clamped the centre point as if it were the top-left
// corner and only then subtracted half the size, so a window centred
// near the left/top edge put the popup half off-screen while one near
// the right/bottom edge was pushed a full popup-width too far in. Clamp
// the actual corner instead. A popup larger than the monitor pins to
// the monitor's origin (its left/top edge stays reachable).
function clampGridTopLeft(centerX, centerY, gridWidth, gridHeight, monitor) {
    let x = centerX - gridWidth / 2;
    let y = centerY - gridHeight / 2;
    const maxX = monitor.x + monitor.width - gridWidth;
    const maxY = monitor.y + monitor.height - gridHeight;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;
    if (x < monitor.x) x = monitor.x;
    if (y < monitor.y) y = monitor.y;
    return [Math.floor(x), Math.floor(y)];
}

// The Grid the App should act on. With showGridOnAllMonitors off there
// is exactly one Grid and it follows the focused window from monitor to
// monitor - so it must be selected as "the only grid", not looked up by
// monitor: ShowUI moves that grid to the focused window's monitor
// *before* App.currentMonitor is brought up to date, and looking it up
// by the stale currentMonitor during that gap returned undefined and
// threw (leaving the popup open with no key controls, and every later
// focus change throwing the same way). With one grid per monitor, the
// lookup by the current monitor's index is the right one.
function selectCurrentGrid(grids, showGridOnAllMonitors, currentMonitorIndex) {
    if (!showGridOnAllMonitors) return grids[0];
    for (const grid of grids) {
        if (grid.monitor.index === currentMonitorIndex) return grid;
    }
    return undefined;
}

// Whether a keyboard cursor at (colKey, rowKey) still fits a grid of
// `cols` x `rows` cells; -1/-1 (no cursor yet) is always fine.
function keyCursorFits(colKey, rowKey, cols, rows) {
    return colKey < cols && rowKey < rows;
}

// The element the keyboard cursor points at in a freshly built 2-D
// `elements` array (rows of columns), or null when there is no cursor
// or it is out of range. Grid rebuilt its elements (switching grid
// layout, a settings change) but kept `keyElement` pointing at the
// destroyed element from the previous build, whose delegate no longer
// had any listeners - so Space after a rebuild silently did nothing, or
// threw on a smaller grid. Re-resolving through this after every
// rebuild (and after every key press, as before) keeps the cursor on a
// live element.
function resolveKeyElement(elements, rowKey, colKey) {
    if (rowKey < 0 || colKey < 0) return null;
    const row = elements[rowKey];
    if (!row) return null;
    return row[colKey] || null;
}
