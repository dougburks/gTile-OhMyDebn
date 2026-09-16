#!/usr/bin/env gjs
//
// Unit tests for 5.4/traditional-tiling.js's pure binary-tree tiling
// logic (both "Traditional tiling" and "Traditional Full" share this
// same tree - see the file's own comment) - no live Cinnamon session
// required. Windows are opaque string tokens ('A', 'B', ...) rather than
// real Meta.Window objects, since the tree logic itself never calls any
// method on them. Loads the file by reading and eval()'ing its source,
// same as test-tile-rules.js, for the same reason (this file is also
// embedded byte-for-byte, see check-sync.sh, inside a hand-patched
// compiled bundle at runtime).

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
const path = GLib.build_filenamev([scriptDir, '..', '5.4', 'traditional-tiling.js']);
const [ok, contents] = GLib.file_get_contents(path);
if (!ok) {
    printerr('Could not read ' + path);
    imports.system.exit(1);
}
eval(imports.byteArray.toString(contents));

const EMPTY = { root: null, insertionLeaf: null, leafCount: 0 };

function region(x, y, width, height) {
    return { x: x, y: y, width: width, height: height };
}

function area(r) {
    return Math.round(r.width * r.height * 1e9) / 1e9;
}

// Tree nodes carry a .parent back-reference (child -> parent -> that
// same child), which JSON.stringify can't serialize (circular
// structure) - strip it recursively for structural-equality assertions.
function stripParents(node) {
    if (!node) return node;
    if (node.type === 'leaf') {
        return { type: 'leaf', window: node.window, region: node.region };
    }
    return { type: 'split', vertical: node.vertical, region: node.region, first: stripParents(node.first), second: stripParents(node.second) };
}

// --- treeInsert, uncapped ("Traditional Full") ---
// A, B, C, D inserted in sequence with no leaf cap - verifies the exact
// same regions this mode has always produced (cross-checked by hand
// against the alternating vertical/horizontal halving rule), plus that
// it keeps going past 3 instead of restarting.

let s = treeInsert(EMPTY, 'A', null);
assertEq('full: window 1 (A) gets the whole area, nothing to move',
    [s.insertionLeaf.region, s.leafCount, s.moves], [region(0, 0, 1, 1), 1, []]);

s = treeInsert(s, 'B', null);
assertEq('full: window 2 (B) takes the right half (1st split, vertical)',
    s.insertionLeaf.region, region(0.5, 0, 0.5, 1));
assertEq('full: window 1 (A) shrinks to the left half',
    s.moves, [{ window: 'A', region: region(0, 0, 0.5, 1) }]);

s = treeInsert(s, 'C', null);
assertEq('full: window 3 (C) takes the bottom of B\'s area (2nd split, horizontal)',
    s.insertionLeaf.region, region(0.5, 0.5, 0.5, 0.5));
assertEq('full: window 2 (B) shrinks to the top of its own area',
    s.moves, [{ window: 'B', region: region(0.5, 0, 0.5, 0.5) }]);

s = treeInsert(s, 'D', null);
assertEq('full: window 4 (D) keeps splitting past 3 (3rd split, vertical again) - no restart',
    s.insertionLeaf.region, region(0.75, 0.5, 0.25, 0.5));
assertEq('full: window 3 (C) shrinks accordingly',
    s.moves, [{ window: 'C', region: region(0.5, 0.5, 0.25, 0.5) }]);
assertEq('full: 4 windows, all still 4 leaves (no discard)', s.leafCount, 4);

// --- treeInsert, capped at 3 ("Traditional tiling") ---
// Same A, B, C sequence produces the identical tree (proving the "same
// tree, just capped" claim), but the 4th window discards and restarts
// instead of splitting further.

const uncappedABC = treeInsert(treeInsert(treeInsert(EMPTY, 'A', null), 'B', null), 'C', null);
let c = treeInsert(EMPTY, 'A', 3);
c = treeInsert(c, 'B', 3);
c = treeInsert(c, 'C', 3);
assertEq('capped: A/B/C tree matches the uncapped mode\'s own A/B/C tree exactly',
    stripParents(c.root), stripParents(uncappedABC.root));
c = treeInsert(c, 'D', 3);
assertEq('capped: window 4 discards the tree and restarts at full screen',
    [c.root.region, c.root.type, c.leafCount, c.moves],
    [region(0, 0, 1, 1), 'leaf', 1, []]);
assertEq('capped: window 4\'s window is the new (and only) leaf', c.insertionLeaf.window, 'D');

