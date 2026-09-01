// Pure tile-rule-matching and grid-math helpers for gTile's window-created
// auto-tile handler (see gTile.js). No imports.gi/global.* references on
// purpose - this exact file is loaded and unit-tested standalone via plain
// `gjs`, with no live Cinnamon session required (tests/test-tile-rules.js).
//
// This file is NOT loaded directly by the running extension at runtime -
// gTile.js is a hand-patched compiled webpack bundle with no build step
// (no package.json/webpack config anywhere in this repo), so the block
// below is copied byte-for-byte into gTile.js between the
// "BEGIN/END tile-rules.js" markers instead of being require()'d.
// tests/check-sync.sh fails if the two copies ever drift - keep them
// identical when editing either one.

function matchTileRule(wmClass, title, rules) {
    for (const rule of rules) {
        if (rule.wmClass !== wmClass) continue;
        if (rule.titleRegex && !new RegExp(rule.titleRegex).test(title || '')) continue;
        return rule.grid;
    }
    return null;
}

function computeGridRect(screenX, screenY, screenWidth, screenHeight, cols, rows, colIndex, rowIndex, colSpan, rowSpan) {
    // Same "> 0 or fall back to 1" guard colSpan/rowSpan already get below -
    // cols/rows come from the same untrusted places (tile-rules.json, the
    // DBus control interface) and feed the same division; a 0 (or negative,
    // or non-numeric) value here produces Infinity/NaN that flows straight
    // into a native Meta window-resize call, which this session's own
    // crash debugging established is not something a JS try/catch around
    // the call site can protect against.
    const widthUnit = Math.floor(screenWidth / (cols > 0 ? cols : 1));
    const heightUnit = Math.floor(screenHeight / (rows > 0 ? rows : 1));
    const areaX = screenX + (colIndex * widthUnit);
    const areaY = screenY + (rowIndex * heightUnit);
    const areaWidth = widthUnit * (colSpan > 0 ? colSpan : 1);
    const areaHeight = heightUnit * (rowSpan > 0 ? rowSpan : 1);
    return [areaX, areaY, areaWidth, areaHeight];
}
