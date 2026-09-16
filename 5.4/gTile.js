var gtile;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  disable: () => (/* binding */ disable),
  enable: () => (/* binding */ enable),
  init: () => (/* binding */ init)
});

;// CONCATENATED MODULE: ../base/ui/GridSettingsButton.ts
const St = imports.gi.St;
class GridSettingsButton {
    constructor(app, settings, text, cols, rows) {
        this._onButtonPress = () => {
            this.settings.SetGridConfig(this.cols, this.rows);
            this.app.RefreshGrid();
            return false;
        };
        this.app = app;
        this.settings = settings;
        this.cols = cols;
        this.rows = rows;
        this.text = text;
        this.actor = new St.Button({
            style_class: 'settings-button',
            reactive: true,
            can_focus: true,
            track_hover: true
        });
        this.label = new St.Label({
            style_class: 'settings-label',
            reactive: true, can_focus: true,
            track_hover: true,
            text: this.text
        });
        this.actor.add_actor(this.label);
        this.actor.connect('button-press-event', this._onButtonPress);
    }
}

;// CONCATENATED MODULE: ../base/config.ts

const Settings = imports.ui.settings;
const Main = imports.ui.main;
class Config {
    constructor(app) {
        this.gridSettingsButton = [];
        this.EnableHotkey = () => {
            this.DisableHotkey();
            Main.keybindingManager.addHotKey('gTile', this.hotkey, this.app.ToggleUI);
        };
        this.DisableHotkey = () => {
            Main.keybindingManager.removeHotKey('gTile');
        };
        this.updateSettings = () => {
            for (const grid of this.app.Grids) {
                grid.UpdateSettingsButtons();
            }
        };
        this.initGridSettings = () => {
            let basestr = 'grid';
            for (let i = 1; i <= 4; i++) {
                let sgbx = basestr + i + 'x';
                let sgby = basestr + i + 'y';
                let nameOverride = basestr + i + "NameOverride";
                let gbx = this.settings.getValue(sgbx);
                let gby = this.settings.getValue(sgby);
                if (gbx.length == 0 || gby.length == 0)
                    continue;
                let nameOverrideVal = this.settings.getValue(nameOverride);
                this.gridSettingsButton.push(new GridSettingsButton(this.app, this, nameOverrideVal || (gbx.length + 'x' + gby.length), gbx, gby));
            }
        };
        this.updateGridSettings = () => {
            this.gridSettingsButton = [];
            this.initGridSettings();
            for (const grid of this.app.Grids) {
                grid.RebuildGridSettingsButtons();
            }
        };
        this.UpdateGridTableSize = () => {
            for (const grid of this.app.Grids) {
                const [width, height] = grid.GetTableSize();
                grid.AdjustTableSize(width, height);
            }
        };
        this.destroy = () => {
            this.DisableHotkey();
            // Deregister this ExtensionSettings instance so a
            // replacement App's fresh instance doesn't collide with it
            // in Main.settingsManager (one registration per uuid).
            if (this.settings && typeof this.settings.finalize === 'function') {
                this.settings.finalize();
            }
            this.settings = null;
        };
        this.app = app;
        this.settings = new Settings.ExtensionSettings(this, 'gTile@OhMyDebn');
        this.settings.bindProperty(Settings.BindingDirection.IN, 'hotkey', 'hotkey', this.EnableHotkey, null);
        this.settings.bindProperty(Settings.BindingDirection.OUT, 'lastGridCols', 'nbCols');
        this.settings.bindProperty(Settings.BindingDirection.OUT, 'lastGridRows', 'nbRows');
        if (this.nbCols == null || !Array.isArray(this.nbCols))
            this.nbCols = this.InitialGridItems();
        if (this.nbRows == null || !Array.isArray(this.nbRows))
            this.nbRows = this.InitialGridItems();
        this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, 'animation', 'animation', this.updateSettings, null);
        this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, 'autoclose', 'autoclose', this.updateSettings, null);
        this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, 'aspect-ratio', 'aspectRatio', this.UpdateGridTableSize, null);
        this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, 'useMonitorCenter', 'useMonitorCenter', () => this.app.OnCenteredToWindowChanged(), null);
        this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, 'showGridOnAllMonitors', 'showGridOnAllMonitors', () => this.app.ReInitialize(), null);
        // Tile labels are drawn in the GridElement constructor, so a
        // toggle has to rebuild the grid elements to take effect -
        // updateSettings alone only refreshes the toggle buttons,
        // leaving the letter hotkeys live with no visible labels (or
        // labels visible with dead letters) until something else
        // happened to rebuild the grid. If the UI is open right now,
        // also rebind the key controls so the letter hotkeys match the
        // labels immediately.
        this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, 'select-using-keyboard', 'selectUsingKeyboard', () => {
            this.app.RefreshGrid();
            if (this.app.visible) {
                this.app.RemoveKeyControls();
                this.app.BindKeyControls();
            }
        }, null);
        let basestr = 'grid';
        this.initGridSettings();
        for (let i = 1; i <= 4; i++) {
            let sgbx = basestr + i + 'x';
            let sgby = basestr + i + 'y';
            let nameOverride = basestr + i + "NameOverride";
            this.settings.bindProperty(Settings.BindingDirection.IN, sgbx, sgbx, this.updateGridSettings, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, sgby, sgby, this.updateGridSettings, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, nameOverride, nameOverride, this.updateGridSettings, null);
        }
        this.EnableHotkey();
        // bind gap-size setting to this.gapSize and update platform gap
        // when it changes. The raw value goes through as-is: set_gap_size
        // normalizes via normalizeGapSize (gap-math.js), which keeps a
        // configured 0 at 0 and defaults null/non-numeric to 10 - no
        // `|| 10`-style fallback here, which once turned 0 into 10.
        this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, 'gap-size', 'gapSize', () => {
            if (this.app && this.app.platform && typeof this.app.platform.set_gap_size === 'function') {
                this.app.platform.set_gap_size(this.gapSize);
            }
        }, null);

        // Ensure the platform has the initial gap value from settings at startup.
        // The bindProperty callback may not be called immediately, so apply it now.
        if (this.app && this.app.platform && typeof this.app.platform.set_gap_size === 'function') {
            this.app.platform.set_gap_size(this.gapSize);
        }
    }
    get AnimationTime() {
        return this.animation ? 0.3 : 0.1;
    }
    SetGridConfig(columns, rows) {
        this.nbRows = rows;
        this.nbCols = columns;
    }
    InitialGridItems() {
        return [
            { span: 1 },
            { span: 1 },
            { span: 1 },
            { span: 1 }
        ];
    }
}

;// CONCATENATED MODULE: ../base/utils.ts
const { Object: utils_Object } = imports.gi.GObject;
const Gettext = imports.gettext;
const GLib = imports.gi.GLib;
const Signals = imports.signals;
const Meta = imports.gi.Meta;
const Panel = imports.ui.panel;
const utils_Main = imports.ui.main;
const UUID = 'gTile@OhMyDebn';
const isFinalized = function (obj) {
    return obj && utils_Object.prototype.toString.call(obj).indexOf('FINALIZED') > -1;
};
Gettext.bindtextdomain(UUID, GLib.get_home_dir() + '/.local/share/locale');
function _(str) {
    let customTranslation = Gettext.dgettext(UUID, str);
    if (customTranslation != str) {
        return customTranslation;
    }
    return Gettext.gettext(str);
}
function objHasKey(obj, key) {
    return utils_Object.prototype.hasOwnProperty.call(obj, key);
}
function addSignals(constructor) {
    Signals.addSignalMethods(constructor.prototype);
    return class extends constructor {
    };
}
const getPanelHeight = (panel) => {
    return panel.height
        || panel.actor.get_height();
};
const getPanelWidth = (panel) => {
    return panel.width
        || panel.actor.get_width();
};
// Kept byte-for-byte in sync with the standalone 5.4/tile-rules.js in
// this repo - see tests/check-sync.sh, which fails if these two copies
// ever drift. Pure functions only: no imports.gi, no global.* - this
// exact block is also loaded and unit-tested standalone via plain
// `gjs`, with no live Cinnamon session, by tests/test-tile-rules.js.
// BEGIN tile-rules.js
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
// END tile-rules.js

// Kept byte-for-byte in sync with the standalone 5.4/traditional-tiling.js
// in this repo - see tests/check-sync.sh, which fails if these two
// copies ever drift. Pure logic only: no imports.gi, no global.* - this
// exact block is also loaded and unit-tested standalone via plain
// `gjs`, with no live Cinnamon session, by
// tests/test-traditional-tiling.js.
// BEGIN traditional-tiling.js
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

function treeRootOf(node) {
    let root = node;
    while (root.parent) {
        root = root.parent;
    }
    return root;
}

// Removes `leaf` from whichever tree it actually belongs to, found by
// walking up its own parent chain - for windows whose tree the capped
// mode has since discarded and replaced (see treeInsert's maxLeaves).
// Those windows stay on screen underneath the new tree, still wired to
// their old one, and once the new tree's windows are closed they're
// visible again - so closing one of them must still rebalance its old
// siblings (close the 3rd of 1/2/3 after 4/5/6 have come and gone: 2
// has to expand into 3's space, exactly as it would have before 4 ever
// appeared). Without this, gTile.js's close hook saw "not the live
// tree" and did nothing, leaving 2 stuck in its half. The discarded
// tree's parent/sibling links are all still intact, so plain treeRemove
// does the work; this just supplies that tree's own root instead of the
// live state's. The caller must NOT write the result back to its live
// state - the discarded tree stays discarded, only its windows move.
function treeRemoveDetached(leaf) {
    const removal = treeRemove({ root: treeRootOf(leaf), insertionLeaf: null, leafCount: 0 }, leaf);
    return { root: removal.root, moves: removal.moves };
}
// END traditional-tiling.js

// Kept byte-for-byte in sync with the standalone 5.4/scrollable-tiling.js
// in this repo - see tests/check-sync.sh, which fails if these two
// copies ever drift. Pure logic only: no imports.gi, no global.* - this
// exact block is also loaded and unit-tested standalone via plain
// `gjs`, with no live Cinnamon session, by
// tests/test-scrollable-tiling.js.
// BEGIN scrollable-tiling.js
// The "scrollable-column-width" setting is a percent - normalize it
// into the (0..1] width fraction the rest of this file uses: null,
// non-numeric, or non-positive falls back to 50%, and sane values
// clamp to 10..100 so the division in stripVisibleCount below can't
// blow up.
function columnWidthFraction(percent) {
    const n = Number(percent);
    if (!Number.isFinite(n) || n <= 0)
        return 0.5;
    return Math.min(100, Math.max(10, n)) / 100;
}

// The "scroll-animation-duration" setting is milliseconds - 0 is a
// real value meaning "no tiling animation" (pinned by the tests so
// the disable contract can't silently break), negatives clamp to 0,
// fractions floor, values past 1000 clamp down, and anything
// non-numeric - or an unset null/undefined - falls back to the
// default of 200.
function normalizeScrollDuration(ms) {
    if (ms == null)
        return 200;
    const n = Number(ms);
    if (!Number.isFinite(n))
        return 200;
    return Math.min(1000, Math.max(0, Math.floor(n)));
}

// The tiling-mode cycle driven by the "cycle tiling mode" hotkeys and
// the CycleTilingMode DBus method. Mode-level rather than
// scrollable-specific, but it lives in this file to share the
// embed/test infrastructure. The order matches the settings
// combobox top to bottom, and the settings-schema test cross-checks
// that this list and the combobox options can never drift apart.
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
// END scrollable-tiling.js

// Kept byte-for-byte in sync with the standalone 5.4/screen-area.js in
// this repo - see tests/check-sync.sh, which fails if these two copies
// ever drift. Pure functions only: no imports.gi, no global.* - this
// exact block is also loaded and unit-tested standalone via plain
// `gjs`, with no live Cinnamon session, by tests/test-screen-area.js.
// BEGIN screen-area.js
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
// END screen-area.js

// Kept byte-for-byte in sync with the standalone 5.4/gap-math.js in
// this repo - see tests/check-sync.sh, which fails if these two copies
// ever drift. Pure functions only: no imports.gi, no global.* - this
// exact block is also loaded and unit-tested standalone via plain
// `gjs`, with no live Cinnamon session, by tests/test-gap-math.js.
// BEGIN gap-math.js
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
// END gap-math.js

// Kept byte-for-byte in sync with the standalone 5.4/tile-labels.js in
// this repo - see tests/check-sync.sh, which fails if these two copies
// ever drift. Pure functions only: no imports.gi, no global.* - this
// exact block is also loaded and unit-tested standalone via plain
// `gjs`, with no live Cinnamon session, by tests/test-tile-labels.js.
// BEGIN tile-labels.js
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
// END tile-labels.js

// BEGIN grid-ui-math.js
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
// END grid-ui-math.js

// Thin impure wrapper around computeUsableArea above - maps Cinnamon's
// live Panel objects into the plain { position, size, hideable }
// descriptors that pure function takes, then hands off the actual math
// to it.
const getUsableScreenArea = (monitor) => {
    const panels = utils_Main.panelManager.getPanelsInMonitor(monitor.index).map((panel) => {
        let position = null;
        let size = 0;
        switch (panel.panelPosition) {
            case Panel.PanelLoc.top:
                position = 'top';
                size = getPanelHeight(panel);
                break;
            case Panel.PanelLoc.bottom:
                position = 'bottom';
                size = getPanelHeight(panel);
                break;
            case Panel.PanelLoc.left:
                position = 'left';
                size = getPanelWidth(panel);
                break;
            case Panel.PanelLoc.right:
                position = 'right';
                size = getPanelWidth(panel);
                break;
        }
        return { position: position, size: size, hideable: panel.isHideable() };
    });
    return computeUsableArea(monitor, panels);
};
const getAdjacentMonitor = (monitor, side) => {
    const monitors = utils_Main.layoutManager.monitors;
    const contactsOnSide = [];
    for (const mon of monitors) {
        if (isEqual(mon, monitor))
            continue;
        const verticalContact = rangeToContactSurface([mon.y, mon.y + mon.height], [monitor.y, monitor.y + monitor.height]);
        const horizontalContact = rangeToContactSurface([mon.x, mon.x + mon.width], [monitor.x, monitor.x + monitor.width]);
        switch (side) {
            case Meta.Side.LEFT:
                if (monitor.x == mon.x + mon.width)
                    contactsOnSide.push([mon, verticalContact]);
                break;
            case Meta.Side.RIGHT:
                if (monitor.x + monitor.width == mon.x)
                    contactsOnSide.push([mon, verticalContact]);
                break;
            case Meta.Side.TOP:
                if (monitor.y == mon.y + mon.height)
                    contactsOnSide.push([mon, horizontalContact]);
                break;
            case Meta.Side.BOTTOM:
                if (monitor.y + monitor.height == mon.y)
                    contactsOnSide.push([mon, horizontalContact]);
                break;
        }
    }
    if (contactsOnSide.length == 0)
        return monitor;
    return contactsOnSide.reduce((max, current) => (current[1] > max[1] ? current : max), contactsOnSide[0])[0];
};
function isEqual(monitor1, monitor2) {
    return (monitor1.x == monitor2.x &&
        monitor1.y == monitor2.y &&
        monitor1.height == monitor2.height &&
        monitor1.width == monitor2.width);
}
const getFocusApp = () => {
    return global.display.focus_window;
};
function intersection(a, b) {
    let min = (a[0] < b[0] ? a : b);
    let max = (min == a ? b : a);
    if (min[1] < max[0])
        return null;
    return [max[0], (min[1] < max[1] ? min[1] : max[1])];
}
function rangeToContactSurface(a, b) {
    const range = intersection(a, b);
    return range ? range[1] - range[0] : 0;
}
const GetMonitorAspectRatio = (monitor) => {
    const aspectRatio = Math.max(monitor.width, monitor.height) / Math.min(monitor.width, monitor.height);
    return {
        ratio: aspectRatio,
        widthIsLonger: monitor.width > monitor.height
    };
};
const GetMonitorCenter = (monitor) => {
    return [monitor.x + monitor.width / 2, monitor.y + monitor.height / 2];
};

;// CONCATENATED MODULE: ../base/constants.ts

const SETTINGS_AUTO_CLOSE = 'autoclose';
const SETTINGS_ANIMATION = 'animation';
const TOOLTIPS = {
    [SETTINGS_AUTO_CLOSE]: _("Auto close"),
    [SETTINGS_ANIMATION]: _("Popup animation")
};
const KEYCONTROL = {
    'gTile-k-left': 'Left',
    'gTile-k-right': 'Right',
    'gTile-k-up': 'Up',
    'gTile-k-down': 'Down',
    'gTile-k-left-meta': '<Shift>Left',
    'gTile-k-right-meta': '<Shift>Right',
    'gTile-k-up-meta': '<Shift>Up',
    'gTile-k-down-meta': '<Shift>Down',
    'gTile-k-left-monitor-move': '<Alt>Left',
    'gTile-k-right-monitor-move': '<Alt>Right',
    'gTile-k-up-monitor-move': '<Alt>Up',
    'gTile-k-down-monitor-move': '<Alt>Down',
    'gTile-k-first-grid': '1',
    'gTile-k-second-grid': '2',
    'gTile-k-third-grid': '3',
    'gTile-k-fourth-grid': '4',
};