// --- treeRemove: sibling is a plain leaf ---
// Remove B from the 3-window (A, B, C) tree - C should reclaim the
// entire space B and C used to share, A stays untouched.

let r3 = treeInsert(treeInsert(treeInsert(EMPTY, 'A', null), 'B', null), 'C', null);
const leafB = r3.root.second.first; // A/[B/C] - B is the first child of the second split
assertEq('remove setup: located B\'s own leaf node', leafB.window, 'B');
let removed = treeRemove(r3, leafB);
assertEq('remove sibling-leaf: C reclaims the full right half B and C used to share',
    removed.moves, [{ window: 'C', region: region(0.5, 0, 0.5, 1) }]);
assertEq('remove sibling-leaf: A is untouched, leafCount drops to 2',
    [removed.root.first.window, removed.leafCount], ['A', 2]);
assertEq('remove sibling-leaf: areas still sum to 1 (A + C)',
    area(removed.root.first.region) + area(removed.root.second.region), 1);

// --- treeRemove: sibling is itself a split (interior collapse) ---
// Remove B from the 4-window (A, B, C, D) tree - B's sibling is the
// C/D split, not a leaf, so removing B has to reposition BOTH C and D at
// once, not just one window.

let r4 = treeInsert(treeInsert(treeInsert(treeInsert(EMPTY, 'A', null), 'B', null), 'C', null), 'D', null);
const leafB2 = r4.root.second.first;
assertEq('remove (interior) setup: located B\'s own leaf node', leafB2.window, 'B');
let removedInterior = treeRemove(r4, leafB2);
assertEq('remove interior: both C and D move in the same close (sibling was a split, not a leaf)',
    removedInterior.moves,
    [{ window: 'C', region: region(0.5, 0, 0.25, 1) }, { window: 'D', region: region(0.75, 0, 0.25, 1) }]);
assertEq('remove interior: leafCount drops to 3', removedInterior.leafCount, 3);
const totalArea = area(removedInterior.root.first.region)
    + area(removedInterior.root.second.first.region)
    + area(removedInterior.root.second.second.region);
assertEq('remove interior: areas still sum to 1 (A + C + D)', totalArea, 1);

// --- treeRemove: removing the current insertion point retargets it ---
// Every treeRemove case above removes a leaf that ISN'T the current
// insertion point. The far more common real case - open a window, then
// immediately close that same window before anything else happens - is
// exactly the opposite: the removed leaf IS state.insertionLeaf, which
// exercises treeRemove's own retargeting branch (insertionLeaf must move
// to the sibling that absorbs the freed space, not point at a leaf
// that's no longer part of the tree).

let r3b = treeInsert(treeInsert(treeInsert(EMPTY, 'A', null), 'B', null), 'C', null);
assertEq('retarget setup: C (the last-inserted window) is the current insertion point',
    r3b.insertionLeaf.window, 'C');
let removedInsertionPoint = treeRemove(r3b, r3b.insertionLeaf);
assertEq('retarget: B reclaims the full right half B and C used to share',
    removedInsertionPoint.moves, [{ window: 'B', region: region(0.5, 0, 0.5, 1) }]);
assertEq('retarget: insertion point moves to B, not a dangling reference to the removed C',
    removedInsertionPoint.insertionLeaf.window, 'B');
assertEq('retarget: the new insertion point is the live node reachable from the current root',
    removedInsertionPoint.insertionLeaf === removedInsertionPoint.root.second, true);

// --- object identity across splits ---
// A leaf reference captured right after insertion (exactly what
// gTile.js's 'unmanaging' closure holds onto for O(1) removal later)
// must still be the CURRENT node representing that window after a LATER
// window splits it - not a since-orphaned copy. This is the regression
// that crashed Cinnamon: a stale reference made a window's own close
// look "orphaned" (skipped its rebalance), and a later sibling's close
// then tried to move_resize_window a window that had already been
// destroyed.

let idA = treeInsert(EMPTY, 'A', null);
const capturedLeafA = idA.insertionLeaf;
idA = treeInsert(idA, 'B', null); // splits A's leaf
assertEq('identity: A\'s leaf captured before the split is still the live node reachable from the current root',
    capturedLeafA === idA.root.first, true);
assertEq('identity: that same captured reference reflects A\'s post-split region, not its original full-screen one',
    capturedLeafA.region, region(0, 0, 0.5, 1));
assertEq('identity: that same captured reference has a live (non-null) parent, so it does not look orphaned',
    capturedLeafA.parent === idA.root, true);

