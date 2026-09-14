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
        if (!rule) continue;
        if (rule.wmClass !== wmClass) continue;
        if (rule.titleRegex) {
            // A malformed titleRegex in one rule must only disable that
            // one rule - an uncaught throw here would abort the whole
            // loop and silently kill rule matching for every window.
            let titleRe;
            try {
                titleRe = new RegExp(rule.titleRegex);
            } catch (e) {
                continue;
            }
            if (!titleRe.test(title || '')) continue;
        }
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

// Validates a tile request against its own grid (used by the DBus
// TileFocusedWindow handler; tile-rules.json requests get their own
// lighter guard since that file is root-owned). Returns null when the
// request is invalid - a non-positive grid, or an index outside it,
// would either divide by zero (Infinity/NaN geometry straight into a
// native Meta resize call, not catchable from JS) or place the window
// arbitrarily far offscreen. Otherwise returns { colSpan, rowSpan }:
// the requested spans with the usual "> 0 integer or fall back to 1"
// guard applied, then clamped to what actually fits between the index
// and the grid's far edge.
function validateTileArgs(cols, rows, colIndex, rowIndex, colSpanRaw, rowSpanRaw) {
    if (!Number.isInteger(cols) || !Number.isInteger(rows) ||
        !Number.isInteger(colIndex) || !Number.isInteger(rowIndex))
        return null;
    if (cols <= 0 || rows <= 0 ||
        colIndex < 0 || colIndex >= cols ||
        rowIndex < 0 || rowIndex >= rows)
        return null;
    const colSpan = Math.min((Number.isInteger(colSpanRaw) && colSpanRaw > 0) ? colSpanRaw : 1, cols - colIndex);
    const rowSpan = Math.min((Number.isInteger(rowSpanRaw) && rowSpanRaw > 0) ? rowSpanRaw : 1, rows - rowIndex);
    return { colSpan: colSpan, rowSpan: rowSpan };
}
