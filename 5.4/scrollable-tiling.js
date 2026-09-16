// Pure column-strip logic for gTile's "Scrollable tiling" mode - a
// Niri-style scrolling layout: every window is its own full-height
// column in a per monitor+workspace horizontal strip, and the screen
// is a viewport sliding over that strip. Columns outside the viewport
// are minimized by the impure layer (an X11 WM extension can't hang
// windows off the screen edge the way the Niri compositor does -
// beyond one monitor's edge IS the next monitor), so scrolling is
// paged rather than pixel-smooth. One deliberate exception to Niri's
// "your window never resizes because of other windows" rule, borrowed
// from Omarchy's Hyprland setup: a LONE column always fills the whole
// screen, collapsing to its configured width when a second column
// appears and expanding again when it is alone - the invariant is
// "exactly one column = full width", not "the first window is
// special", so it stays symmetric across opens and closes. Windows
// are opaque tokens compared by identity; regions are fractions
// (0..1) of the usable monitor area's width (columns are always full
// height). No imports.gi/global.* references on purpose - this exact
// file is loaded and unit-tested standalone via plain `gjs`, with no
// live Cinnamon session required (tests/test-scrollable-tiling.js).
//
// This file is NOT loaded directly by the running extension at runtime -
// gTile.js is a hand-patched compiled webpack bundle with no build step
// (no package.json/webpack config anywhere in this repo), so the block
// below is copied byte-for-byte into gTile.js between the
// "BEGIN/END scrollable-tiling.js" markers instead of being require()'d.
// tests/check-sync.sh fails if the two copies ever drift - keep them
// identical when editing either one.

// Bounds shared with settings-schema.json's spinbuttons (the schema
// test cross-checks them, so the code's clamps and the UI's limits can't
// drift apart again). Column width tops out at 50%: anything wider fits
// only one column per screen, leaving the rest blank. var, not const -
// same eval() scoping reason as TILING_MODE_CYCLE below.
var SCROLLABLE_COLUMN_WIDTH_MIN_PERCENT = 20;
var SCROLLABLE_COLUMN_WIDTH_MAX_PERCENT = 50;
var SCROLL_ANIMATION_MAX_MS = 500;

// The "scrollable-column-width" setting is a percent - normalize it
// into the (0..1] width fraction the rest of this file uses: null,
// anything that doesn't coerce to a finite number, or non-positive
// falls back to 50%, and other values clamp to the schema's bounds so
// the division in stripVisibleCount below can't blow up.
function columnWidthFraction(percent) {
    const n = Number(percent);
    if (!Number.isFinite(n) || n <= 0)
        return 0.5;
    return Math.min(SCROLLABLE_COLUMN_WIDTH_MAX_PERCENT, Math.max(SCROLLABLE_COLUMN_WIDTH_MIN_PERCENT, n)) / 100;
}

// The "scroll-animation-duration" setting is milliseconds - 0 is a
// real value meaning "no tiling animation" (pinned by the tests so
// the disable contract can't silently break), negatives clamp to 0,
// fractions floor, values past the schema's maximum clamp down, and
// anything that doesn't coerce to a finite number - or an unset
// null/undefined - falls back to the default of 200.
function normalizeScrollDuration(ms) {
    if (ms == null)
        return 200;
    const n = Number(ms);
    if (!Number.isFinite(n))
        return 200;
    return Math.min(SCROLL_ANIMATION_MAX_MS, Math.max(0, Math.floor(n)));
}

// The tiling-mode cycle driven by the "cycle tiling mode" hotkeys and
// the CycleTilingMode DBus method. Mode-level rather than
// scrollable-specific, but it lives in this file to share the
// embed/test infrastructure. The order matches the settings
// combobox top to bottom by convention; the settings-schema test
// cross-checks that this list and the combobox options are the same
// set, so a mode can't be added to one and forgotten in the other.
// var, not const - same eval() scoping reason as TREE_FULL_REGION in
// traditional-tiling.js.
var TILING_MODE_CYCLE = ['off', 'rules', 'traditional', 'traditional-full', 'scrollable'];