;// CONCATENATED MODULE: ../base/ui/ActionButton.ts
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


const Tooltips = imports.ui.tooltips;
const ActionButton_St = imports.gi.St;
let ActionButton = class ActionButton {
    constructor(classname, icon) {
        this._onButtonPress = () => {
            this.emit('button-press-event');
            return false;
        };
        this.actor = new ActionButton_St.Button({
            style_class: "settings-button",
            reactive: true,
            can_focus: true,
            track_hover: true,
            child: new ActionButton_St.Icon({
                reactive: true,
                icon_name: icon,
                icon_size: 36,
                icon_type: ActionButton_St.IconType.SYMBOLIC,
                can_focus: true,
                track_hover: true
            })
        });
        this.actor.connect('button-press-event', this._onButtonPress);
        if (TOOLTIPS[classname]) {
            this._tooltip = new Tooltips.Tooltip(this.actor, TOOLTIPS[classname]);
        }
    }
};
ActionButton = __decorate([
    addSignals
], ActionButton);

;

;// CONCATENATED MODULE: ../base/ui/GridElement.ts

const GridElement_St = imports.gi.St;
class GridElement {
    constructor(app, monitor, grid, width, height, coordx, coordy, delegate, numCols) {
        this._onButtonPress = (final) => {
            this.delegate._onButtonPress(this, final);
            return false;
        };
        this._onHoverChanged = () => {
            if (!this.actor || isFinalized(this.actor))
                return;
            this.delegate._onHoverChanged(this);
            return false;
        };
        this._activate = () => {
            if (!this.actor || isFinalized(this.actor))
                return;
            this.actor.add_style_pseudo_class('activate');
        };
        this._deactivate = () => {
            if (!this.actor || isFinalized(this.actor))
                return;
            this.actor.remove_style_pseudo_class('activate');
        };
        this._destroy = () => {
            this.monitor = null;
            this.coordx = null;
            this.coordy = null;
            this.width = null;
            this.height = null;
            this.active = null;
        };
        this.app = app;
        this.grid = grid;
        this.actor = new GridElement_St.Button({
            style_class: 'table-element',
            width: width,
            height: height,
            reactive: true,
            can_focus: true,
            track_hover: true,
            x_expand: false,
            y_expand: false,
            y_fill: false,
            x_fill: false,
        });
        this.monitor = monitor;
        this.coordx = coordx;
        this.coordy = coordy;
        this.width = width;
        this.height = height;
        this.delegate = delegate;
        this.actor.connect('button-press-event', () => this._onButtonPress(false));
        this.actor.connect('notify::hover', this._onHoverChanged);
        this.active = false;

        // Add label - tileIndexToLabel (see tile-labels.js) returns
        // null past the 52 available letters (a-z, A-Z), so tiles that
        // far into a very large grid simply get no label.
        if (this.app.config.selectUsingKeyboard) {
            const labelText = tileIndexToLabel(coordy * numCols + coordx);
            if (labelText !== null) {
                const label = new GridElement_St.Label({
                    style_class: 'tile-label',
                    text: labelText,
                    x_align: St.Align.MIDDLE,
                    y_align: St.Align.MIDDLE
                });
                this.actor.add_actor(label);
            }
        }
    }
}

;// CONCATENATED MODULE: ../base/ui/GridElementDelegate.ts
var GridElementDelegate_decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

const Tweener = imports.ui.tweener;
let GridElementDelegate = class GridElementDelegate {
    constructor(app) {
        this.activated = false;
        this.first = null;
        this.currentElement = null;
        this.activatedActors = null;
        this._allSelected = () => {
            var _a;
            return ((_a = this.activatedActors) === null || _a === void 0 ? void 0 : _a.length) === (this.settings.nbCols.length * this.settings.nbRows.length);
        };
        this._resizeDone = () => {
            this.emit('resize-done');
        };
        this.reset = () => {
            this._resetGrid();
            this.activated = false;
            this.first = null;
            this.currentElement = null;
        };
        this._resetGrid = () => {
            this._hideArea();
            if (this.currentElement) {
                this.currentElement._deactivate();
            }
            if (this.activatedActors != null) {
                for (let index = 0; index < this.activatedActors.length; index++) {
                    this.activatedActors[index]._deactivate();
                }
            }
            this.activatedActors = [];
        };
        this._getVarFromGridElement = (fromGridElement, toGridElement) => {
            let maxX = fromGridElement.coordx >= toGridElement.coordx ? fromGridElement.coordx : toGridElement.coordx;
            let minX = fromGridElement.coordx <= toGridElement.coordx ? fromGridElement.coordx : toGridElement.coordx;
            let maxY = fromGridElement.coordy >= toGridElement.coordy ? fromGridElement.coordy : toGridElement.coordy;
            let minY = fromGridElement.coordy <= toGridElement.coordy ? fromGridElement.coordy : toGridElement.coordy;
            return [minX, maxX, minY, maxY];
        };
        this.refreshGrid = (fromGridElement, toGridElement) => {
            var _a;
            this._resetGrid();
            let minX, maxX, minY, maxY;
            [minX, maxX, minY, maxY] = this._getVarFromGridElement(fromGridElement, toGridElement);
            let grid = fromGridElement.grid;
            for (let r = minY; r <= maxY; r++) {
                for (let c = minX; c <= maxX; c++) {
                    let element = grid === null || grid === void 0 ? void 0 : grid.elements[r][c];
                    element._activate();
                    (_a = this.activatedActors) === null || _a === void 0 ? void 0 : _a.push(element);
                }
            }
            this._displayArea(fromGridElement, toGridElement);
        };
        this._computeAreaPositionSize = (fromGridElement, toGridElement) => {
            let minX, maxX, minY, maxY;
            [minX, maxX, minY, maxY] = this._getVarFromGridElement(fromGridElement, toGridElement);
            let nbRows = this.settings.nbRows;
            let nbCols = this.settings.nbCols;
            let monitor = fromGridElement.monitor;
            let [screenX, screenY, screenWidth, screenHeight] = getUsableScreenArea(monitor);
            const widthUnit = screenWidth / nbCols.map(r => r.span).reduce((p, c) => p += c);
            const heightUnit = screenHeight / nbRows.map(r => r.span).reduce((p, c) => p += c);
            let areaWidth = 0;
            for (let index = minX; index <= maxX; index++) {
                const element = nbCols[index];
                areaWidth += element.span * widthUnit;
            }
            let areaHeight = 0;
            for (let index = minY; index <= maxY; index++) {
                const element = nbRows[index];
                areaHeight += element.span * heightUnit;
            }
            let areaX = screenX;
            for (let index = 0; index < minX; index++) {
                const element = nbCols[index];
                areaX += element.span * widthUnit;
            }
            let areaY = screenY;
            for (let index = 0; index < minY; index++) {
                const element = nbRows[index];
                areaY += element.span * heightUnit;
            }
            return [areaX, areaY, areaWidth, areaHeight];
        };
        this._displayArea = (fromGridElement, toGridElement) => {
            let areaWidth, areaHeight, areaX, areaY;
            [areaX, areaY, areaWidth, areaHeight] = this._computeAreaPositionSize(fromGridElement, toGridElement);
            this.app.area.add_style_pseudo_class('activate');
            if (this.settings.animation) {
                Tweener.addTween(this.app.area, {
                    time: 0.2,
                    x: areaX,
                    y: areaY,
                    width: areaWidth,
                    height: areaHeight,
                    transition: 'easeOutQuad'
                });
            }
            else {
                this.app.area.width = areaWidth;
                this.app.area.height = areaHeight;
                this.app.area.x = areaX;
                this.app.area.y = areaY;
            }
        };
        this._hideArea = () => {
            this.app.area.remove_style_pseudo_class('activate');
        };
        this._onHoverChanged = (gridElement) => {
            if (this.activated) {
                if (this.first != null)
                    this.refreshGrid(this.first, gridElement);
            }
            else {
                if (this.currentElement)
                    this.currentElement._deactivate();
                this.currentElement = gridElement;
                this._displayArea(this.currentElement, this.currentElement);
                this.currentElement._activate();
            }
        };
        this._destroy = () => {
            this.activated = null;
            this.first = null;
            this.currentElement = null;
            this.activatedActors = null;
            this._hideArea();
        };
        this.app = app;
        this.settings = this.app.config;
    }
    _onButtonPress(gridElement, final) {
        if (final) {
            this.activated = true;
            if (this.first == null) {
                this.first = gridElement;
                this.activatedActors = [];
                this.activatedActors.push(gridElement);
                gridElement.actor.add_style_pseudo_class('activate');
                gridElement.active = true;
            }
        }
        if (!this.activated) {
            this.activated = true;
            this.activatedActors = [];
            this.activatedActors.push(gridElement);
            this.first = gridElement;
            gridElement.actor.add_style_pseudo_class('activate');
            gridElement.active = true;
        }
        else {
            this.app.platform.reset_window(this.app.FocusMetaWindow);
            let areaWidth, areaHeight, areaX, areaY;
            [areaX, areaY, areaWidth, areaHeight] = this._computeAreaPositionSize(this.first, gridElement);
            if (this._allSelected()) {
                this.app.platform.move_maximize_window(this.app.FocusMetaWindow, areaX, areaY);
            }
            else {
                this.app.platform.move_resize_window(this.app.FocusMetaWindow, areaX, areaY, areaWidth, areaHeight);
            }
            this._resizeDone();
        }
    }
};
GridElementDelegate = GridElementDelegate_decorate([
    addSignals
], GridElementDelegate);

;

;// CONCATENATED MODULE: ../base/ui/ToggleSettingsButton.ts
var ToggleSettingsButton_decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


const { Icon, IconType, Button } = imports.gi.St;
const ToggleSettingsButton_Tooltips = imports.ui.tooltips;
const { IconTheme } = imports.gi.Gtk;
let ToggleSettingsButton = class ToggleSettingsButton {
    constructor(setting, text, property, icon) {
        this.active = false;
        this._update = () => {
            this.active = this.settings[this.property];
            if (this.active) {
                this.actor.add_style_pseudo_class('activate');
            }
            else {
                this.actor.remove_style_pseudo_class('activate');
            }
        };
        this._onButtonPress = () => {
            if (!objHasKey(this.settings, this.property))
                return false;
            this.settings[this.property] = !this.settings[this.property];
            this.emit('update-toggle');
            return false;
        };
        this.settings = setting;
        this.text = text;
        this.actor = new Button({
            style_class: "settings-button",
            reactive: true,
            can_focus: true,
            track_hover: true,
            child: new Icon({
                icon_name: icon,
                icon_type: IconType.SYMBOLIC,
                icon_size: 24,
            })
        });
        this.property = property;
        this._update();
        this.actor.connect('button-press-event', this._onButtonPress);
        this.connect('update-toggle', this._update);
        if (objHasKey(TOOLTIPS, property)) {
            this._tooltip = new ToggleSettingsButton_Tooltips.Tooltip(this.actor, TOOLTIPS[property]);
        }
    }
};
ToggleSettingsButton = ToggleSettingsButton_decorate([
    addSignals
], ToggleSettingsButton);

;

;// CONCATENATED MODULE: ../base/ui/TopBar.ts
const TopBar_St = imports.gi.St;
class TopBar {
    constructor(app, title) {
        this._onCloseButtonClicked = () => {
            this.app.ToggleUI();
            return false;
        };
        this.app = app;
        this.actor = new TopBar_St.BoxLayout({ style_class: 'top-box' });
        this._title = title;
        this._stlabel = new TopBar_St.Label({ style_class: 'grid-title', text: this._title });
        this._iconBin = new TopBar_St.Bin({ x_fill: false, y_fill: false });
        this._closeButton = new TopBar_St.Button({
            style: "padding:0;",
            opacity: 128,
            child: new TopBar_St.Icon({
                icon_type: TopBar_St.IconType.SYMBOLIC,
                icon_size: 24,
                icon_name: "window-close"
            })
        });
        this._closeButton.connect('notify::hover', () => { this._closeButton.opacity = this._closeButton.hover ? 255 : 128; });
        this._closeButton.connect('button-release-event', this._onCloseButtonClicked);
        this.actor.add(this._iconBin);
        this.actor.add(this._stlabel, { x_fill: true, expand: true, y_align: TopBar_St.Align.MIDDLE, y_fill: true });
        this.actor.add(this._closeButton, { x_fill: false, expand: false });
    }
    _set_title(title) {
        this._title = title;
        this._stlabel.text = this._title;
    }
    _set_app(app, title) {
        this._title = app.get_name() + ' - ' + title;
        this._stlabel.text = this._title;
        this._icon = app.create_icon_texture(24);
        this._iconBin.set_size(24, 24);
        this._iconBin.set_child(this._icon);
    }
    _destroy() {
        this._title = null;
        this._icon = null;
    }
}

;// CONCATENATED MODULE: ../base/ui/Grid.ts
var Grid_decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};









