// Pure state-transition logic for gTile's two "traditional tiling"
// modes - dynamic-tiling cycles that sweep every new window into a
// binary-tree layout instead of matching named apps (see tile-rules.js).
// Modeled on Hyprland's "dwindle" layout (itself modeled on bspwm): every
// window is a leaf in a per monitor+workspace binary tree; each new
// window splits the current insertion point's region in half,
// alternating vertical/horizontal by tree depth; closing a window
// collapses its parent into its sibling and re-derives geometry through
// the affected subtree, so survivors reclaim the freed space - a real
// rebalance, not the "leave a gap until something else reuses it" a
// flat-pointer design would give.
//
// Two modes share this exact same tree - "Traditional tiling" is
// "Traditional Full" capped at 3 leaves: once a tree already has 3
// leaves, the *next* window discards it and starts a fresh one-leaf tree
// instead of splitting further (matching the shipped "window 4 covers
// whatever's already there" behavior) - passed as `maxLeaves` to
// treeInsert (3 for capped, null for uncapped).
//
// Regions are fractions (0..1) of the usable monitor area, not pixels or
// a grid - converted to pixels at the point of application. No
// imports.gi/global.* references on purpose - this exact file is loaded
// and unit-tested standalone via plain `gjs`, with no live Cinnamon
// session required, using opaque tokens standing in for real
// Meta.Window objects (tests/test-traditional-tiling.js).
//
// This file is NOT loaded directly by the running extension at runtime -
// gTile.js is a hand-patched compiled webpack bundle with no build step
// (no package.json/webpack config anywhere in this repo), so the block
// below is copied byte-for-byte into gTile.js between the
// "BEGIN/END traditional-tiling.js" markers instead of being require()'d.
// tests/check-sync.sh fails if the two copies ever drift - keep them
// identical when editing either one.

// var, not const: this file's contents get eval()'d both by the test
// runner and (once copied into gTile.js) inside the extension bundle -
// eval() only leaks var/function declarations into the calling scope,
// not const/let ones, so const here would silently vanish after eval.
var TREE_FULL_REGION = { x: 0, y: 0, width: 1, height: 1 };

function treeLeafDepth(leaf) {
    let depth = 0;
    let node = leaf;
    while (node.parent) {
        depth++;
        node = node.parent;
    }
    return depth;
}

// Splits `leaf` into a new split node with two leaf children - `first`
// keeps the existing window in the first half, `second` gets `newWindow`
// in the second half. Axis alternates by the leaf's own current depth
// (even depth = vertical/side-by-side, odd = horizontal/stacked) rather
// than a separately-tracked counter, so it self-corrects after any
// rebalance instead of needing to be kept in sync by hand. Does not
// splice the new split node into the tree - the caller does that (the
// two callers, treeInsert and a fresh-tree start, need it done
// differently).
function treeSplitLeaf(leaf, newWindow) {
    const depth = treeLeafDepth(leaf);
    const vertical = depth % 2 === 0;
    const region = leaf.region;
    let firstRegion, secondRegion;
    if (vertical) {
        const half = region.width / 2;
        firstRegion = { x: region.x, y: region.y, width: half, height: region.height };
        secondRegion = { x: region.x + half, y: region.y, width: half, height: region.height };
    } else {
        const half = region.height / 2;
        firstRegion = { x: region.x, y: region.y, width: region.width, height: half };
        secondRegion = { x: region.x, y: region.y + half, width: region.width, height: half };
    }
    const splitNode = { type: 'split', vertical: vertical, region: region, parent: leaf.parent, first: null, second: null };
    // Mutate `leaf` in place instead of creating a new object for the
    // pre-existing window's half. Any long-lived reference captured
    // elsewhere - specifically the 'unmanaging' closure in gTile.js,
    // which captures a leaf reference once at insert time for O(1)
    // removal later - must keep tracking this window's CURRENT position
    // for its entire lifetime in the tree, including through later
    // splits. Creating a fresh object here left that captured reference
    // pointing at an orphaned copy the instant a second window split it,
    // which silently skipped that window's own rebalance-on-close AND
    // (once a sibling's removal later looked up the *current* object and
    // tried to move_resize_window the now-already-destroyed original
    // window) crashed Cinnamon outright - confirmed by tracing the exact
    // "open A, open B, close A, close B" repro against this code.
    leaf.region = firstRegion;
    leaf.parent = splitNode;
    const secondLeaf = { type: 'leaf', window: newWindow, region: secondRegion, parent: splitNode };
    splitNode.first = leaf;
    splitNode.second = secondLeaf;
    return { splitNode: splitNode, firstLeaf: leaf, secondLeaf: secondLeaf };
}

