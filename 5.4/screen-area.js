// Pure usable-area math for gTile - given a monitor's rect and a plain
// description of the panels docked on it, compute the rect actually
// available for tiling once non-hideable panels' insets are subtracted.
// No imports.gi/global.* references on purpose - this exact file is
// loaded and unit-tested standalone via plain `gjs`, with no live
// Cinnamon session required (tests/test-screen-area.js).
//
// This file is NOT loaded directly by the running extension at runtime -
// gTile.js is a hand-patched compiled webpack bundle with no build step
// (no package.json/webpack config anywhere in this repo), so the block
// below is copied byte-for-byte into gTile.js between the
// "BEGIN/END screen-area.js" markers instead of being require()'d.
// tests/check-sync.sh fails if the two copies ever drift - keep them
// identical when editing either one.
//
// gTile.js's own getUsableScreenArea(monitor) is the thin impure wrapper
// around this: it maps Cinnamon's live Panel objects (panel.panelPosition,
// panel.isHideable(), panel.actor.get_height()/get_width()) into the
// plain `{ position, size, hideable }` descriptors this function takes,
// then calls computeUsableArea and returns its result unchanged. `size`
// is whichever dimension actually eats into the usable area for that
// panel's position - height for a top/bottom panel, width for a
// left/right one. (A pre-existing bug used height for left/right panels
// too, silently miscomputing the usable area's X-inset for anyone who
// docks a panel to the side - this file exists so that class of bug gets
// caught by a test instead of sitting undetected the way that one did.)

function computeUsableArea(monitor, panels) {
    let top = monitor.y;
    let bottom = monitor.y + monitor.height;
    let left = monitor.x;
    let right = monitor.x + monitor.width;
    for (const panel of panels) {
        if (panel.hideable) continue;
        switch (panel.position) {
            case 'top':
                top += panel.size;
                break;
            case 'bottom':
                bottom -= panel.size;
                break;
            case 'left':
                left += panel.size;
                break;
            case 'right':
                right -= panel.size;
                break;
        }
    }
    const width = right > left ? right - left : 0;
    const height = bottom > top ? bottom - top : 0;
    return [left, top, width, height];
}