const { BoxLayout, Table, Bin } = imports.gi.St;
const Grid_Main = imports.ui.main;
const Grid_Tweener = imports.ui.tweener;
const { Side } = imports.gi.Meta;
const { Color } = imports.gi.Clutter;
let Grid = class Grid {
    constructor(app, monitor, title, cols, rows) {
        this.tableWidth = 220;
        this.tableHeight = 200;
        this.panelBorderOffset = 40;
        this.borderwidth = 2;
        this.rowKey = -1;
        this.colKey = -1;
        this.isEntered = false;
        this.interceptHide = false;
        this.elementsDelegateSignals = [];
        this.toggleSettingButtons = [];
        this.AdjustTableSize = (width, height) => {
            this.tableWidth = width;
            this.tableHeight = height;
            this.panelWidth = (this.tableWidth + this.panelBorderOffset);
            const time = this.app.config.AnimationTime;
            Grid_Tweener.addTween(this.table, {
                time: time,
                width: width,
                height: height,
                transition: 'easeOutQuad',
            });
            Grid_Tweener.addTween(this.actor, {
                time: time,
                width: this.panelWidth,
                transition: 'easeOutQuad',
            });
            const [widthUnit, heightUnit] = this.GetTableUnits(width, height);
            for (let index = 0; index < this.elements.length; index++) {
                const row = this.elements[index];
                for (let j = 0; j < row.length; j++) {
                    const element = row[j];
                    const finalWidth = widthUnit * this.cols[j].span;
                    const finalHeight = heightUnit * this.rows[index].span;
                    Grid_Tweener.addTween(element.actor, {
                        time: time,
                        width: finalWidth,
                        height: finalHeight,
                        transition: 'easeOutQuad',
                    });
                }
            }
        };
        this.RebuildGridSettingsButtons = () => {
            this.bottombar.destroy_children();
            let rowNum = 0;
            let colNum = 0;
            for (let index = 0; index < this.app.config.gridSettingsButton.length; index++) {
                if (colNum >= 4) {
                    colNum = 0;
                    rowNum += 2;
                }
                let button = this.app.config.gridSettingsButton[index];
                button = new GridSettingsButton(this.app, this.app.config, button.text, button.cols, button.rows);
                this.bottombar.add(button.actor, { row: rowNum, col: colNum, x_fill: false, y_fill: false });
                button.actor.connect('notify::hover', () => this.elementsDelegate.reset());
                colNum++;
            }
        };
        this.RefreshGridElements = () => {
            this.table.destroy_all_children();
            this.cols = this.app.config.nbCols;
            this.rows = this.app.config.nbRows;
            if (!keyCursorFits(this.colKey, this.rowKey, this.cols.length, this.rows.length))
                this.Reset();
            this.RebuildGridElements();
            // Every element (and the delegate) was just recreated, so an
            // in-range cursor must be re-pointed at the NEW element - see
            // resolveKeyElement's comment for the stale-reference bug.
            this.keyElement = resolveKeyElement(this.elements, this.rowKey, this.colKey);
            if (this.keyElement)
                this.keyElement._onHoverChanged();
        };
        this.RebuildGridElements = () => {
            var _a;
            this.elements = [];
            const [widthUnit, heightUnit] = this.GetTableUnits(this.tableWidth, this.tableHeight);
            this.elementsDelegateSignals.forEach(element => {
                var _a;
                (_a = this.elementsDelegate) === null || _a === void 0 ? void 0 : _a.disconnect(element);
            });
            (_a = this.elementsDelegate) === null || _a === void 0 ? void 0 : _a._destroy();
            this.elementsDelegate = new GridElementDelegate(this.app);
            this.elementsDelegateSignals = [];
            this.elementsDelegateSignals.push(this.elementsDelegate.connect('resize-done', this.OnResize));
            for (let r = 0; r < this.rows.length; r++) {
                const row = new BoxLayout();
                for (let c = 0; c < this.cols.length; c++) {
                    if (c === 0) {
                        this.elements[r] = [];
                    }
                    const finalWidth = widthUnit * this.cols[c].span;
                    const finalHeight = heightUnit * this.rows[r].span;
                    let element = new GridElement(this.app, this.monitor, this, finalWidth, finalHeight, c, r, this.elementsDelegate, this.cols.length);
                    this.elements[r][c] = element;
                    const bin = new Bin();
                    bin.add_actor(element.actor);
                    row.add(bin, { expand: true });
                }
                this.table.add(row, { expand: true });
            }
        };
        this.OnHideComplete = () => {
            if (!this.interceptHide && this.actor) {
                Grid_Main.layoutManager.removeChrome(this.actor);
            }
            Grid_Main.layoutManager["_chrome"].updateRegions();
        };
        this.OnShowComplete = () => {
            Grid_Main.layoutManager["_chrome"].updateRegions();
        };
        this.OnResize = () => {
            this.app.RefreshGrid();
            if (this.app.config.autoclose) {
                this.emit('hide-tiling');
            }
        };
        this.OnMouseEnter = () => {
            if (!this.isEntered) {
                this.elementsDelegate.reset();
                this.isEntered = true;
            }
            return false;
        };
        this.OnMouseLeave = () => {
            let [x, y, mask] = global.get_pointer();
            if (this.elementsDelegate &&
                (x <= this.actor.x || x >= this.actor.x + this.actor.width ||
                    y <= this.actor.y || y >= this.actor.y + this.tableHeight + this.topbar.actor.height)) {
                this.isEntered = false;
                this.elementsDelegate.reset();
            }
            return false;
        };
        this.OnKeyPressEvent = (type, key) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            let modifier = false;
            switch (type) {
                case 'gTile-k-right-meta':
                case 'gTile-k-left-meta':
                case 'gTile-k-up-meta':
                case 'gTile-k-down-meta':
                case 'gTile-k-right-monitor-move':
                case 'gTile-k-left-monitor-move':
                case 'gTile-k-up-monitor-move':
                case 'gTile-k-down-monitor-move':
                    modifier = true;
                    break;
            }
            if (modifier && this.keyElement) {
                if (!this.elementsDelegate.activated) {
                    this.keyElement._onButtonPress(false);
                }
            }
            else if (this.keyElement) {
                this.elementsDelegate.reset();
            }
            switch (type) {
                case 'gTile-k-right':
                case 'gTile-k-right-meta':
                    this.colKey = Math.min(this.colKey + 1, this.cols.length - 1);
                    this.rowKey = this.rowKey === -1 ? 0 : this.rowKey;
                    break;
                case 'gTile-k-left':
                case 'gTile-k-left-meta':
                    if (this.colKey == -1)
                        return;
                    this.colKey = Math.max(0, this.colKey - 1);
                    break;
                case 'gTile-k-up':
                case 'gTile-k-up-meta':
                    if (this.rowKey == -1)
                        return;
                    this.rowKey = Math.max(0, this.rowKey - 1);
                    break;
                case 'gTile-k-down':
                case 'gTile-k-down-meta':
                    this.rowKey = Math.min(this.rowKey + 1, this.rows.length - 1);
                    this.colKey = this.colKey === -1 ? 0 : this.colKey;
                    break;
                case 'gTile-k-left-monitor-move':
                    this.MoveToMonitor(getAdjacentMonitor(this.monitor, Side.LEFT));
                    break;
                case 'gTile-k-right-monitor-move':
                    this.MoveToMonitor(getAdjacentMonitor(this.monitor, Side.RIGHT));
                    break;
                case 'gTile-k-up-monitor-move':
                    this.MoveToMonitor(getAdjacentMonitor(this.monitor, Side.TOP));
                    break;
                case 'gTile-k-down-monitor-move':
                    this.MoveToMonitor(getAdjacentMonitor(this.monitor, Side.BOTTOM));
                    break;
                case 'gTile-k-first-grid':
                    (_b = (_a = this.app.config.gridSettingsButton) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b._onButtonPress();
                    break;
                case 'gTile-k-second-grid':
                    (_d = (_c = this.app.config.gridSettingsButton) === null || _c === void 0 ? void 0 : _c[1]) === null || _d === void 0 ? void 0 : _d._onButtonPress();
                    break;
                case 'gTile-k-third-grid':
                    (_f = (_e = this.app.config.gridSettingsButton) === null || _e === void 0 ? void 0 : _e[2]) === null || _f === void 0 ? void 0 : _f._onButtonPress();
                    break;
                case 'gTile-k-fourth-grid':
                    (_h = (_g = this.app.config.gridSettingsButton) === null || _g === void 0 ? void 0 : _g[3]) === null || _h === void 0 ? void 0 : _h._onButtonPress();
                    break;
            }
            this.keyElement = resolveKeyElement(this.elements, this.rowKey, this.colKey);
            if (this.keyElement)
                this.keyElement._onHoverChanged();
        };
        this.BeginTiling = () => {
            if (this.keyElement) {
                this.keyElement._onButtonPress(true);
                this.Reset();
            }
        };
        this.MoveToMonitor = (monitor) => {
            monitor = monitor ? monitor : this.app.CurrentMonitor;
            if (monitor.index == this.app.CurrentMonitor.index)
                return;
            this.app.MoveToMonitor(this.app.CurrentMonitor, monitor !== null && monitor !== void 0 ? monitor : this.app.CurrentMonitor);
        };
        this.destroy = () => {
            for (let r in this.elements) {
                for (let c in this.elements[r]) {
                    this.elements[r][c]._destroy();
                }
            }
            this.elementsDelegate._destroy();
            this.topbar._destroy();
            this.Reset();
            this.monitor = null;
            this.rows = null;
            this.title = null;
            this.cols = null;
            // Actually release the Clutter actors (removeChrome alone
            // only unparents them from the stage) - without this every
            // ReInitialize/monitor change leaked the whole grid actor
            // tree.
            this.actor.destroy();
            this.actor = null;
        };
        this.app = app;
        this.tableHeight = 200;
        this.tableWidth = 220;
        this.panelBorderOffset = 40;
        this.panelWidth = (this.tableWidth + this.panelBorderOffset);
        this.borderwidth = 2;
        this.actor = new BoxLayout({
            vertical: true,
            style_class: 'grid-panel',
            reactive: true,
            can_focus: true,
            track_hover: true,
            width: this.panelWidth
        });
        this.actor.connect('enter-event', this.OnMouseEnter);
        this.actor.connect('leave-event', this.OnMouseLeave);
        this.topbar = new TopBar(this.app, title);
        this.bottombar = new Table({
            homogeneous: true,
            style_class: 'bottom-box',
            can_focus: true,
            track_hover: true,
            reactive: true,
        });
        this.veryBottomBar = new Table({
            homogeneous: true,
            style_class: 'bottom-box very-bottom-box',
            can_focus: true,
            track_hover: true,
            reactive: true,
        });
        this.RebuildGridSettingsButtons();
        this.table = new BoxLayout({
            style_class: 'table',
            can_focus: true,
            track_hover: true,
            reactive: true,
            vertical: true,
            width: this.tableWidth,
            height: this.tableHeight
        });
        this.actor.add(this.topbar.actor, { x_fill: true });
        this.actor.add(this.table, { x_fill: false });
        this.actor.add(this.bottombar, { x_fill: false });
        this.actor.add(this.veryBottomBar, { x_fill: false });
        this.monitor = monitor;
        this.rows = rows;
        this.title = title;
        this.cols = cols;
        this.isEntered = false;
        let toggle = new ToggleSettingsButton(this.app.config, 'animation', SETTINGS_ANIMATION, "animation_black-symbolic");
        this.veryBottomBar.add(toggle.actor, { row: 0, col: 0, x_fill: false, y_fill: false });
        this.toggleSettingButtons.push(toggle);
        toggle = new ToggleSettingsButton(this.app.config, 'auto-close', SETTINGS_AUTO_CLOSE, "auto_close_black-symbolic");
        this.veryBottomBar.add(toggle.actor, { row: 0, col: 1, x_fill: false, y_fill: false });
        this.toggleSettingButtons.push(toggle);
        this.x = 0;
        this.y = 0;
        this.interceptHide = false;
        this.RebuildGridElements();
        this.normalScaleY = this.actor.scale_y;
        this.normalScaleX = this.actor.scale_x;
    }
    ChangeCurrentMonitor(monitor) {
        this.monitor = monitor;
        for (const row of this.elements) {
            for (const element of row) {
                element.monitor = this.monitor;
            }
        }
    }
    GetTableUnits(width, height) {
        const rowSpans = this.rows.map(r => r.span).reduce((p, c) => p += c);
        const colSpans = this.cols.map(r => r.span).reduce((p, c) => p += c);
        const widthUnit = width / colSpans - (2 * this.borderwidth);
        const heightUnit = height / rowSpans - (2 * this.borderwidth);
        return [Math.round(widthUnit), Math.round(heightUnit)];
    }
    GetTableSize() {
        const aspect = GetMonitorAspectRatio(this.monitor);
        if (!this.app.config.aspectRatio)
            return [220, 200];
        const newTableWidth = (aspect.widthIsLonger) ? 200 * aspect.ratio : 200;
        const newTableHeight = (aspect.widthIsLonger) ? 200 : 200 * aspect.ratio;
        return [newTableWidth, newTableHeight];
    }
    UpdateSettingsButtons() {
        for (const button of this.toggleSettingButtons) {
            button["_update"]();
        }
    }
    Reset() {
        this.colKey = -1;
        this.rowKey = -1;
        this.keyElement = null;
        this.elementsDelegate.reset();
    }
    async Show(x, y) {
        if (x != null && y != null)
            this.SetPosition(x, y);
        this.interceptHide = true;
        this.elementsDelegate.reset();
        let time = this.app.config.animation ? 0.3 : 0;
        Grid_Main.layoutManager.removeChrome(this.actor);
        Grid_Main.layoutManager.addChrome(this.actor);
        this.actor.scale_y = 0;
        if (time > 0) {
            await new Promise((resolve) => {
                Grid_Tweener.addTween(this.actor, {
                    time: time,
                    opacity: 255,
                    transition: 'easeOutQuad',
                    scale_y: this.normalScaleY,
                    onStart: () => this.actor.visible = true,
                    onComplete: () => { resolve(); this.OnShowComplete(); }
                });
            });
        }
        else {
            this.actor.opacity = 255;
            this.actor.visible = true;
            this.actor.scale_y = this.normalScaleY;
        }
        this.interceptHide = false;
    }
    Hide(immediate) {
        this.Reset();
        let time = this.app.config.animation && !immediate ? 0.3 : 0;
        if (time > 0) {
            Grid_Tweener.addTween(this.actor, {
                time: time,
                opacity: 0,
                scale_y: 0,
                transition: 'easeOutQuad',
                onComplete: () => { this.actor.visible = false; this.OnHideComplete(); }
            });
        }
        else {
            this.actor.opacity = 0;
            this.actor.visible = false;
            this.actor.scale_y = 0;
        }
    }
    SetPosition(x, y) {
        this.x = x;
        this.y = y;
        this.actor.set_position(x, y);
    }
};
Grid = Grid_decorate([
    addSignals
], Grid);

;

;// CONCATENATED MODULE: ../base/app.ts