// state: { root, insertionLeaf, leafCount } - pass { root: null,
// insertionLeaf: null, leafCount: 0 } for an empty/new tree. maxLeaves:
// 3 for the capped mode, null (or any falsy value) for uncapped
// "Traditional Full".
//
// Returns { root, insertionLeaf, leafCount, moves }. moves lists windows
// that were ALREADY placed and need to physically move to make room
// (just the one old window, when a split happens; empty when starting a
// fresh tree, since nothing existing needs to move) - it does NOT
// include newWindow itself, which the caller places via its own
// hide-until-settled sequence instead, using the returned
// insertionLeaf's region.
function treeInsert(state, newWindow, maxLeaves) {
    if (!state.root || (maxLeaves && state.leafCount >= maxLeaves)) {
        const rootLeaf = { type: 'leaf', window: newWindow, region: TREE_FULL_REGION, parent: null };
        return { root: rootLeaf, insertionLeaf: rootLeaf, leafCount: 1, moves: [] };
    }
    const split = treeSplitLeaf(state.insertionLeaf, newWindow);
    if (split.splitNode.parent) {
        if (split.splitNode.parent.first === state.insertionLeaf) {
            split.splitNode.parent.first = split.splitNode;
        } else {
            split.splitNode.parent.second = split.splitNode;
        }
    }
    const newRoot = split.splitNode.parent ? state.root : split.splitNode;
    return {
        root: newRoot,
        insertionLeaf: split.secondLeaf,
        leafCount: state.leafCount + 1,
        moves: [{ window: split.firstLeaf.window, region: split.firstLeaf.region }],
    };
}

// Removes `leaf` (the specific node reference captured when its window
// was inserted - O(1), no tree search) from `state`'s tree: its sibling
// absorbs the freed space, and every leaf in that sibling's subtree gets
// its geometry re-derived and reported in `moves` - not just the direct
// sibling, since collapsing an interior node can require repositioning
// several windows at once (matches Hyprland's own dwindle behavior, not
// an OhMyDebn-specific choice). Each split node's own stored
// vertical/horizontal orientation is preserved through a collapse, not
// recomputed from the sibling's new (shallower) depth - only regions
// change.
function treeRemove(state, leaf) {
    if (!leaf.parent) {
        return { root: null, insertionLeaf: null, leafCount: 0, moves: [] };
    }
    const parent = leaf.parent;
    const sibling = parent.first === leaf ? parent.second : parent.first;
    const grandparent = parent.parent;
    sibling.parent = grandparent;
    if (grandparent) {
        if (grandparent.first === parent) {
            grandparent.first = sibling;
        } else {
            grandparent.second = sibling;
        }
    }
    const newRoot = grandparent ? state.root : sibling;

    const moves = [];
    const resize = (node, region) => {
        node.region = region;
        if (node.type === 'leaf') {
            moves.push({ window: node.window, region: region });
            return;
        }
        if (node.vertical) {
            const half = region.width / 2;
            resize(node.first, { x: region.x, y: region.y, width: half, height: region.height });
            resize(node.second, { x: region.x + half, y: region.y, width: half, height: region.height });
        } else {
            const half = region.height / 2;
            resize(node.first, { x: region.x, y: region.y, width: region.width, height: half });
            resize(node.second, { x: region.x, y: region.y + half, width: region.width, height: half });
        }
    };
    resize(sibling, parent.region);

    let insertionLeaf = state.insertionLeaf;
    if (insertionLeaf === leaf) {
        let node = sibling;
        while (node.type === 'split') {
            node = node.second;
        }
        insertionLeaf = node;
    }

    return { root: newRoot, insertionLeaf: insertionLeaf, leafCount: state.leafCount - 1, moves: moves };
}