// --- treeRemoveDetached: closing windows from a tree the capped mode discarded ---
// Capped mode, the reported repro: open 1/2/3 (full tree), open 4 (cap
// hit - tree discarded, 4 starts fresh over the top), open 5/6, then
// close 6, 5, 4. Windows 1/2/3 are visible again but the live state is
// empty and their leaves chain up to the discarded root. Closing 3 (the
// bottom-right one) must still expand 2 into its space, and closing 2
// after that must expand 1 to full screen - via the discarded tree's own
// links, with the live state left untouched.

let cap = treeInsert(EMPTY, 'W1', 3);
const leafW1 = cap.insertionLeaf;
cap = treeInsert(cap, 'W2', 3);
const leafW2 = cap.insertionLeaf;
cap = treeInsert(cap, 'W3', 3);
const leafW3 = cap.insertionLeaf;
const discardedRoot = cap.root;
cap = treeInsert(cap, 'W4', 3);
const leafW4 = cap.insertionLeaf;
cap = treeInsert(cap, 'W5', 3);
const leafW5 = cap.insertionLeaf;
cap = treeInsert(cap, 'W6', 3);
const leafW6 = cap.insertionLeaf;
assertEq('detached setup: window 4 discarded the 1/2/3 tree (its root is no longer the live root)',
    cap.root !== discardedRoot, true);
assertEq('detached setup: window 3\'s leaf still chains up to the discarded root, not the live one',
    [treeRootOf(leafW3) === discardedRoot, treeRootOf(leafW3) === cap.root], [true, false]);

for (const leaf of [leafW6, leafW5, leafW4]) {
    cap = treeRemove(cap, leaf);
}
assertEq('detached setup: closing 6, 5, 4 empties the live tree', cap.root, null);

const liveBefore = JSON.stringify(cap);
let detached = treeRemoveDetached(leafW3);
assertEq('detached: closing window 3 expands window 2 into the whole right half (the reported bug)',
    detached.moves, [{ window: 'W2', region: region(0.5, 0, 0.5, 1) }]);
assertEq('detached: window 1 is not moved by closing 3', detached.moves.length, 1);
assertEq('detached: the discarded tree collapsed to 1 | 2, and 2\'s leaf reflects its new region',
    [stripParents(detached.root), leafW2.region],
    [{ type: 'split', vertical: true, region: region(0, 0, 1, 1),
        first: { type: 'leaf', window: 'W1', region: region(0, 0, 0.5, 1) },
        second: { type: 'leaf', window: 'W2', region: region(0.5, 0, 0.5, 1) } },
     region(0.5, 0, 0.5, 1)]);
assertEq('detached: the live state is untouched (caller must not write it back)', JSON.stringify(cap), liveBefore);

detached = treeRemoveDetached(leafW2);
assertEq('detached: then closing window 2 expands window 1 to full screen',
    detached.moves, [{ window: 'W1', region: region(0, 0, 1, 1) }]);
assertEq('detached: window 1 is now the discarded tree\'s whole root', detached.root === leafW1, true);
assertEq('detached: closing the last window of a discarded tree yields no moves and no tree',
    treeRemoveDetached(leafW1), { root: null, moves: [] });

// Same, but closing window 2 while 4/5/6 are still open: 1 should expand
// underneath them right away (covered, but correct the moment they go).
let cap2 = treeInsert(EMPTY, 'W1', 3);
cap2 = treeInsert(cap2, 'W2', 3);
const leafW2b = cap2.insertionLeaf;
cap2 = treeInsert(cap2, 'W3', 3);
cap2 = treeInsert(cap2, 'W4', 3);
const liveAfter4 = cap2.root;
assertEq('detached (covered): closing window 2 under a live 4-tree expands 3 into the right half',
    treeRemoveDetached(leafW2b).moves, [{ window: 'W3', region: region(0.5, 0, 0.5, 1) }]);
assertEq('detached (covered): the live 4-tree is unaffected', cap2.root === liveAfter4 && cap2.root.window === 'W4', true);

// --- treeRemove: removing the whole tree (last window) ---
let onlyA = treeInsert(EMPTY, 'A', null);
assertEq('remove last window: tree becomes empty',
    treeRemove(onlyA, onlyA.root), { root: null, insertionLeaf: null, leafCount: 0, moves: [] });

print('');
print(total + ' assertion(s), ' + failures + ' failure(s)');
imports.system.exit(failures === 0 ? 0 : 1);