const Cinnamon = imports.gi.Cinnamon;
const app_St = imports.gi.St;
const app_Main = imports.ui.main;
const app_Tweener = imports.ui.tweener;
let metadata;
class App {
    constructor(platform) {
        this.visible = false;
        this.tracker = Cinnamon.WindowTracker.get_default();
        this.monitors = app_Main.layoutManager.monitors;
        this.focusMetaWindowConnections = [];
        this.focusMetaWindowPrivateConnections = [];
        this.area = new app_St.BoxLayout({ style_class: 'grid-preview' });
        this.currentMonitor = app_Main.layoutManager.primaryMonitor;
        this.focusMetaWindow = null;
        this.grids = [];
        this.RefreshGrid = () => {
            for (const grid of this.grids) {
                grid.RefreshGridElements();
            }
            app_Main.layoutManager["_chrome"].updateRegions();
        };
        this.ToggleUI = () => {
            if (this.visible) {
                this.HideUI();
            }
            else {
                this.ShowUI();
            }
            return this.visible;
        };
        this.MoveToMonitor = async (current, newMonitor) => {
            if (current.index == newMonitor.index)
                return;
            if (!this.config.showGridOnAllMonitors) {
                const grid = this.CurrentGrid;
                if (grid)
                    grid.ChangeCurrentMonitor(newMonitor);
            }
            this.currentMonitor = newMonitor;
            this.MoveUIActor();
        };
        this.ShowUI = () => {
            this.focusMetaWindow = getFocusApp();
            const window = this.focusMetaWindow;
            // No focused window (empty desktop) - nothing to tile, and
            // dereferencing null below would throw.
            if (window == null)
                return;
            let wm_type = window.get_window_type();
            let layer = window.get_layer();
            // A desktop-type or layer-0 window can't be tiled, so no
            // grid is shown - and with no grid, binding the key
            // controls below would hijack Escape/arrows/Space (and,
            // with tile labels on, every letter key) with no visible
            // UI and no way out: Escape maps to ToggleUI, which with
            // `visible` still false just re-enters here. Bail out
            // before touching anything instead.
            if (wm_type === Meta.WindowType.DESKTOP || layer <= 0)
                return;
            this.area.visible = true;
            for (const grid of this.grids) {
                if (!this.config.showGridOnAllMonitors)
                    grid.ChangeCurrentMonitor(monitorForIndex(this.monitors, window.get_monitor(), app_Main.layoutManager.primaryMonitor));
                const [pos_x, pos_y] = (!this.config.useMonitorCenter && grid.monitor.index == this.currentMonitor.index) ? this.platform.get_window_center(window) : GetMonitorCenter(grid.monitor);
                // Clamped like MoveUIActor below, so the show tween starts
                // on-screen rather than gliding in from off the edge.
                const [show_x, show_y] = clampGridTopLeft(pos_x, pos_y, grid.actor.width, grid.actor.height, grid.monitor);
                grid.Show(show_x, show_y);
            }
            // Once for the whole UI, not once per grid - the per-grid
            // loops inside it already cover every monitor's grid.
            this.OnFocusedWindowChanged();
            this.visible = true;
            this.MoveUIActor();
            this.BindKeyControls();
        };
        this.HideUI = () => {
            this.RemoveKeyControls();
            // Drop any half-finished letter selection so it can't leak
            // into the next time the UI is opened (a stale first letter
            // would instantly complete the next selection).
            if (this.firstLetterSelection !== null) {
                const tile = this.getGridElementFromLetter(this.firstLetterSelection);
                if (tile)
                    tile._deactivate();
                this.firstLetterSelection = null;
            }
            for (const grid of this.grids) {
                grid.elementsDelegate.reset();
                grid.Hide(false);
            }
            this.area.visible = false;
            this.ResetFocusedWindow();
            this.visible = false;
            app_Main.layoutManager["_chrome"].updateRegions();
        };
        this.BindKeyControls = () => {
            app_Main.keybindingManager.addHotKey('gTile-close', 'Escape', this.ToggleUI);
            app_Main.keybindingManager.addHotKey('gTile-tile1', 'space', () => this.CurrentGrid.BeginTiling());
            app_Main.keybindingManager.addHotKey('gTile-tile2', 'Return', () => this.CurrentGrid.BeginTiling());
            for (let index in KEYCONTROL) {
                if (objHasKey(KEYCONTROL, index)) {
                    let key = KEYCONTROL[index];
                    let type = index;
                    app_Main.keybindingManager.addHotKey(type, key, () => this.CurrentGrid.OnKeyPressEvent(type, key));
                }
            }
            // Add keybindings for a-z and A-Z - but only when tile
            // labels are shown; with labels off the letters would
            // trigger invisible tiling behavior.
            if (this.config.selectUsingKeyboard) {
                for (let i = 0; i < 26; i++) {
                    const lowerCaseLetter = String.fromCharCode('a'.charCodeAt(0) + i);
                    app_Main.keybindingManager.addHotKey(`gTile-letter-${lowerCaseLetter}`, lowerCaseLetter, () => this.handleLetterInput(lowerCaseLetter));
                    const upperCaseLetter = String.fromCharCode('A'.charCodeAt(0) + i);
                    app_Main.keybindingManager.addHotKey(`gTile-letter-${upperCaseLetter}`, '<Shift>' + lowerCaseLetter, () => this.handleLetterInput(upperCaseLetter));
                }
            }
        };
        this.RemoveKeyControls = () => {
            app_Main.keybindingManager.removeHotKey('gTile-close');
            app_Main.keybindingManager.removeHotKey('gTile-tile1');
            app_Main.keybindingManager.removeHotKey('gTile-tile2');
            for (let type in KEYCONTROL) {
                app_Main.keybindingManager.removeHotKey(type);
            }
            // Remove keybindings for a-z and A-Z
            for (let i = 0; i < 26; i++) {
                const lowerCaseLetter = String.fromCharCode('a'.charCodeAt(0) + i);
                app_Main.keybindingManager.removeHotKey(`gTile-letter-${lowerCaseLetter}`);
                const upperCaseLetter = String.fromCharCode('A'.charCodeAt(0) + i);
                app_Main.keybindingManager.removeHotKey(`gTile-letter-${upperCaseLetter}`);
            }
        };
        this.ReInitialize = () => {
            this.monitors = app_Main.layoutManager.monitors;
            this.DestroyGrid();
            this.InitGrid();
        };
        this.DestroyGrid = () => {
            this.RemoveKeyControls();
            for (const grid of this.grids) {
                if (typeof grid != 'undefined') {
                    grid.Hide(true);
                    app_Main.layoutManager.removeChrome(grid.actor);
                    grid.destroy();
                }
            }
            this.grids = [];
        };
        this.MoveUIActor = () => {
            if (!this.visible) {
                return;
            }
            let window = this.focusMetaWindow;
            if (!window)
                return;
            for (const grid of this.Grids) {
                const [newTableWidth, newTableHeight] = grid.GetTableSize();
                const gridWidth = grid.actor.width + (newTableWidth - grid.table.width);
                const gridHeight = grid.actor.height + (newTableHeight - grid.table.height);
                let pos_x;
                let pos_y;
                let monitor = grid.monitor;
                let isGridMonitor = window.get_monitor() === grid.monitor.index;
                if (isGridMonitor) {
                    [pos_x, pos_y] = (!this.config.useMonitorCenter) ? this.platform.get_window_center(window) : GetMonitorCenter(monitor);
                }
                else {
                    [pos_x, pos_y] = GetMonitorCenter(monitor);
                }
                // Keep the whole popup on its monitor - see
                // clampGridTopLeft's comment for the edge-clamping bug
                // the inline version of this used to have.
                [pos_x, pos_y] = clampGridTopLeft(pos_x, pos_y, gridWidth, gridHeight, monitor);
                grid.AdjustTableSize(newTableWidth, newTableHeight);
                app_Tweener.addTween(grid.actor, {
                    time: this.config.AnimationTime,
                    x: pos_x,
                    y: pos_y,
                    transition: 'easeOutQuad',
                    onComplete: this.updateRegions
                });
            }
        };
        this.updateRegions = () => {
            app_Main.layoutManager["_chrome"].updateRegions();
        };
        this.OnFocusedWindowChanged = () => {
            let window = getFocusApp();
            if (!window) {
                this.ResetFocusedWindow();
                for (const grid of this.grids) {
                    grid.topbar._set_title('gTile');
                }
                return;
            }
            this.ResetFocusedWindow();
            this.focusMetaWindow = window;
            // The single grid follows the focused window; CurrentGrid is
            // safe to consult here whatever state currentMonitor is in
            // (see selectCurrentGrid's comment), and monitorForIndex
            // never yields undefined for a -1 from get_monitor().
            const windowMonitor = monitorForIndex(this.monitors, this.focusMetaWindow.get_monitor(), app_Main.layoutManager.primaryMonitor);
            if (!this.config.showGridOnAllMonitors) {
                const grid = this.CurrentGrid;
                if (grid)
                    grid.ChangeCurrentMonitor(windowMonitor);
            }
            this.currentMonitor = windowMonitor;
            this.focusMetaWindowPrivateConnections.push(...this.platform.subscribe_to_focused_window_changes(this.focusMetaWindow, this.MoveUIActor));
            let app = this.tracker.get_window_app(this.focusMetaWindow);
            let title = this.focusMetaWindow.get_title();
            if (app) {
                for (const grid of this.grids) {
                    grid.topbar._set_app(app, title);
                }
            }
            else {
                for (const grid of this.grids) {
                    grid.topbar._set_title(title);
                }
            }
            this.MoveUIActor();
        };
        this.OnCenteredToWindowChanged = () => {
            this.MoveUIActor();
        };
        this.ResetFocusedWindow = () => {
            var _a;
            if (this.focusMetaWindowConnections.length > 0) {
                for (var idx in this.focusMetaWindowConnections) {
                    (_a = this.focusMetaWindow) === null || _a === void 0 ? void 0 : _a.disconnect(this.focusMetaWindowConnections[idx]);
                }
            }
            if (this.focusMetaWindow != null && this.focusMetaWindowPrivateConnections.length > 0) {
                this.platform.unsubscribe_from_focused_window_changes(this.focusMetaWindow, ...this.focusMetaWindowPrivateConnections);
            }
            this.focusMetaWindow = null;
            this.focusMetaWindowConnections = [];
            this.focusMetaWindowPrivateConnections = [];
        };

        this.handleLetterInput = (letter) => {
            if (this.firstLetterSelection === null) {
                this.firstLetterSelection = letter;
                const selectedTile = this.getGridElementFromLetter(letter);
                if (selectedTile) {
                    selectedTile._activate(); // Highlight the first selected tile
                }
            } else {
                const firstTile = this.getGridElementFromLetter(this.firstLetterSelection);
                const secondTile = this.getGridElementFromLetter(letter);

                if (firstTile) {
                    firstTile._deactivate(); // De-highlight the first selected tile
                }

                if (firstTile && secondTile) {
                    // Calculate the combined rectangle
                    const [areaX, areaY, areaWidth, areaHeight] = this.CurrentGrid.elementsDelegate._computeAreaPositionSize(firstTile, secondTile);

                    // Resize and move the focused window
                    if (this.FocusMetaWindow) {
                        this.platform.reset_window(this.FocusMetaWindow);
                        this.platform.move_resize_window(this.FocusMetaWindow, areaX, areaY, areaWidth, areaHeight);
                    }
                }

                // Reset for next selection
                this.firstLetterSelection = null;
                this.HideUI(); // Hide the UI after selection
            }
        };

        this.getGridElementFromLetter = (letter) => {
            const grid = this.CurrentGrid;
            if (!grid || !grid.elements) return null;

            const numCols = grid.cols.length;
            // Reverse of the tileIndexToLabel used to draw the labels -
            // both live in tile-labels.js so they can't disagree.
            const labelIndex = tileLabelToIndex(letter);
            if (labelIndex === null) return null;

            const r = Math.floor(labelIndex / numCols);
            const c = labelIndex % numCols;

            if (grid.elements[r] && grid.elements[r][c]) {
                return grid.elements[r][c];
            }

            return null;
        };

        this.firstLetterSelection = null;
        this.platform = platform;
        app_Main.uiGroup.add_actor(this.area);
        this.config = new Config(this);
        this.InitGrid();
        // Stored so destroy() can disconnect it - otherwise every
        // destroyed App (extension reload, monitor change) would keep
        // reacting to focus changes forever. Monitor changes are handled
        // by extension.ts's own monitors-changed handler, which destroys
        // and recreates the whole App - no second connection here.
        this.trackerSignal = this.tracker.connect("notify::focus-app", this.OnFocusedWindowChanged);
    }
    get CurrentMonitor() {
        return this.currentMonitor;
    }
    get FocusMetaWindow() {
        return this.focusMetaWindow;
    }
    get CurrentGrid() {
        const grid = selectCurrentGrid(this.grids, this.config.showGridOnAllMonitors, this.currentMonitor.index);
        return grid;
    }
    get Grids() {
        return this.grids;
    }
    destroy() {
        if (this.trackerSignal) {
            this.tracker.disconnect(this.trackerSignal);
            this.trackerSignal = null;
        }
        this.config.destroy();
        this.DestroyGrid();
        this.ResetFocusedWindow();
    }
    InitGrid() {
        this.currentMonitor = app_Main.layoutManager.primaryMonitor;
        const monitors = this.config.showGridOnAllMonitors ? this.monitors : [this.currentMonitor];
        this.RemoveKeyControls();
        this.grids = [];
        for (const monitor of monitors) {
            const grid = new Grid(this, monitor, 'gTile', this.config.nbCols, this.config.nbRows);
            app_Main.layoutManager.addChrome(grid.actor, { visibleInFullscreen: true });
            grid.actor.set_opacity(0);
            grid.Hide(true);
            grid.connect('hide-tiling', this.HideUI);
            this.grids.push(grid);
        }
    }
}

;// CONCATENATED MODULE: ./utils.ts
const utils_Meta = imports.gi.Meta;
const utils_Main_0 = imports.ui.main;
// Hook installed by extension.ts's enable() (cleared again on
// disable): called with the window at the start of every reset_window,
// which is the first step of every tiling action this extension
// performs (overlay click, letter selection, DBus TileFocusedWindow,
// auto-tile). It lets enable()'s per-window maximize-tracking maps
// (nativeRestoreTarget et al.) drop their entries for a window the
// moment the extension itself re-tiles it - otherwise a stale
// nativeRestoreTarget entry left over from an earlier native maximize
// would, when the unmaximize this reset performs completes ('size-
// changed' arrives after the tile has been applied), see a frame rect
// that doesn't match its recorded pre-maximize rect and snap the
// window back to that old rect, silently undoing the just-applied
// tile.
let prune_window_state_hook = null;
const set_prune_window_state_hook = (fn) => {
    prune_window_state_hook = fn;
};
const reset_window = (metaWindow) => {
    if (metaWindow == null)
        return;
    if (prune_window_state_hook) {
        try {
            prune_window_state_hook(metaWindow);
        } catch (e) { }
    }
    metaWindow.unmaximize(utils_Meta.MaximizeFlags.HORIZONTAL);
    metaWindow.unmaximize(utils_Meta.MaximizeFlags.VERTICAL);
    metaWindow.unmaximize(utils_Meta.MaximizeFlags.HORIZONTAL | utils_Meta.MaximizeFlags.VERTICAL);
};
const _getInvisibleBorderPadding = (metaWindow) => {
    let outerRect = metaWindow.get_frame_rect();
    let inputRect = metaWindow.get_buffer_rect();
    let [borderX, borderY] = [outerRect.x - inputRect.x, outerRect.y - inputRect.y];
    return [borderX, borderY];
};
const move_maximize_window = (metaWindow, x, y) => {
    if (metaWindow == null)
        return;
    let [borderX, borderY] = _getInvisibleBorderPadding(metaWindow);
    x = x - borderX;
    y = y - borderY;
    metaWindow.move_frame(true, x, y);
    metaWindow.maximize(utils_Meta.MaximizeFlags.HORIZONTAL | utils_Meta.MaximizeFlags.VERTICAL);
};

// mutable GAP value and setter (default 10). All normalization lives
// in normalizeGapSize (gap-math.js, embedded above) so it's unit-
// tested - callers pass the raw setting value straight through.
let GAP_SIZE = 10;
const set_gap_size = (size) => {
    GAP_SIZE = normalizeGapSize(size);
};

const move_resize_window = (metaWindow, x, y, width, height) => {
    if (metaWindow == null)
        return;

    // Try to find the monitor that contains the target rectangle.
    // Fall back to primary monitor if none match.
    let monitor = null;
    try {
        const monitors = utils_Main_0.layoutManager.monitors;
        for (const mon of monitors) {
            if (x >= mon.x && (x + width) <= (mon.x + mon.width) &&
                y >= mon.y && (y + height) <= (mon.y + mon.height)) {
                monitor = mon;
                break;
            }
        }
    }
    catch (e) {
        monitor = null;
    }
    if (!monitor) {
        monitor = utils_Main_0.layoutManager.primaryMonitor;
    }

    // Use the shared helper so panel hideability is evaluated the same way everywhere.
    let usableLeft, usableTop, usableWidth, usableHeight;
    try {
        [usableLeft, usableTop, usableWidth, usableHeight] = getUsableScreenArea(monitor);
    } catch (e) {
        usableLeft = monitor.x;
        usableTop = monitor.y;
        usableWidth = monitor.width;
        usableHeight = monitor.height;
    }
    // Full gap at usable-area edges, half gap on internal sides so
    // neighboring tiles end up GAP_SIZE apart - see gap-math.js (whose
    // embedded copy above carries the details and the unit tests).
    [x, y, width, height] = computeGappedRect(x, y, width, height, usableLeft, usableTop, usableWidth, usableHeight, GAP_SIZE);

    // move_resize_frame alone already sets both position and size in one
    // call - a trailing move_frame(x, y) here was genuinely redundant for
    // the final geometry (same x/y, already applied) and triggered a
    // second, unnecessary geometry-negotiation call immediately after the
    // first. Live-confirmed as the cause of a real bug: a window placed
    // this way (e.g. by traditional-tiling's auto-placement), later
    // native-maximized then restored via the titlebar button, came back
    // smaller than its original size - with maximize-with-gaps off, so
    // none of this extension's own code touches the window during that
    // cycle; it's purely Mutter's own maximize/restore, meaning Mutter's
    // internal saved_rect (captured at maximize time) didn't match what
    // was actually on screen. Root-caused to this redundant second call
    // rather than move_resize_frame itself - manually-resized windows
    // (never touched by this function) restored exactly, every time.
    metaWindow.move_resize_frame(true, x, y, width, height);
    ensure_frame_position(metaWindow, x, y);
};
// Windows that set WM_NORMAL_HINTS resize increments (xterm and
// friends): Muffin snaps the requested size to the client's character
// grid, and in that adjusted path the requested POSITION gets dropped
// entirely - live-confirmed on Cinnamon 6.x with xterm: after a bare
// move_resize_frame the size had applied but the window still sat at
// Muffin's cascade placement, while a GTK window (no increments) got
// both. This follow-up move_frame is issued ONLY when the position
// verifiably failed to land - an unconditional second geometry call is
// exactly what caused the maximize/restore shrink bug documented in
// move_resize_window above, so well-behaved windows (the overwhelming
// majority) must keep taking the single-call path.
const ensure_frame_position = (metaWindow, x, y) => {
    try {
        const rect = metaWindow.get_frame_rect();
        if (Math.abs(rect.x - x) > 1 || Math.abs(rect.y - y) > 1) {
            metaWindow.move_frame(true, x, y);
        }
    } catch (e) { }
};
// Same as move_resize_window, minus the gap padding - move_resize_window
// always shrinks by at least HALF_GAP on every side (there's no
// zero-padding path through it, by design - it exists for placing tiles
// next to each other), which is wrong for restoring a window to an
// exact previously-recorded rect (e.g. its pre-maximize floating
// geometry): applying gap padding on top of a rect that's already the
// right size makes the restored window smaller than it originally was.
const move_resize_window_exact = (metaWindow, x, y, width, height) => {
    if (metaWindow == null)
        return;
    // No unconditional trailing move_frame call here either - see
    // move_resize_window's own comment on why that was removed;
    // ensure_frame_position below re-issues the position only for
    // windows whose size-increment snapping dropped it.
    metaWindow.move_resize_frame(true, x, y, width, height);
    ensure_frame_position(metaWindow, x, y);
};
const get_window_center = (window) => {
    const pos_x = window.get_frame_rect().width / 2 + window.get_frame_rect().x;
    const pos_y = window.get_frame_rect().height / 2 + window.get_frame_rect().y;
    return [pos_x, pos_y];
};
const subscribe_to_focused_window_changes = (window, callback) => {
    const connections = [];
    let actor = window.get_compositor_private();
    if (actor) {
        connections.push(window.connect('size-changed', callback));
        connections.push(window.connect('position-changed', callback));
    }
    return connections;
};
const unsubscribe_from_focused_window_changes = (window, ...signals) => {
    for (const idx of signals) {
        window.disconnect(idx);
    }
};

;// CONCATENATED MODULE: ./extension.ts