// Next mode in the cycle: direction < 0 steps backward, anything else
// forward, wrapping at both ends. An unknown/unset current mode lands
// on 'off' - the schema default and the safest state to recover into.
function nextTilingMode(current, direction) {
    const index = TILING_MODE_CYCLE.indexOf(current);
    if (index === -1)
        return 'off';
    const step = direction < 0 ? -1 : 1;
    const length = TILING_MODE_CYCLE.length;
    return TILING_MODE_CYCLE[(index + step + length) % length];
}

// How many whole columns fit in the viewport at once. The epsilon
// absorbs float noise like 1 / (1/3) = 3.0000000000000004.
function stripVisibleCount(widthFraction) {
    if (!Number.isFinite(widthFraction) || widthFraction <= 0 || widthFraction > 1)
        return 1;
    return Math.max(1, Math.floor(1 / widthFraction + 1e-9));
}

// Insert `newWindow` as a new column directly right of column
// `afterIndex` (the Niri rule: new columns open right of the focused
// one); an invalid/absent afterIndex appends at the end of the strip.
// Returns a new array - never mutates the input.
function stripInsert(columns, newWindow, afterIndex) {
    const next = columns.slice();
    if (Number.isInteger(afterIndex) && afterIndex >= 0 && afterIndex < columns.length)
        next.splice(afterIndex + 1, 0, newWindow);
    else
        next.push(newWindow);
    return next;
}

// Remove `window`'s column. An unknown window returns the input array
// itself (same reference - callers may use that to skip a re-layout).
function stripRemove(columns, window) {
    const index = columns.indexOf(window);
    if (index === -1)
        return columns;
    const next = columns.slice();
    next.splice(index, 1);
    return next;
}

// Swap `window`'s column with its neighbor (direction < 0 = left,
// otherwise right). No-op (input array returned unchanged, same
// reference) at the strip's edges or for an unknown window.
function stripMoveColumn(columns, window, direction) {
    const index = columns.indexOf(window);
    if (index === -1)
        return columns;
    const target = index + (direction < 0 ? -1 : 1);
    if (target < 0 || target >= columns.length)
        return columns;
    const next = columns.slice();
    next[index] = next[target];
    next[target] = window;
    return next;
}

// The viewport rule: clamp firstVisible into the strip, then shift it
// the MINIMAL amount needed to bring targetIndex fully into view
// (Niri's own scroll behavior - the view never jumps further than it
// has to). Pass a null/invalid targetIndex to just clamp.
function scrollToShow(firstVisible, targetIndex, visibleCount, columnCount) {
    let fv = Number.isInteger(firstVisible) ? firstVisible : 0;
    fv = Math.min(Math.max(0, fv), Math.max(0, columnCount - visibleCount));
    if (Number.isInteger(targetIndex) && targetIndex >= 0 && targetIndex < columnCount) {
        if (targetIndex < fv)
            fv = targetIndex;
        else if (targetIndex > fv + visibleCount - 1)
            fv = targetIndex - visibleCount + 1;
    }
    return fv;
}

// Full per-column layout for the current viewport: one entry per
// column, in strip order - { window, visible, region }. Off-viewport
// columns get visible: false and a null region (the impure layer
// minimizes them; there is no meaningful on-screen rect). The lone-
// column full-width rule lives here, so every caller gets it for
// free.
function stripLayout(columns, firstVisible, widthFraction) {
    if (columns.length === 1)
        return [{ window: columns[0], visible: true, region: { x: 0, width: 1 } }];
    const visibleCount = stripVisibleCount(widthFraction);
    const fv = scrollToShow(firstVisible, null, visibleCount, columns.length);
    const layout = [];
    for (let i = 0; i < columns.length; i++) {
        const visible = i >= fv && i < fv + visibleCount;
        layout.push({
            window: columns[i],
            visible: visible,
            region: visible ? { x: (i - fv) * widthFraction, width: widthFraction } : null,
        });
    }
    return layout;
}
