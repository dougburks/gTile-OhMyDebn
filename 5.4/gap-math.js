// Pure window-gap padding math for gTile - given a target rect (the
// grid cell a window is being tiled into), the monitor's usable area,
// and the configured gap size, compute the rect the window should
// actually occupy. This is the fork's signature feature. No
// imports.gi/global.* references on purpose - this exact file is
// loaded and unit-tested standalone via plain `gjs`, with no live
// Cinnamon session required (tests/test-gap-math.js).
//
// This file is NOT loaded directly by the running extension at runtime -
// gTile.js is a hand-patched compiled webpack bundle with no build step
// (no package.json/webpack config anywhere in this repo), so the block
// below is copied byte-for-byte into gTile.js between the
// "BEGIN/END gap-math.js" markers instead of being require()'d.
// tests/check-sync.sh fails if the two copies ever drift - keep them
// identical when editing either one.

// For sides that touch (or extend past) the usable area's edge, keep
// the full gap against that edge. For internal sides (between two
// windows), use HALF the gap on each window so two neighboring tiles
// end up gapSize apart in total. floor()ing the half means an odd
// gapSize leaves neighbors 2 * floor(gapSize / 2) apart rather than
// exactly gapSize - accepted rounding, pinned down by the tests so it
// can't change silently. Sizes clamp at 0 rather than going negative
// when the gap exceeds the rect.
function computeGappedRect(x, y, width, height, usableLeft, usableTop, usableWidth, usableHeight, gapSize) {
    const usableRight = usableLeft + usableWidth;
    const usableBottom = usableTop + usableHeight;
    const halfGap = Math.floor(gapSize / 2);
    let leftPadding = halfGap;
    let rightPadding = halfGap;
    let topPadding = halfGap;
    let bottomPadding = halfGap;
    if (x <= usableLeft)
        leftPadding = gapSize;
    if ((x + width) >= usableRight)
        rightPadding = gapSize;
    if (y <= usableTop)
        topPadding = gapSize;
    if ((y + height) >= usableBottom)
        bottomPadding = gapSize;
    let newWidth = width - (leftPadding + rightPadding);
    let newHeight = height - (topPadding + bottomPadding);
    if (newWidth < 0) newWidth = 0;
    if (newHeight < 0) newHeight = 0;
    return [x + leftPadding, y + topPadding, newWidth, newHeight];
}

// Normalizes a configured gap value into the integer pixel count
// actually used: 0 is valid and stays 0 (a `|| 10`-style fallback at a
// call site once silently turned a configured gap of 0 into 10 - the
// regression the tests pin), negatives clamp to 0, fractions floor,
// and anything non-numeric - or an unset null/undefined - falls back
// to the default of 10.
function normalizeGapSize(value) {
    if (value == null)
        return 10;
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 10;
}