let monitorChangedSignal = null;
let dbusRegistrationId = null;
let dbusOwnerId = null;
let windowCreatedSignal = null; // auto-tile on window-created
let sizeChangeSignal = null; // maximize-with-gaps (pre)
let sizeChangedSignal = null; // maximize-with-gaps (post)
let windowDestroyedSignal = null; // prunes per-window state maps
let focusWindowSignal = null; // scrollable tiling (focus-driven scrolling)
// The extension's own global hotkeys (beyond the overlay toggle,
// which Config manages): settings key, target property,
// keybindingManager registration name, and the action verb each one
// drives (cycle-* runs cycleTilingMode, open-settings spawns the
// settings window, everything else goes through
// scrollableColumnAction - see rebindGtileHotkeys). Module scope
// (static data, no closures) so enable()'s registration and
// disable()'s removal share one source of truth instead of a
// hand-synced list.
const GTILE_HOTKEYS = [
    { settingKey: 'hotkey-cycle-tiling-mode', prop: 'cycleForward', name: 'gtile-cycle-tiling-mode', action: 'cycle-forward' },
    { settingKey: 'hotkey-cycle-tiling-mode-backward', prop: 'cycleBackward', name: 'gtile-cycle-tiling-mode-backward', action: 'cycle-backward' },
    { settingKey: 'hotkey-focus-column-left', prop: 'focusLeft', name: 'gtile-focus-column-left', action: 'focus-left' },
    { settingKey: 'hotkey-focus-column-right', prop: 'focusRight', name: 'gtile-focus-column-right', action: 'focus-right' },
    { settingKey: 'hotkey-move-column-left', prop: 'moveLeft', name: 'gtile-move-column-left', action: 'move-left' },
    { settingKey: 'hotkey-move-column-right', prop: 'moveRight', name: 'gtile-move-column-right', action: 'move-right' },
    { settingKey: 'hotkey-open-settings', prop: 'openSettings', name: 'gtile-open-settings', action: 'open-settings' },
];
// Bumped on every enable() AND disable(). Long-lived callbacks that
// survive teardown (per-window 'unmanaging' closures, pending idle/
// timeout callbacks) capture the generation current when they were
// created and bail out if it no longer matches - otherwise windows
// tiled before a disable would keep re-tiling their siblings on close
// forever, against state maps from a dead enable() scope.
let enableGeneration = 0;
let extension_metadata;
let app;
const platform = {
    move_maximize_window: move_maximize_window,
    move_resize_window: move_resize_window,
    move_resize_window_exact: move_resize_window_exact,
    set_gap_size: set_gap_size,
    reset_window: reset_window,
    get_window_center: get_window_center,
    subscribe_to_focused_window_changes: subscribe_to_focused_window_changes,
    unsubscribe_from_focused_window_changes: unsubscribe_from_focused_window_changes
};
const init = (meta) => {
    extension_metadata = meta;
    imports.gi.Gtk.IconTheme.get_default().append_search_path(extension_metadata.path + "/../icons");
};
const enable = () => {
    enableGeneration += 1;
    const thisGeneration = enableGeneration;
    app = new App(platform);
    monitorChangedSignal = Main.layoutManager.connect('monitors-changed', () => {
        app.destroy();
        app = new App(platform);
        // The recreated App brings a fresh Config/ExtensionSettings
        // instance - rebind the auto-tile targets onto it (see
        // bindAutoTileSettings below).
        bindAutoTileSettings();
        // Per-monitor:workspace keys below would otherwise reference
        // monitor indices that no longer mean anything once the set
        // of monitors changes.
        traditionalTilingState.clear();
        traditionalFullState.clear();
        scrollableTilingState.clear();
        pendingPreMaximizeRect.clear();
        gapMaximizedState.clear();
        nativeRestoreTarget.clear();
    });

    // --- Auto-tile mode: a settings-panel combobox (see
    // settings-schema.json's "tiling-mode" entry) with five values -
    // "off" (the schema default - nothing automatic, only the manual
    // "Tile with gaps N" hotkeys), "rules" (tile-rules.json matching),
    // "traditional" (bypasses tile-rules.json entirely and sweeps every
    // new window into a binary-tree dynamic-tiling cycle instead, capped
    // at 3 windows), "traditional-full" (the same tree, uncapped -
    // see treeInsert/treeRemove above and their own comments for the
    // tree itself), or "scrollable" (a Niri-style scrolling column
    // strip - see the embedded scrollable-tiling.js block above for
    // the pure logic and the scrollable helpers below for the
    // Meta-touching layer; the marker comments around that block are
    // load-bearing for tests/check-sync.sh, so prose here says
    // "embedded block", never the literal marker text, which the
    // extraction matches line-by-line). Bound onto small standalone
    // target objects rather
    // than the App class, since this whole feature lives in the
    // standalone window-created handler below, not inside App.
    //
    // maximize-with-gaps (see settings-schema.json's "maximize-with-gaps"
    // entry) is an opt-in checkbox, independent of tiling-mode above -
    // applies no matter which tiling mode is selected.
    //
    // Both keys are bound through the ONE ExtensionSettings instance
    // Config already owns (app.config.settings) - never a second
    // `new Settings.ExtensionSettings(..., 'gTile@OhMyDebn')`. Live-
    // confirmed on Cinnamon 6.6.9 that two ExtensionSettings instances
    // for the SAME extension UUID silently collide:
    // Main.settingsManager.register(uuid, instanceId, obj) stores
    // exactly one object per (uuid, instanceId), so a second
    // construction overwrites the first in that registry, and only the
    // surviving (last-registered) instance ever receives live setting-
    // changed updates afterward - the other is frozen at whatever value
    // it had at construction time until the extension is fully reloaded.
    // (Not reproducible on every Cinnamon build - older ones have an
    // additional per-instance file-watcher fallback that masks the
    // collision - but a single shared instance is correct regardless.)
    // Config.destroy() finalizes its instance, so the monitors-changed
    // recreate above deregisters the old one before the new Config
    // registers, and bindAutoTileSettings re-attaches these targets to
    // the survivor.
    const tilingModeSettingsTarget = {};
    const maximizeWithGapsSettingsTarget = {};
    const scrollableSettingsTarget = {};

    // Tiling hotkeys (mode cycling + scrollable column navigation),
    // registered by the extension itself through Cinnamon's
    // keybindingManager - the same mechanism as the main overlay
    // hotkey - so they ship with the extension and are editable in
    // its settings UI (Hotkeys tab), with no external keybinding
    // setup needed. The action implementations (cycleTilingMode,
    // scrollableColumnAction) are defined further down in this scope;
    // the closures below only evaluate them at keypress time, long
    // after enable() has finished. Column keys outside scrollable
    // mode, or with a focused window that isn't in a strip, are
    // silent no-ops. The GTILE_HOTKEYS table itself lives at module
    // scope, shared with disable()'s removal loop.
    const gtileHotkeysTarget = {};
    const rebindGtileHotkeys = () => {
        for (const hotkey of GTILE_HOTKEYS) {
            Main.keybindingManager.removeHotKey(hotkey.name);
            const binding = gtileHotkeysTarget[hotkey.prop];
            // A binding cleared in the settings UI disables that hotkey.
            if (typeof binding === 'string' && binding.length > 0) {
                Main.keybindingManager.addHotKey(hotkey.name, binding, () => {
                    try {
                        if (hotkey.action === 'cycle-forward' || hotkey.action === 'cycle-backward') {
                            cycleTilingMode(hotkey.action === 'cycle-forward' ? 1 : -1);
                        } else if (hotkey.action === 'open-settings') {
                            openSettingsWindow();
                        } else {
                            scrollableColumnAction(hotkey.action);
                        }
                    } catch (e) {
                        global.log('gTile: hotkey ' + hotkey.name + ' failed: ' + e);
                    }
                });
            }
        }
    };

    const bindAutoTileSettings = () => {
        app.config.settings.bindWithObject(tilingModeSettingsTarget, 'tiling-mode', 'mode', null, null);
        app.config.settings.bindWithObject(maximizeWithGapsSettingsTarget, 'maximize-with-gaps', 'enabled', null, null);
        app.config.settings.bindWithObject(scrollableSettingsTarget, 'scrollable-column-width', 'columnWidthPercent', null, null);
        app.config.settings.bindWithObject(scrollableSettingsTarget, 'scroll-animation-duration', 'scrollDurationMs', null, null);
        for (const hotkey of GTILE_HOTKEYS) {
            app.config.settings.bindWithObject(gtileHotkeysTarget, hotkey.settingKey, hotkey.prop, rebindGtileHotkeys, null);
        }
    };
    bindAutoTileSettings();
    rebindGtileHotkeys();

    // Map from "monitorIndex:workspaceIndex" to a binary tiling tree's
    // state ({ root, insertionLeaf, leafCount } - see treeInsert/
    // treeRemove above) - independent tree per monitor+workspace pair,
    // not one global tree. "Traditional tiling" (capped at 3 leaves) and
    // "Traditional Full" (uncapped) share the exact same tree logic -
    // only the maxLeaves argument passed to treeInsert differs - but
    // keep separate Maps so switching between the two modes mid-session
    // (no state reset on mode-switch, by design) can't let one mode's
    // tree leak into the other's.
    const traditionalTilingState = new Map();
    const traditionalFullState = new Map();

    // Maximize-with-gaps state (see the feature's own try block below
    // for the full explanation): pendingPreMaximizeRect holds each
    // window's rect from just before its current maximize transition
    // (captured on 'size-change', consumed on 'size-changed');
    // gapMaximizedState holds { restore, gapped } per gap-maximized
    // window - `restore` is the rect to go back to, `gapped` the rect
    // the gap-maximize actually produced (captured just after applying
    // it), so a second maximize trigger can tell "still exactly where
    // we put it" (reroute into a true restore) from "moved/resized by
    // the user since" (treat as a fresh maximize and re-apply gaps).
    // All three maps are pruned when a window is destroyed (see the
    // window_manager 'destroy' hook below) so closed windows' ids don't
    // accumulate for the whole session.
    const pendingPreMaximizeRect = new Map();
    const gapMaximizedState = new Map();

    // Native-maximize restore correction (independent of the
    // maximize-with-gaps checkbox - see the feature's own try block
    // below): windowId -> the rect captured just before ANY native
    // maximize, tracked unconditionally. Live-confirmed (via debug
    // logging, not guessed): Muffin's own unmaximize sometimes doesn't
    // restore to the pre-maximize rect it itself correctly recorded -
    // specifically when that rect is close enough to the full monitor
    // area to look basically maximized already (exactly what
    // tree-tiling's own small default gap produces for a single-window
    // tile). A window resized to something clearly NOT maximized-looking
    // (a normal manual resize, or a large gap) restores exactly; a
    // near-full-screen one shrinks by a consistent ~8% on each axis on
    // restore, even though Muffin's own oldFrameRect capture at maximize
    // time was byte-for-byte correct. Since maximize-with-gaps handles
    // its own restores via move_resize_window_exact already (never
    // trusting Muffin's native restore to begin with), this only needs
    // to run when that checkbox is off.
    const nativeRestoreTarget = new Map();

    // Every tiling action this extension performs starts by resetting
    // (unmaximizing) the window - clear that window's maximize-tracking
    // entries at that moment, so the size-changed handlers below can't
    // act on state from a maximize that this tile has just superseded
    // (see set_prune_window_state_hook's own comment in utils for the
    // exact failure this prevents). The closure captures these Maps
    // directly, so it stays correct across the monitors-changed
    // clear() calls above.
    set_prune_window_state_hook((win) => {
        const id = win.get_id();
        pendingPreMaximizeRect.delete(id);
        gapMaximizedState.delete(id);
        nativeRestoreTarget.delete(id);
    });

    // Windows that have started unmanaging. Marked SYNCHRONOUSLY at the
    // top of every per-window 'unmanaging' hook below - before any
    // deferred (idle) work can possibly run - and consulted by every
    // rebalance/re-layout before touching a window. Live-confirmed
    // necessary: closing several tracked windows at once (one pkill of
    // two strip windows) had window A's deferred removal re-layout
    // window B while B was itself already mid-unmanage, and a geometry
    // call on a window in that state dies in
    // meta_window_get_workspaces ("code should not be reached") - a
    // native g_error abort that takes down all of Cinnamon and that no
    // JS try/catch can intercept. GLib drains pending events (both
    // windows' unmanaging emissions) before dispatching idles, so the
    // synchronous mark is reliably visible to every deferred callback.
    // Entries are dropped in the window_manager 'destroy' hook below,
    // alongside the per-window map pruning.
    const dyingWindows = new Set();

    // Windows created but not yet through their hide-until-first-frame
    // placement (see hideNewWindowThenPlace below, which adds/removes
    // entries itself). The mirror image of dyingWindows: touching a
    // BRAND-NEW window from another window's re-layout dies in the
    // same meta_window_get_workspaces native abort as touching a dying
    // one - live-confirmed by launching two windows simultaneously in
    // scrollable mode: the second window's insert re-layouts the strip
    // and moved the first window milliseconds after its creation,
    // before its workspace assignment settled, killing Cinnamon.
    // Re-layouts skip settling windows entirely; a scrollable settling
    // window still lands correctly because its own deferred placement
    // re-reads the CURRENT strip state at settle time (the
    // resolvePlacement callback) rather than using creation-time
    // coordinates.
    const settlingWindows = new Set();

    // --- Scrollable tiling state and helpers (tiling-mode
    // "scrollable"): one strip per monitor+workspace, same keying as
    // the tree modes' Maps above. Each state is
    // { columns, firstVisible, monitorIndex } - `columns` is the
    // ordered array of Meta.Windows (one column each), `firstVisible`
    // the viewport's leftmost column index, `monitorIndex` the monitor
    // the strip was created on (kept in the state because later events
    // - focus changes, DBus calls, unmanaging - arrive with only the
    // window in hand). The pure strip logic lives in the embedded
    // scrollable-tiling.js block above; these helpers are the thin
    // Meta-touching layer, defined before the DBus block below because
    // its column-navigation methods use them too.
    const scrollableTilingState = new Map();

    const scrollableWidthFraction = () =>
        columnWidthFraction(scrollableSettingsTarget.columnWidthPercent);

    // Which strip (if any) currently tracks `win`. Linear scan over the
    // few monitor:workspace entries - windows carry no back-pointer.
    const scrollableFindWindow = (win) => {
        for (const [key, state] of scrollableTilingState) {
            const index = state.columns.indexOf(win);
            if (index !== -1)
                return { key: key, state: state, index: index };
        }
        return null;
    };

    // Effective tiling-animation duration in ms right now. The
    // scroll-animation-duration setting is the knob (0 = disabled -
    // see normalizeScrollDuration in the embedded scrollable-tiling.js
    // block above, which also handles unset/garbage values; the key
    // name predates this covering the tree modes too and is kept for
    // settings compatibility), except that Cinnamon's system-wide
    // desktop-effects switch being off forces 0 regardless: someone
    // who turned off all effects (performance, motion sensitivity)
    // must not get animations from this extension either. Deliberately
    // NOT tied to the "Popup animation" checkbox - that governs only
    // the overlay popup's own tweens.
    const tilingAnimationDurationMs = () => {
        try {
            if (!global.settings.get_boolean('desktop-effects'))
                return 0;
        } catch (e) { }
        return normalizeScrollDuration(scrollableSettingsTarget.scrollDurationMs);
    };

    // Visual glide for a window that automatic tiling just
    // repositioned and/or resized: the real window has ALREADY been
    // moved (WM state is always correct and instant - never animated
    // per-frame through the constraint solver), so this offsets and
    // scales the compositor actor back to the window's previous frame
    // box and tweens both to identity - the window's content stretches
    // during the tween while the client catches up, the exact same
    // accepted artifact Hyprland's own default window animations show
    // during resizes. Scaling is about the actor's top-left (pivot
    // 0,0) so the frame's corner tracks the translation; for
    // client-decorated windows the actor origin includes the shadow
    // inset, which makes the start box off by inset*(scale-1) pixels -
    // transient, small, and gone by the end of the tween.
    // removeTweens is scoped to exactly our four properties so a rapid
    // follow-up re-layout only cancels OUR in-flight animation, never
    // one of Cinnamon's own effects on that actor.
    const animateActorFromPrevious = (win, rectBefore, durationMs) => {
        try {
            const actor = win.get_compositor_private();
            if (!actor || isFinalized(actor))
                return;
            const rectAfter = win.get_frame_rect();
            if (rectAfter.width <= 0 || rectAfter.height <= 0)
                return;
            const dx = rectBefore.x - rectAfter.x;
            const dy = rectBefore.y - rectAfter.y;
            const sx = rectBefore.width / rectAfter.width;
            const sy = rectBefore.height / rectAfter.height;
            if (dx === 0 && dy === 0 && sx === 1 && sy === 1)
                return;
            const Tweener = imports.ui.tweener;
            Tweener.removeTweens(actor, 'translation_x', 'translation_y', 'scale_x', 'scale_y');
            actor.set_pivot_point(0, 0);
            actor.translation_x = dx;
            actor.translation_y = dy;
            actor.scale_x = sx;
            actor.scale_y = sy;
            Tweener.addTween(actor, {
                translation_x: 0,
                translation_y: 0,
                scale_x: 1,
                scale_y: 1,
                time: durationMs / 1000,
                transition: 'easeOutQuad',
                onComplete: () => {
                    try {
                        actor.translation_x = 0;
                        actor.translation_y = 0;
                        actor.scale_x = 1;
                        actor.scale_y = 1;
                    } catch (e) { }
                },
            });
        } catch (e) {
            global.log('gTile: tiling animation failed: ' + e);
        }
    };

    // Re-apply a strip's current layout: visible columns are
    // unminimized and placed through move_resize_window (so the
    // usual gap padding applies - a lone full-width column ends up
    // looking exactly like a gap-maximized window), off-viewport
    // columns are minimized (the paged-viewport design: fully
    // offscreen placement isn't safe on X11 - past one monitor's edge
    // is the next monitor, and Muffin's constraint solver may clamp it
    // anyway). skipWindow is a brand-new window the caller places
    // itself via hideNewWindowThenPlace's hide-until-first-frame
    // sequence.
    const applyScrollableLayout = (state, skipWindow) => {
        const lm = imports.ui.main.layoutManager;
        const monitor = (Number.isInteger(state.monitorIndex) && lm.monitors[state.monitorIndex])
            ? lm.monitors[state.monitorIndex] : lm.primaryMonitor;
        const [screenX, screenY, screenWidth, screenHeight] = getUsableScreenArea(monitor);
        const animDurationMs = tilingAnimationDurationMs();
        const layout = stripLayout(state.columns, state.firstVisible, scrollableWidthFraction());
        for (const entry of layout) {
            if (entry.window === skipWindow)
                continue;
            // A dying or still-settling window must not be touched at
            // all - see dyingWindows'/settlingWindows' own comments
            // above (native abort, not a catchable exception). A
            // settling window's own deferred placement handles it.
            if (dyingWindows.has(entry.window) || settlingWindows.has(entry.window))
                continue;
            try {
                if (entry.visible) {
                    const wasMinimized = entry.window.minimized;
                    if (wasMinimized)
                        entry.window.unminimize();
                    // Animate only already-visible windows, and only
                    // with a non-zero animation duration - a window
                    // entering the viewport from minimized gets
                    // Cinnamon's own unminimize effect instead
                    // (stacking our tween on top of that would fight
                    // it).
                    let rectBefore = null;
                    if (!wasMinimized && animDurationMs > 0) {
                        try {
                            rectBefore = entry.window.get_frame_rect();
                        } catch (e) { }
                    }
                    platform.reset_window(entry.window);
                    platform.move_resize_window(entry.window,
                        screenX + entry.region.x * screenWidth, screenY,
                        entry.region.width * screenWidth, screenHeight);
                    if (rectBefore)
                        animateActorFromPrevious(entry.window, rectBefore, animDurationMs);
                }
                else if (!entry.window.minimized) {
                    entry.window.minimize();
                }
            } catch (e) {
                global.log('gTile: scrollable layout apply failed: ' + e);
            }
        }
    };

    // The four column-navigation actions, shared verbatim by the
    // extension's own hotkeys above and the DBus methods below.
    // Returns null on success - including harmless no-ops like
    // focusing past the strip's edge, which just stops there like Niri
    // does - or a human-readable reason string the DBus layer turns
    // into an error reply (the hotkeys ignore it: a keypress in the
    // wrong mode should simply do nothing).
    const scrollableColumnAction = (action) => {
        if (tilingModeSettingsTarget.mode !== 'scrollable')
            return 'Not in scrollable tiling mode';
        const win = getFocusApp();
        const found = win ? scrollableFindWindow(win) : null;
        if (!found)
            return 'Focused window is not in a scrollable strip';
        const state = found.state;
        const visibleCount = stripVisibleCount(scrollableWidthFraction());
        if (action === 'focus-left' || action === 'focus-right') {
            const target = found.index + (action === 'focus-left' ? -1 : 1);
            if (target >= 0 && target < state.columns.length &&
                !dyingWindows.has(state.columns[target])) {
                const targetWin = state.columns[target];
                state.firstVisible = scrollToShow(state.firstVisible, target, visibleCount, state.columns.length);
                applyScrollableLayout(state, null);
                // activate() both unminimizes and focuses; the focus
                // handler further down then sees an already-correct
                // viewport. global.get_current_time() is 0 outside an
                // input event (the DBus path) - a timestamp-0
                // activation draws a "Buggy client" WM warning and can
                // trip focus-stealing prevention, so fetch a real
                // timestamp when needed.
                let activateTime = global.get_current_time();
                if (!activateTime)
                    activateTime = global.display.get_current_time_roundtrip();
                targetWin.activate(activateTime);
            }
            return null;
        }
        const moved = stripMoveColumn(state.columns, win, action === 'move-left' ? -1 : 1);
        // Same-reference return means a no-op (the column is already
        // at the strip's edge) - stripMoveColumn guarantees that
        // contract precisely so callers can skip the re-layout churn.
        if (moved === state.columns)
            return null;
        state.columns = moved;
        state.firstVisible = scrollToShow(state.firstVisible, state.columns.indexOf(win), visibleCount, state.columns.length);
        applyScrollableLayout(state, null);
        return null;
    };

    // Cycle the tiling-mode setting (Super+L / Super+Shift+L by
    // default, plus the CycleTilingMode DBus method) - the cycle order
    // itself is the pure, tested nextTilingMode in the embedded
    // scrollable-tiling.js block above. Written through
    // settings.setValue so the settings UI's combobox stays in sync,
    // and announced via Cinnamon's volume-style OSD: a mode switch
    // deliberately never re-tiles existing windows (they stay in
    // whatever strip/tree they're in - long-standing design), so
    // without the OSD a press would look like it did nothing.
    const TILING_MODE_OSD_LABELS = {
        'off': 'Off',
        'rules': 'Rule-based',
        'traditional': 'Traditional (3 windows)',
        'traditional-full': 'Traditional (unlimited)',
        'scrollable': 'Scrollable',
    };
    const cycleTilingMode = (direction) => {
        const next = nextTilingMode(tilingModeSettingsTarget.mode, direction);
        try {
            app.config.settings.setValue('tiling-mode', next);
        } catch (e) {
            global.log('gTile: failed to set tiling-mode: ' + e);
            return;
        }
        // The bound target updates via the settings change signal, but
        // not necessarily synchronously - reflect the change now so a
        // rapid second press cycles from the right place.
        tilingModeSettingsTarget.mode = next;
        try {
            const Gio = imports.gi.Gio;
            Main.osdWindowManager.show(-1, Gio.ThemedIcon.new('view-grid-symbolic'),
                'Tiling: ' + (TILING_MODE_OSD_LABELS[next] || next), null);
        } catch (e) {
            // The OSD is feedback, not function - never let it break
            // the actual mode switch.
            global.log('gTile: tiling-mode OSD failed: ' + e);
        }
    };

    // Open this extension's own settings window, landing on the
    // Behavior tab (-t 1) - that's where the live-tweakable tiling
    // settings (mode, column width, animation duration) sit, with the
    // other tabs one click away. xlet-settings is Cinnamon's standard
    // per-xlet configuration tool; UUID is the shared constant from
    // utils.
    const openSettingsWindow = () => {
        try {
            imports.misc.util.spawnCommandLine('xlet-settings extension ' + UUID + ' -t 1');
        } catch (e) {
            global.log('gTile: failed to open settings window: ' + e);
        }
    };

    // --- DBus control export: allow external scripts to tile the focused window ---
    try {
        const Gio = imports.gi.Gio;
        const IFACE_XML = `
            <node>
              <interface name="org.gTile.Control">
                <method name="TileFocusedWindow">
                  <arg type="i" name="cols" direction="in"/>
                  <arg type="i" name="rows" direction="in"/>
                  <arg type="i" name="colIndex" direction="in"/>
                  <arg type="i" name="rowIndex" direction="in"/>
                  <arg type="i" name="colSpan" direction="in"/>
                  <arg type="i" name="rowSpan" direction="in"/>
                </method>
                <method name="FocusColumnLeft"/>
                <method name="FocusColumnRight"/>
                <method name="MoveColumnLeft"/>
                <method name="MoveColumnRight"/>
                <method name="CycleTilingMode">
                  <arg type="i" name="direction" direction="in"/>
                </method>
              </interface>
            </node>`;
        const nodeInfo = Gio.DBusNodeInfo.new_for_xml(IFACE_XML);
        const ifaceInfo = nodeInfo.interfaces[0];

        // Build a proper vtable object with a method_call function (don't use new Gio.DBusInterfaceVTable)
        const vtable = {
            method_call: function (connection, sender, objectPath, interfaceName, methodName, params, invocation) {
                // Scrollable-tiling column navigation (no arguments,
                // act on the focused window's strip) - thin wrappers
                // over scrollableColumnAction above, which the
                // extension's own configurable hotkeys drive too; this
                // DBus surface remains for external scripting, the
                // same pattern TileFocusedWindow serves for grid
                // tiling.
                if (methodName === 'FocusColumnLeft' || methodName === 'FocusColumnRight' ||
                    methodName === 'MoveColumnLeft' || methodName === 'MoveColumnRight') {
                    try {
                        const action = {
                            FocusColumnLeft: 'focus-left',
                            FocusColumnRight: 'focus-right',
                            MoveColumnLeft: 'move-left',
                            MoveColumnRight: 'move-right',
                        }[methodName];
                        const failure = scrollableColumnAction(action);
                        if (failure) {
                            invocation.return_dbus_error("org.gTile.Control.Error", failure);
                            return;
                        }
                        invocation.return_value(GLib.Variant.new('()', []));
                    } catch (e) {
                        invocation.return_dbus_error("org.gTile.Control.Error", String(e));
                    }
                    return;
                }
                // Cycle the tiling mode (direction >= 0 forward,
                // negative backward) - same action the Super+L /
                // Super+Shift+L hotkeys drive, OSD included.
                if (methodName === 'CycleTilingMode') {
                    try {
                        const direction = params.deep_unpack()[0];
                        cycleTilingMode(direction < 0 ? -1 : 1);
                        invocation.return_value(GLib.Variant.new('()', []));
                    } catch (e) {
                        invocation.return_dbus_error("org.gTile.Control.Error", String(e));
                    }
                    return;
                }
                if (methodName !== 'TileFocusedWindow') {
                    invocation.return_dbus_error("org.gTile.Control.Error", "Unknown method");
                    return;
                }
                try {
                    const args = params.deep_unpack(); // [cols, rows, colIndex, rowIndex, colSpan?, rowSpan?]
                    const nbCols = args[0];
                    const nbRows = args[1];
                    const colIndex = args[2];
                    const rowIndex = args[3];

                    // Rejects grids/indexes that would divide by zero
                    // (Infinity/NaN geometry straight into a native
                    // Meta resize call, not catchable from JS) or place
                    // the window arbitrarily far offscreen; clamps
                    // spans to the grid's far edge. See tile-rules.js
                    // for the details and the unit tests.
                    const spans = validateTileArgs(nbCols, nbRows, colIndex, rowIndex, args[4], args[5]);
                    if (!spans) {
                        invocation.return_dbus_error("org.gTile.Control.Error", "Invalid grid arguments");
                        return;
                    }
                    const colSpan = spans.colSpan;
                    const rowSpan = spans.rowSpan;

                    // Pick the focused window at the time of the DBus call to avoid stale references.
                    const win = getFocusApp();
                    if (!win) {
                        invocation.return_dbus_error("org.gTile.Control.Error", "No focused window");
                        return;
                    }
                    // Basic validation: ignore minimized or non-interesting windows to avoid accidental moves.
                    if (win.minimized || !utils_Main.isInteresting(win)) {
                        invocation.return_dbus_error("org.gTile.Control.Error", "Focused window not movable");
                        return;
                    }

                    // Determine the monitor that actually contains the focused window.
                    // Prefer the window's reported monitor; fall back to find-by-position.
                    let monitor = null;
                    try {
                        const lm = imports.ui.main.layoutManager;
                        const monitors = lm.monitors;
                        const winMonitorIndex = typeof win.get_monitor === 'function' ? win.get_monitor() : null;
                        if (Number.isInteger(winMonitorIndex) && monitors[winMonitorIndex])
                            monitor = monitors[winMonitorIndex];
                        if (!monitor) {
                            // fallback: pick monitor that contains the window center
                            const rect = win.get_frame_rect();
                            const centerX = Math.floor(rect.x + rect.width / 2);
                            const centerY = Math.floor(rect.y + rect.height / 2);
                            for (const m of monitors) {
                                if (centerX >= m.x && centerX < (m.x + m.width) &&
                                    centerY >= m.y && centerY < (m.y + m.height)) {
                                    monitor = m;
                                    break;
                                }
                            }
                        }
                        if (!monitor)
                            monitor = lm.primaryMonitor;
                    } catch (e) {
                        monitor = imports.ui.main.layoutManager.primaryMonitor;
                    }

                    const [screenX, screenY, screenWidth, screenHeight] = getUsableScreenArea(monitor);

                    // Same tested grid math the rule-based auto-tile
                    // path uses - not a local reimplementation that
                    // could drift from it.
                    const [areaX, areaY, areaWidth, areaHeight] =
                        computeGridRect(screenX, screenY, screenWidth, screenHeight, nbCols, nbRows, colIndex, rowIndex, colSpan, rowSpan);

                    platform.reset_window(win);
                    platform.move_resize_window(win, areaX, areaY, areaWidth, areaHeight);

                    invocation.return_value(GLib.Variant.new('()', []));
                } catch (e) {
                    invocation.return_dbus_error("org.gTile.Control.Error", String(e));
                }
            }
        };

        // register object on Cinnamon's session bus (Cinnamon process is the owner)
        // some GJS/GIO versions expect a function for method_call_closure instead of a vtable object
        dbusRegistrationId = Gio.DBus.session.register_object('/org/gTile/Control', ifaceInfo, vtable.method_call, null, null);

        // request a well-known session bus name so external callers can target org.gTile.Control
        try {
            dbusOwnerId = Gio.bus_own_name(
                Gio.BusType.SESSION,
                'org.gTile.Control',
                Gio.BusNameOwnerFlags.NONE,
                (connection, name) => { global.log('gTile: session bus connection acquired (' + name + ')'); },
                (connection, name) => { global.log('gTile: acquired well-known name ' + name); },
                (connection, name) => { global.log('gTile: lost well-known name ' + name); }
            );
        } catch (e) {
            global.log('gTile: bus_own_name not available: ' + e);
        }
    } catch (e) {
        global.log('gTile: failed to register DBus control: ' + e);
    }

    // --- Auto-tile on window-created: rule-table driven tiling for
    // OhMyDebn app launchers, replacing the *-tiled wrapper scripts that
    // used to poll for a launched window from outside the WM (PID
    // polling, active-window polling, an opacity-hide dance to mask the
    // gap). window-created fires with the real Meta.Window at map time,
    // before first paint, so there's nothing to hide - by the time this
    // runs the window hasn't been shown yet.
    //
    // The rule table is external, OhMyDebn-owned JSON (TILE_RULES_PATH
    // below) - this extension has no idea what OhMyDebn is and must keep
    // working normally (i.e. do nothing extra) if that file is missing,
    // unreadable, or not valid JSON. Never treat a rule-table problem as
    // an error: catch broadly and fall back to "no rules" rather than
    // breaking window creation for everyone.
    try {
        const TILE_RULES_PATH = '/usr/share/ohmydebn/config/tile-rules.json';

        // Parse cached against the file's mtime, so the per-window-
        // created lookups don't re-read and re-parse unchanged JSON.
        let tileRulesCache = null;
        const loadTileRules = () => {
            try {
                const Gio = imports.gi.Gio;
                const file = Gio.File.new_for_path(TILE_RULES_PATH);
                // Include the microsecond part - with seconds alone,
                // two edits landing inside the same second would keep
                // serving the first edit's stale parse.
                const info = file.query_info('time::modified,time::modified-usec', Gio.FileQueryInfoFlags.NONE, null);
                const mtime = info.get_attribute_uint64('time::modified') * 1000000 +
                    info.get_attribute_uint32('time::modified-usec');
                if (tileRulesCache && tileRulesCache.mtime === mtime)
                    return tileRulesCache.rules;
                const [ok, contents] = file.load_contents(null);
                if (!ok) return [];
                const parsed = JSON.parse(imports.byteArray.toString(contents));
                const rules = Array.isArray(parsed) ? parsed : [];
                tileRulesCache = { mtime: mtime, rules: rules };
                return rules;
            } catch (e) {
                return [];
            }
        };

        // global.display.get_current_monitor() (Mutter's own "which
        // monitor has the pointer" tracking, the same signal its own
        // native new-window placement uses) comes FIRST here, not
        // win.get_monitor() - window-created fires before a brand-new
        // window's monitor assignment is settled, and live debug logging
        // proved win.get_monitor() doesn't report something obviously
        // invalid at this point the way a null/undefined check could
        // catch - it reports an already-valid-looking but WRONG value
        // (silently defaulting to the primary monitor's index), so a
        // "prefer win.get_monitor(), fall back to get_current_monitor()"
        // order never actually reached the fallback: the first check
        // always "succeeded" with the wrong answer, unconditionally
        // sending every auto-tiled window to the primary monitor
        // regardless of which one the cursor was actually on - confirmed
        // live. (TileFocusedWindow above is a different situation - it
        // only ever acts on an already-mapped, already-settled window,
        // where win.get_monitor() genuinely is reliable.) primaryMonitor
        // stays as the final fallback if even get_current_monitor()
        // comes back invalid.
        const resolveMonitor = (win) => {
            const lm = imports.ui.main.layoutManager;
            try {
                const currentMonitorIndex = global.display.get_current_monitor();
                if (Number.isInteger(currentMonitorIndex) && lm.monitors[currentMonitorIndex])
                    return lm.monitors[currentMonitorIndex];
            } catch (e) {
                global.log('gTile: resolveMonitor get_current_monitor failed: ' + e);
            }
            const winMonitorIndex = typeof win.get_monitor === 'function' ? win.get_monitor() : null;
            if (Number.isInteger(winMonitorIndex) && lm.monitors[winMonitorIndex])
                return lm.monitors[winMonitorIndex];
            return lm.primaryMonitor;
        };

        // window-created fires before Mutter/Muffin's own initial-
        // placement logic has run, so moving a *new* window immediately
        // here gets silently overwritten a moment later by that
        // placement (confirmed live: the grid math was correct, the
        // window still ended up unplaced). Deferring the move to the
        // compositor actor's first-frame signal fixes the overwrite, but
        // first-frame itself turned out to already be visible to the
        // user (confirmed live: "starts in one position, then moves") -
        // same flash this whole redesign exists to remove, just
        // relocated to a different signal.
        //
        // Fix: stop trying to win the exact timing race and hide the
        // window instead, the same way the old bash-based
        // ohmydebn-gtile-hide/-apply already did reliably (see
        // OhMyDebn's own bin/ohmydebn-gtile-apply) - except here via the
        // compositor actor's own Clutter opacity property directly,
        // since this code already runs inside the compositor process,
        // rather than round-tripping through an external
        // _NET_WM_WINDOW_OPACITY xprop call. Hidden for the whole
        // hide -> wait for first-frame -> move -> brief settle -> reveal
        // sequence, so the exact instant Mutter's own placement finishes
        // stops mattering - the user never sees any of it happen.
        //
        // Only for a *new* window (called from window-created, before
        // it's ever been shown). An *already-visible* window being
        // repositioned - the traditional-tiling cycle's "move the last
        // window to make room" step - skips this entirely and just
        // calls platform.move_resize_window directly: it's already been
        // painted, so there's no "before first paint" moment left to
        // hide it until, and seeing it move is the expected, real
        // tiling-WM behavior in that case, not the flash bug this hide/
        // reveal dance exists to prevent.
        // resolvePlacement (optional): called at settle time (first
        // frame) instead of trusting the creation-time rect, for modes
        // whose layout can change while this window is still hidden
        // (scrollable: a second window launched an instant later
        // reshuffles the strip before the first ever painted). Returns
        // { rect: [x, y, w, h] } to place there, { minimize: true } if
        // the window's spot has scrolled off-viewport meanwhile, or
        // null to leave the window untouched (e.g. no longer tracked).
        const hideNewWindowThenPlace = (win, areaX, areaY, areaWidth, areaHeight, resolvePlacement) => {
            // Blocks other windows' re-layouts from touching this
            // still-settling window - see settlingWindows' own comment
            // above. Removed on every exit path below (apply, failsafe,
            // stale generation).
            settlingWindows.add(win);
            const applyTileThenReveal = (actor) => {
                // The extension may have been disabled (or torn down and
                // re-enabled) while this window was hidden waiting for
                // its first frame - never leave it invisible, but don't
                // move it with dead state either.
                settlingWindows.delete(win);
                if (thisGeneration !== enableGeneration) {
                    try { actor.opacity = 255; } catch (e) { }
                    return;
                }
                let rect = [areaX, areaY, areaWidth, areaHeight];
                let minimizeInstead = false;
                if (resolvePlacement) {
                    try {
                        const placement = resolvePlacement();
                        if (!placement) {
                            rect = null;
                        } else if (placement.minimize) {
                            rect = null;
                            minimizeInstead = true;
                        } else {
                            rect = placement.rect;
                        }
                    } catch (e) {
                        global.log('gTile: auto-tile placement resolve failed: ' + e);
                    }
                }
                if (rect) {
                    try {
                        platform.reset_window(win);
                        platform.move_resize_window(win, rect[0], rect[1], rect[2], rect[3]);
                    } catch (e) {
                        global.log('gTile: auto-tile apply failed: ' + e);
                    }
                }
                // Same settle delay ohmydebn-gtile-apply already uses
                // after its own gdbus tile call, to outlast Cinnamon's
                // resize/move animation before revealing.
                imports.gi.GLib.timeout_add(imports.gi.GLib.PRIORITY_DEFAULT, 150, () => {
                    try {
                        // Opacity is restored even on the minimize
                        // path - a window minimized while still at
                        // opacity 0 would come back invisible when
                        // later unminimized.
                        actor.opacity = 255;
                        if (minimizeInstead && !win.minimized)
                            win.minimize();
                    } catch (e) {
                        global.log('gTile: auto-tile reveal failed: ' + e);
                    }
                    return imports.gi.GLib.SOURCE_REMOVE;
                });
            };

            const hideThenWaitForFirstFrame = (actor) => {
                actor.opacity = 0;
                let handled = false;
                const firstFrameId = actor.connect('first-frame', () => {
                    if (handled) return;
                    handled = true;
                    actor.disconnect(firstFrameId);
                    applyTileThenReveal(actor);
                });
                // Failsafe: if first-frame never fires (window destroyed
                // mid-map, or a client that never paints), reveal the
                // window untiled rather than leaving it permanently
                // invisible at opacity 0.
                imports.gi.GLib.timeout_add(imports.gi.GLib.PRIORITY_DEFAULT, 2000, () => {
                    if (!handled) {
                        handled = true;
                        settlingWindows.delete(win);
                        try { actor.disconnect(firstFrameId); } catch (e) { }
                        try { actor.opacity = 255; } catch (e) { }
                    }
                    return imports.gi.GLib.SOURCE_REMOVE;
                });
            };

            const actorNow = win.get_compositor_private();
            if (actorNow) {
                hideThenWaitForFirstFrame(actorNow);
            } else {
                // The compositor actor isn't created yet at
                // window-created time (uncommon but not guaranteed
                // otherwise) - poll on idle until it exists, hiding it
                // the instant it does, same as above. Capped: for a
                // window destroyed right after creation the actor never
                // appears, and an unconditional SOURCE_CONTINUE idle
                // callback would spin the main loop at full CPU forever.
                let attempts = 0;
                imports.gi.GLib.idle_add(imports.gi.GLib.PRIORITY_DEFAULT, () => {
                    if (thisGeneration !== enableGeneration) {
                        settlingWindows.delete(win);
                        return imports.gi.GLib.SOURCE_REMOVE;
                    }
                    const actor = win.get_compositor_private();
                    if (actor) {
                        hideThenWaitForFirstFrame(actor);
                        return imports.gi.GLib.SOURCE_REMOVE;
                    }
                    attempts += 1;
                    if (attempts >= 100) {
                        settlingWindows.delete(win);
                        return imports.gi.GLib.SOURCE_REMOVE;
                    }
                    return imports.gi.GLib.SOURCE_CONTINUE;
                });
            }
        };

        // Shared by every dynamic-tiling window-created handler below:
        // which monitor, and which per-"monitorIndex:workspaceIndex"
        // state-map key, a brand-new window belongs to.
        // win.get_workspace() crashed Cinnamon outright on the very
        // first window of a session (confirmed live: "no windows,
        // press Super+Return" -> mutter:ERROR:...
        // meta_window_get_workspaces: code should not be reached,
        // a native g_error() abort, not a catchable JS exception - a
        // brand new window's own workspace assignment isn't settled
        // yet at window-created time, same class of "not everything
        // is initialized yet" issue resolveMonitor above already has
        // a documented fallback for on the monitor side). Asking the
        // workspace manager for the currently active workspace
        // instead sidesteps that call path entirely, and is exactly
        // where a brand new window ends up in normal use anyway.
        const resolveMonitorAndKey = (win) => {
            const monitor = resolveMonitor(win);
            const monitorIndex = typeof monitor.index === 'number' ? monitor.index : 0;
            let workspaceIndex = 0;
            try {
                const activeWorkspace = global.workspace_manager.get_active_workspace();
                if (activeWorkspace && typeof activeWorkspace.index === 'function') {
                    workspaceIndex = activeWorkspace.index();
                }
            } catch (e) {
                global.log('gTile: active-workspace lookup failed: ' + e);
            }
            return { monitor: monitor, monitorIndex: monitorIndex, key: monitorIndex + ':' + workspaceIndex };
        };

        // Shared window-created handler for both dynamic-tiling modes -
        // see treeInsert/treeRemove above for the tree logic itself; this
        // is just the thin Meta-touching layer that applies whatever they
        // decide. maxLeaves: 3 for "Traditional tiling" (capped), null
        // for "Traditional Full" (uncapped) - the only difference between
        // the two modes, since they share the exact same tree.
        const handleTreeTilingWindowCreated = (win, stateMap, maxLeaves) => {
            const { monitor, key } = resolveMonitorAndKey(win);

            const prevState = stateMap.get(key) || { root: null, insertionLeaf: null, leafCount: 0 };
            const result = treeInsert(prevState, win, maxLeaves);
            stateMap.set(key, { root: result.root, insertionLeaf: result.insertionLeaf, leafCount: result.leafCount });

            const [screenX, screenY, screenWidth, screenHeight] = getUsableScreenArea(monitor);
            const rectForRegion = (region) => [
                screenX + region.x * screenWidth,
                screenY + region.y * screenHeight,
                region.width * screenWidth,
                region.height * screenHeight,
            ];
            const applyMove = (move, logPrefix) => {
                // A dying or still-settling window must not be touched
                // at all - see dyingWindows'/settlingWindows' own
                // comments above (native abort, not a catchable
                // exception).
                if (dyingWindows.has(move.window) || settlingWindows.has(move.window))
                    return;
                try {
                    const [x, y, w, h] = rectForRegion(move.region);
                    // Same glide the scrollable mode uses (see
                    // animateActorFromPrevious above) - tree splits and
                    // rebalances are mostly resizes, which it handles
                    // via actor scaling, matching Hyprland's own
                    // animated dwindle behavior this mode is modeled
                    // on.
                    const animDurationMs = tilingAnimationDurationMs();
                    let rectBefore = null;
                    if (animDurationMs > 0) {
                        try {
                            rectBefore = move.window.get_frame_rect();
                        } catch (e) { }
                    }
                    platform.reset_window(move.window);
                    platform.move_resize_window(move.window, x, y, w, h);
                    if (rectBefore)
                        animateActorFromPrevious(move.window, rectBefore, animDurationMs);
                } catch (e) {
                    global.log('gTile: ' + logPrefix + ' failed: ' + e);
                }
            };

            // Windows that were already placed and need to move to make
            // room - already visible, so a direct move each, no
            // hide/reveal dance (see hideNewWindowThenPlace's own comment
            // on why that's fine here).
            for (const move of result.moves) {
                applyMove(move, 'tree-tiling move');
            }

            const [areaX, areaY, areaWidth, areaHeight] = rectForRegion(result.insertionLeaf.region);
            hideNewWindowThenPlace(win, areaX, areaY, areaWidth, areaHeight);

            // 'unmanaging' (fires before destruction, object identity
            // still valid - unlike 'unmanaged', which fires after)
            // triggers a real rebalance: this window's sibling (and
            // everything below it) reclaims the freed space - see
            // treeRemove's own comment. ownLeaf is captured here (not
            // searched for later) for O(1) removal.
            //
            // The actual rebalance (tree update + moving sibling windows)
            // is deferred to the next main-loop iteration via
            // GLib.idle_add, not run synchronously inside this callback -
            // confirmed live as necessary: calling move_resize_window on
            // a *different* (sibling) window from directly inside one
            // window's own 'unmanaging' handler crashed Cinnamon outright
            // (mutter:ERROR:...meta_window_get_workspaces: code should
            // not be reached, a native g_error() abort) after closing
            // several windows in a row. 'unmanaging' fires as part of
            // Mutter's own internal window-removal bookkeeping - a
            // geometry operation on another window while that's still
            // mid-flight is reentrant in a way Mutter doesn't expect.
            // Deferring lets that bookkeeping finish first. idle_add
            // callbacks run strictly in the order they were scheduled (a
            // single-threaded main loop), so this stays correct even if
            // several windows are closed in rapid succession - each
            // deferred removal reads stateMap fresh when it actually
            // runs, already reflecting any earlier deferred removal that
            // ran first.
            const ownLeaf = result.insertionLeaf;
            try {
                win.connect('unmanaging', () => {
                    // Synchronously, before any deferred work anywhere
                    // can run - see dyingWindows' own comment above.
                    dyingWindows.add(win);
                    // Delayed self-cleanup for the dying/settling marks
                    // (NOT done in the window_manager 'destroy' hook -
                    // see its own comment): by 5s every deferred
                    // rebalance that could consult the mark has long
                    // run, and without this the sets would accumulate
                    // dead-window wrappers for the whole session.
                    imports.gi.GLib.timeout_add(imports.gi.GLib.PRIORITY_DEFAULT, 5000, () => {
                        dyingWindows.delete(win);
                        settlingWindows.delete(win);
                        return imports.gi.GLib.SOURCE_REMOVE;
                    });
                    imports.gi.GLib.idle_add(imports.gi.GLib.PRIORITY_DEFAULT, () => {
                        // This closure outlives the enable() scope it was
                        // created in (nothing disconnects per-window
                        // signals on extension disable) - a stale
                        // generation means the extension was disabled or
                        // reloaded since, so leave the windows alone.
                        if (thisGeneration !== enableGeneration) return imports.gi.GLib.SOURCE_REMOVE;
                        const current = stateMap.get(key);
                        if (current && current.root && treeRootOf(ownLeaf) === current.root) {
                            const removal = treeRemove(current, ownLeaf);
                            stateMap.set(key, { root: removal.root, insertionLeaf: removal.insertionLeaf, leafCount: removal.leafCount });
                            for (const move of removal.moves) {
                                applyMove(move, 'tree-tiling rebalance move');
                            }
                            return imports.gi.GLib.SOURCE_REMOVE;
                        }
                        // ownLeaf isn't in the live tree: the capped mode
                        // discarded and restarted the tree since this
                        // window was inserted (see treeInsert's
                        // maxLeaves), or the live tree is already empty
                        // again. This window's old siblings are still on
                        // screen - covered while the newer tree's windows
                        // are up, fully visible once those are closed -
                        // and the old tree's links are intact, so
                        // rebalance them among themselves without
                        // touching the live state (which stays as it is;
                        // a new window after the cap still starts fresh).
                        // Previously this case just returned, which left
                        // e.g. window 2 of 1/2/3 stuck in its half after
                        // closing 3 once 4/5/6 had come and gone.
                        const detached = treeRemoveDetached(ownLeaf);
                        for (const move of detached.moves) {
                            applyMove(move, 'tree-tiling rebalance move (discarded tree)');
                        }
                        return imports.gi.GLib.SOURCE_REMOVE;
                    });
                });
            } catch (e) {
                global.log('gTile: tree-tiling unmanaging hook failed: ' + e);
            }
        };

        // window-created handler for the "scrollable" mode - the thin
        // Meta-touching layer over the pure strip logic (the embedded
        // scrollable-tiling.js block above), structured like
        // handleTreeTilingWindowCreated: same monitor/workspace
        // resolution (and the same reasons for it), same deferred,
        // generation-guarded 'unmanaging' removal.
        const handleScrollableWindowCreated = (win) => {
            const { monitor, monitorIndex, key } = resolveMonitorAndKey(win);

            const prev = scrollableTilingState.get(key) || { columns: [], firstVisible: 0, monitorIndex: monitorIndex };
            // New columns open directly right of the focused window's
            // column (the Niri rule). At window-created time focus is
            // still on the previously-focused window; a focused window
            // that isn't in this strip (or no focus at all) appends at
            // the end instead.
            const focused = getFocusApp();
            const afterIndex = focused ? prev.columns.indexOf(focused) : -1;
            const columns = stripInsert(prev.columns, win, afterIndex);
            const newIndex = columns.indexOf(win);
            const visibleCount = stripVisibleCount(scrollableWidthFraction());
            const state = {
                columns: columns,
                firstVisible: scrollToShow(prev.firstVisible, newIndex, visibleCount, columns.length),
                monitorIndex: monitorIndex,
            };
            scrollableTilingState.set(key, state);

            // Already-placed windows move/minimize directly (visible,
            // real tiling-WM behavior - see hideNewWindowThenPlace's
            // own comment); the new window itself goes through the
            // hide-until-first-frame sequence. Its placement is
            // resolved from the CURRENT strip state at settle time
            // (not from coordinates captured now) - another window
            // launched an instant later can reshuffle the strip before
            // this one ever paints, and the settlingWindows guard
            // means nobody else will move it in the meantime.
            applyScrollableLayout(state, win);
            const resolvePlacement = () => {
                const current = scrollableTilingState.get(key);
                if (!current)
                    return null;
                const idx = current.columns.indexOf(win);
                if (idx === -1)
                    return null;
                const entry = stripLayout(current.columns, current.firstVisible, scrollableWidthFraction())[idx];
                if (!entry.visible)
                    return { minimize: true };
                const lm = imports.ui.main.layoutManager;
                const mon = (Number.isInteger(current.monitorIndex) && lm.monitors[current.monitorIndex])
                    ? lm.monitors[current.monitorIndex] : lm.primaryMonitor;
                const [sx, sy, sw, sh] = getUsableScreenArea(mon);
                return { rect: [sx + entry.region.x * sw, sy, entry.region.width * sw, sh] };
            };
            const [screenX, screenY, screenWidth, screenHeight] = getUsableScreenArea(monitor);
            hideNewWindowThenPlace(win, screenX, screenY, screenWidth, screenHeight, resolvePlacement);

            // Deferred, generation-guarded removal - identical
            // reasoning to the tree modes' 'unmanaging' hook above
            // (geometry operations on other windows are not safe from
            // directly inside 'unmanaging').
            try {
                win.connect('unmanaging', () => {
                    // Synchronously, before any deferred work anywhere
                    // can run - see dyingWindows' own comment above.
                    dyingWindows.add(win);
                    // Delayed self-cleanup for the dying/settling marks
                    // (NOT done in the window_manager 'destroy' hook -
                    // see its own comment): by 5s every deferred
                    // rebalance that could consult the mark has long
                    // run, and without this the sets would accumulate
                    // dead-window wrappers for the whole session.
                    imports.gi.GLib.timeout_add(imports.gi.GLib.PRIORITY_DEFAULT, 5000, () => {
                        dyingWindows.delete(win);
                        settlingWindows.delete(win);
                        return imports.gi.GLib.SOURCE_REMOVE;
                    });
                    imports.gi.GLib.idle_add(imports.gi.GLib.PRIORITY_DEFAULT, () => {
                        if (thisGeneration !== enableGeneration) return imports.gi.GLib.SOURCE_REMOVE;
                        const current = scrollableTilingState.get(key);
                        if (!current) return imports.gi.GLib.SOURCE_REMOVE;
                        const columns = stripRemove(current.columns, win);
                        if (columns === current.columns) return imports.gi.GLib.SOURCE_REMOVE;
                        if (columns.length === 0) {
                            scrollableTilingState.delete(key);
                            return imports.gi.GLib.SOURCE_REMOVE;
                        }
                        current.columns = columns;
                        current.firstVisible = scrollToShow(current.firstVisible, null,
                            stripVisibleCount(scrollableWidthFraction()), columns.length);
                        // Survivors reclaim the freed viewport space -
                        // including the lone-column expand back to full
                        // width when this was the second-to-last window.
                        applyScrollableLayout(current, null);
                        return imports.gi.GLib.SOURCE_REMOVE;
                    });
                });
            } catch (e) {
                global.log('gTile: scrollable unmanaging hook failed: ' + e);
            }
        };

        windowCreatedSignal = global.display.connect('window-created', (display, win) => {
            try {
                if (!win || win.minimized || !utils_Main.isInteresting(win)) return;

                // "off": nothing automatic. "traditional"/"traditional-full":
                // one of the two dynamic tree cycles. "scrollable": the
                // Niri-style column strip. "rules": rule-table matching
                // below. Anything else - including unset/unrecognized,
                // e.g. before the settings binding's first read
                // completes - does nothing, same as "off": that's the
                // schema's own default, so treating an unknown value
                // the same way is the safe choice, not an arbitrary one.
                if (tilingModeSettingsTarget.mode === 'traditional') {
                    handleTreeTilingWindowCreated(win, traditionalTilingState, 3);
                    return;
                }
                if (tilingModeSettingsTarget.mode === 'traditional-full') {
                    handleTreeTilingWindowCreated(win, traditionalFullState, null);
                    return;
                }
                if (tilingModeSettingsTarget.mode === 'scrollable') {
                    handleScrollableWindowCreated(win);
                    return;
                }
                if (tilingModeSettingsTarget.mode !== 'rules') return;

                const grid = matchTileRule(win.get_wm_class(), win.get_title(), loadTileRules());
                if (!grid || grid.length < 4) return;
                const [cols, rows, colIndex, rowIndex, colSpanRaw, rowSpanRaw] = grid;
                const colSpan = (Number.isInteger(colSpanRaw) && colSpanRaw > 0) ? colSpanRaw : 1;
                const rowSpan = (Number.isInteger(rowSpanRaw) && rowSpanRaw > 0) ? rowSpanRaw : 1;

                const monitor = resolveMonitor(win);
                const [screenX, screenY, screenWidth, screenHeight] = getUsableScreenArea(monitor);
                const [areaX, areaY, areaWidth, areaHeight] =
                    computeGridRect(screenX, screenY, screenWidth, screenHeight, cols, rows, colIndex, rowIndex, colSpan, rowSpan);

                hideNewWindowThenPlace(win, areaX, areaY, areaWidth, areaHeight);
            } catch (e) {
                global.log('gTile: auto-tile window-created handler failed: ' + e);
            }
        });
    } catch (e) {
        global.log('gTile: failed to connect window-created for auto-tile: ' + e);
    }

    // --- Scrollable tiling: focus-driven scrolling. Focusing a window
    // whose column is scrolled out of the viewport (via the window
    // list, Alt-Tab, or the FocusColumn* DBus methods above - and the
    // window list/Alt-Tab is also how a minimized, scrolled-away
    // column comes back without any hotkeys configured) scrolls the
    // strip so that column is visible again. The re-layout is deferred
    // to idle rather than run inside the focus notification itself -
    // same reentrancy caution as the 'unmanaging' handlers above - and
    // the strip state is re-read fresh inside the idle callback for
    // the same reason theirs is.
    try {
        focusWindowSignal = global.display.connect('notify::focus-window', () => {
            try {
                if (tilingModeSettingsTarget.mode !== 'scrollable') return;
                const win = global.display.focus_window;
                if (!win || !scrollableFindWindow(win)) return;
                imports.gi.GLib.idle_add(imports.gi.GLib.PRIORITY_DEFAULT, () => {
                    if (thisGeneration !== enableGeneration) return imports.gi.GLib.SOURCE_REMOVE;
                    const found = scrollableFindWindow(win);
                    if (!found) return imports.gi.GLib.SOURCE_REMOVE;
                    const state = found.state;
                    const fv = scrollToShow(state.firstVisible, found.index,
                        stripVisibleCount(scrollableWidthFraction()), state.columns.length);
                    // Focus changes constantly - only re-layout when
                    // the viewport actually has to move.
                    if (fv === state.firstVisible) return imports.gi.GLib.SOURCE_REMOVE;
                    state.firstVisible = fv;
                    applyScrollableLayout(state, null);
                    return imports.gi.GLib.SOURCE_REMOVE;
                });
            } catch (e) {
                global.log('gTile: scrollable focus handler failed: ' + e);
            }
        });
    } catch (e) {
        global.log('gTile: failed to connect focus handler for scrollable tiling: ' + e);
    }

    // --- Maximize-with-gaps: intercept every native maximize trigger
    // (titlebar button / OhMyDebn's own Super+PageUp rebind of Cinnamon's
    // toggle-maximized wm action / double-click-titlebar) and substitute
    // a gapped rect for the true edge-to-edge maximize.
    //
    // Muffin's own constraint solver (constrain_maximization in
    // constraints.c) unconditionally re-snaps ANY move_resize_frame/
    // move_frame call back to the full monitor work area for as long as
    // a window's maximized_horizontally/vertically flags stay true -
    // confirmed by reading Muffin's window.c/constraints.c source, and
    // independently corroborated against a real published GNOME Shell
    // extension that does this exact feature. There is no way to keep
    // Meta's own "maximized" flag AND show custom (gapped) geometry at
    // the same time - the only way out is to call unmaximize() ourselves
    // once Mutter's own maximize transition has settled, then resize to
    // the gapped rect, which means Meta itself no longer considers the
    // window maximized afterward (get_maximized() reports NONE) - the
    // native maximize/restore button can't be relied on for the toggle
    // anymore. To still give the user a working maximize<->restore
    // toggle, this tracks its own per-window state (pendingPreMaximizeRect/
    // gapMaximizedState above) and reroutes a SECOND maximize trigger on
    // an already gap-maximized window into a true restore to its
    // original pre-maximize rect, instead of re-applying gaps.
    try {
        const isMaximizeTransition = (win, whichChange) => {
            if (whichChange === Meta.SizeChange.MAXIMIZE) return true;
            // Defensive only, confirmed NOT reachable via ordinary
            // edge-drag-to-top on this Cinnamon/Muffin (live-tested:
            // dragging to the top edge produces a plain top-half tile,
            // not a maximize) - Meta.TileMode has a genuinely separate
            // TOP=7 distinct from MAXIMIZED=9 (confirmed via the actual
            // installed Meta typelib), and Cinnamon reserves MAXIMIZED
            // for explicit actions (button/keybinding/double-click), not
            // implicit edge-drag zones the way GNOME Shell/Windows Aero
            // Snap do. Kept anyway in case some other path (a different
            // Cinnamon version, a future gesture) ever does reach
            // meta_window_tile(window, META_TILE_MAXIMIZED) - harmless
            // if it never fires.
            if (whichChange === Meta.SizeChange.TILE &&
                typeof win.tile_mode !== 'undefined' &&
                win.tile_mode === Meta.TileMode.MAXIMIZED) return true;
            return false;
        };

        sizeChangeSignal = global.window_manager.connect('size-change', (wm, actor, whichChange, oldFrameRect, oldBufferRect) => {
            try {
                const win = actor && actor.meta_window;
                if (!win) return;
                if (typeof win.get_window_type === 'function' && win.get_window_type() !== Meta.WindowType.NORMAL) return;
                if (!isMaximizeTransition(win, whichChange)) return;
                if (typeof win.can_maximize === 'function' && !win.can_maximize()) return;

                const rect = {
                    x: oldFrameRect.x, y: oldFrameRect.y,
                    width: oldFrameRect.width, height: oldFrameRect.height,
                };
                // Unconditional - see nativeRestoreTarget's own comment
                // above. Independent of the maximize-with-gaps checkbox.
                nativeRestoreTarget.set(win.get_id(), rect);
                if (maximizeWithGapsSettingsTarget.enabled) {
                    pendingPreMaximizeRect.set(win.get_id(), rect);
                }
            } catch (e) {
                global.log('gTile: maximize-with-gaps size-change handler failed: ' + e);
            }
        });

        sizeChangedSignal = global.window_manager.connect('size-changed', (wm, actor) => {
            try {
                const win = actor && actor.meta_window;
                if (!win) return;
                const id = win.get_id();

                if (!maximizeWithGapsSettingsTarget.enabled) {
                    // Native-maximize restore correction - see
                    // nativeRestoreTarget's own comment above. Only a
                    // completed unmaximize (get_maximized() back to 0)
                    // is relevant; nativeRestoreTarget.has(id) already
                    // scopes this to a window that was actually
                    // maximized moments ago, not just any size-changed.
                    if (win.get_maximized() === 0 && nativeRestoreTarget.has(id)) {
                        const target = nativeRestoreTarget.get(id);
                        nativeRestoreTarget.delete(id);
                        // Skip while a grab is in progress: unmaximizing
                        // by dragging the titlebar must leave the window
                        // following the pointer - snapping it back to
                        // its pre-maximize position would yank it out
                        // from under the drag.
                        let grabbed = false;
                        try {
                            grabbed = typeof global.display.get_grab_op === 'function' &&
                                global.display.get_grab_op() !== Meta.GrabOp.NONE;
                        } catch (e) { }
                        if (grabbed) return;
                        const r = win.get_frame_rect();
                        if (r.x !== target.x || r.y !== target.y || r.width !== target.width || r.height !== target.height) {
                            platform.move_resize_window_exact(win, target.x, target.y, target.width, target.height);
                        }
                    }
                    return;
                }
                if (!pendingPreMaximizeRect.has(id)) return;
                const preRect = pendingPreMaximizeRect.get(id);
                pendingPreMaximizeRect.delete(id);

                // Only a genuine full (both-direction) maximize - a
                // partial/vertical-only maximize is left untouched.
                if (win.get_maximized() !== (Meta.MaximizeFlags.HORIZONTAL | Meta.MaximizeFlags.VERTICAL)) return;

                const prevGapState = gapMaximizedState.get(id);
                if (prevGapState) {
                    gapMaximizedState.delete(id);
                    // Second trigger on an already gap-maximized window:
                    // Meta thinks this is a fresh maximize (its own flag
                    // was cleared by our own unmaximize() below last
                    // time). Only reroute into a restore if the window
                    // is still exactly where the gap-maximize left it -
                    // if the user moved or resized it since, this press
                    // means "maximize again", so fall through and
                    // re-apply gaps with the new preRect instead.
                    const g = prevGapState.gapped;
                    const untouched = !g ||
                        (Math.abs(preRect.x - g.x) <= 2 &&
                            Math.abs(preRect.y - g.y) <= 2 &&
                            Math.abs(preRect.width - g.width) <= 2 &&
                            Math.abs(preRect.height - g.height) <= 2);
                    if (untouched) {
                        const restoreRect = prevGapState.restore;
                        platform.reset_window(win);
                        // _exact_, not move_resize_window - restoreRect is
                        // already the window's original size; move_resize_window
                        // would shrink it further by the gap on top of that.
                        platform.move_resize_window_exact(win, restoreRect.x, restoreRect.y, restoreRect.width, restoreRect.height);
                        return;
                    }
                }

                // resolveMonitor above is scoped inside the auto-tile
                // feature's own try block and isn't reachable here -
                // same inline monitor-resolution snippet already
                // duplicated elsewhere in this file for the same reason.
                const lm = imports.ui.main.layoutManager;
                const winMonitorIndex = typeof win.get_monitor === 'function' ? win.get_monitor() : null;
                const monitor = (Number.isInteger(winMonitorIndex) && lm.monitors[winMonitorIndex])
                    ? lm.monitors[winMonitorIndex] : lm.primaryMonitor;
                const [screenX, screenY, screenWidth, screenHeight] = getUsableScreenArea(monitor);

                platform.reset_window(win);
                platform.move_resize_window(win, screenX, screenY, screenWidth, screenHeight);

                const gapState = { restore: preRect, gapped: null };
                gapMaximizedState.set(id, gapState);
                // Capture the rect the gap-maximize actually produced
                // once it has settled, for the untouched-check above.
                imports.gi.GLib.idle_add(imports.gi.GLib.PRIORITY_DEFAULT, () => {
                    if (thisGeneration === enableGeneration) {
                        try {
                            const r = win.get_frame_rect();
                            gapState.gapped = { x: r.x, y: r.y, width: r.width, height: r.height };
                        } catch (e) { }
                    }
                    return imports.gi.GLib.SOURCE_REMOVE;
                });
            } catch (e) {
                global.log('gTile: maximize-with-gaps size-changed handler failed: ' + e);
            }
        });

        // Prune per-window state when a window goes away - the maps are
        // keyed by window id, and without this every window ever
        // maximized leaves its entry behind for the whole session.
        windowDestroyedSignal = global.window_manager.connect('destroy', (wm, actor) => {
            try {
                const win = actor && actor.meta_window;
                if (!win) return;
                const id = win.get_id();
                pendingPreMaximizeRect.delete(id);
                gapMaximizedState.delete(id);
                nativeRestoreTarget.delete(id);
                // dyingWindows/settlingWindows are deliberately NOT
                // pruned here: window_manager's 'destroy' fires the
                // instant the destroy animation starts - BETWEEN a
                // window's 'unmanaging' emission and the deferred
                // (idle) rebalance that needs to see the dying mark.
                // Pruning here un-marked the window at exactly the
                // wrong moment (live-confirmed via debug logging: the
                // guard saw an empty set milliseconds after the mark
                // was added, re-layouted the dead sibling, and crashed
                // Cinnamon). Those two sets clean themselves up on a
                // delayed timer in the unmanaging hooks instead.
            } catch (e) {
                global.log('gTile: window-destroy prune failed: ' + e);
            }
        });
    } catch (e) {
        global.log('gTile: failed to connect maximize-with-gaps signals: ' + e);
    }
};
const disable = () => {
    // Invalidate every long-lived callback created by enable() (see
    // enableGeneration's own comment above).
    enableGeneration += 1;
    // Detach reset_window from enable()'s per-window state maps - they
    // die with this enable() scope.
    set_prune_window_state_hook(null);
    // Remove the tiling hotkeys enable() registered.
    for (const hotkey of GTILE_HOTKEYS) {
        try {
            Main.keybindingManager.removeHotKey(hotkey.name);
        } catch (e) { }
    }
    if (monitorChangedSignal) {
        try {
            Main.layoutManager.disconnect(monitorChangedSignal);
        } catch (e) {
            global.log('gTile: failed to disconnect monitors-changed: ' + e);
        }
        monitorChangedSignal = null;
    }
    if (windowCreatedSignal) {
        try {
            global.display.disconnect(windowCreatedSignal);
        } catch (e) {
            global.log('gTile: failed to disconnect window-created: ' + e);
        }
        windowCreatedSignal = null;
    }
    if (sizeChangeSignal) {
        try {
            global.window_manager.disconnect(sizeChangeSignal);
        } catch (e) {
            global.log('gTile: failed to disconnect size-change: ' + e);
        }
        sizeChangeSignal = null;
    }
    if (sizeChangedSignal) {
        try {
            global.window_manager.disconnect(sizeChangedSignal);
        } catch (e) {
            global.log('gTile: failed to disconnect size-changed: ' + e);
        }
        sizeChangedSignal = null;
    }
    if (windowDestroyedSignal) {
        try {
            global.window_manager.disconnect(windowDestroyedSignal);
        } catch (e) {
            global.log('gTile: failed to disconnect window destroy: ' + e);
        }
        windowDestroyedSignal = null;
    }
    if (focusWindowSignal) {
        try {
            global.display.disconnect(focusWindowSignal);
        } catch (e) {
            global.log('gTile: failed to disconnect focus-window: ' + e);
        }
        focusWindowSignal = null;
    }
    // unregister DBus object if registered
    try {
        if (dbusRegistrationId) {
            const Gio = imports.gi.Gio;
            Gio.DBus.session.unregister_object(dbusRegistrationId);
            dbusRegistrationId = null;
        }
        if (dbusOwnerId) {
            const Gio = imports.gi.Gio;
            try {
                Gio.bus_unown_name(dbusOwnerId);
            } catch (e) {
                global.log('gTile: bus_unown_name failed: ' + e);
            }
            dbusOwnerId = null;
        }
    } catch (e) {
        global.log('gTile: failed to unregister DBus control: ' + e);
    }
    app.destroy();
};

gtile = __webpack_exports__;
/******/ })()
;
