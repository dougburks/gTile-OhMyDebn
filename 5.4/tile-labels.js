// Pure tile-label letter math for gTile's "Show tile labels" keyboard
// selection - the forward mapping (grid cell index -> the letter drawn
// on the tile, used by GridElement) and the reverse mapping (a pressed
// letter -> grid cell index, used by getGridElementFromLetter) live
// here as one pair so the two can never disagree. Only 52 labels exist
// (a-z, then A-Z reached via Shift); indexes past that get no label
// and no letter reaches them. No imports.gi/global.* references on
// purpose - this exact file is loaded and unit-tested standalone via
// plain `gjs`, with no live Cinnamon session required
// (tests/test-tile-labels.js).
//
// This file is NOT loaded directly by the running extension at runtime -
// gTile.js is a hand-patched compiled webpack bundle with no build step
// (no package.json/webpack config anywhere in this repo), so the block
// below is copied byte-for-byte into gTile.js between the
// "BEGIN/END tile-labels.js" markers instead of being require()'d.
// tests/check-sync.sh fails if the two copies ever drift - keep them
// identical when editing either one.

function tileIndexToLabel(index) {
    if (!Number.isInteger(index) || index < 0 || index >= 52)
        return null;
    if (index < 26)
        return String.fromCharCode('a'.charCodeAt(0) + index);
    return String.fromCharCode('A'.charCodeAt(0) + index - 26);
}

function tileLabelToIndex(letter) {
    if (typeof letter !== 'string' || letter.length !== 1)
        return null;
    const charCode = letter.charCodeAt(0);
    if (charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0))
        return charCode - 'a'.charCodeAt(0);
    if (charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0))
        return charCode - 'A'.charCodeAt(0) + 26;
    return null;
}
