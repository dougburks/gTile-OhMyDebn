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
        this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, 'select-using-keyboard', 'selectUsingKeyboard', this.updateSettings, null);
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
        // bind gap-size setting to this.gapSize and update platform gap when it changes
        this.settings.bindProperty(Settings.BindingDirection.BIDIRECTIONAL, 'gap-size', 'gapSize', () => {
            // ensure a sensible integer fallback
            if (this.gapSize == null)
                this.gapSize = 10;
            // inform platform (App passed as this.app) about new gap
            if (this.app && this.app.platform && typeof this.app.platform.set_gap_size === 'function') {
                this.app.platform.set_gap_size(Number(this.gapSize) || 10);
            }
        }, null);

        // Ensure the platform has the initial gap value from settings at startup.
        // The bindProperty callback may not be called immediately, so apply it now.
        if (this.app && this.app.platform && typeof this.app.platform.set_gap_size === 'function') {
            this.app.platform.set_gap_size(Number(this.gapSize) || 10);
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
// END traditional-tiling.js

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
const getMonitorKey = (monitor) => {
    return monitor.x + ':' + monitor.width + ':' + monitor.y + ':' + monitor.height;
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
const isPrimaryMonitor = (monitor) => {
    return utils_Main.layoutManager.primaryMonitor === monitor;
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
    [SETTINGS_ANIMATION]: _("Animations"),
    'action-main-list': _("Auto tile main and list"),
    'action-two-list': _("Auto tile two lists")
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

;// CONCATENATED MODULE: ../base/ui/AutoTileMainAndList.ts
var AutoTileMainAndList_decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let AutoTileMainAndList = class AutoTileMainAndList extends ActionButton {
    constructor(app) {
        super('action-main-list', "auto_tile_0-symbolic");
        this._onButtonPress = () => {
            if (!this.app.FocusMetaWindow)
                return false;
            this.app.platform.reset_window(this.app.FocusMetaWindow);
            let monitor = this.app.CurrentMonitor;
            let [screenX, screenY, screenWidth, screenHeight] = getUsableScreenArea(monitor);
            let windows = this.app.GetNotFocusedWindowsOfMonitor(monitor);
            this.app.platform.move_resize_window(this.app.FocusMetaWindow, screenX, screenY, screenWidth / 2, screenHeight);
            let winHeight = screenHeight / windows.length;
            let countWin = 0;
            for (let windowIdx in windows) {
                let metaWindow = windows[windowIdx];
                let newOffset = countWin * winHeight;
                this.app.platform.reset_window(metaWindow);
                this.app.platform.move_resize_window(metaWindow, screenX + screenWidth / 2, screenY + newOffset, screenWidth / 2, winHeight);
                countWin++;
            }
            this.emit('resize-done');
            return false;
        };
        this.app = app;
        this.classname = 'action-main-list';
        this.connect('button-press-event', this._onButtonPress);
    }
};
AutoTileMainAndList = AutoTileMainAndList_decorate([
    addSignals
], AutoTileMainAndList);

;

;// CONCATENATED MODULE: ../base/ui/AutoTileTwoList.ts
var AutoTileTwoList_decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};


let AutoTileTwoList = class AutoTileTwoList extends ActionButton {
    constructor(app) {
        super('action-two-list', "auto_tile_1-symbolic");
        this._onButtonPress = () => {
            if (!this.app.FocusMetaWindow)
                return false;
            this.app.platform.reset_window(this.app.FocusMetaWindow);
            let monitor = this.app.CurrentMonitor;
            let [screenX, screenY, screenWidth, screenHeight] = getUsableScreenArea(monitor);
            let windows = this.app.GetNotFocusedWindowsOfMonitor(monitor);
            let nbWindowOnEachSide = Math.ceil((windows.length + 1) / 2);
            let winHeight = screenHeight / nbWindowOnEachSide;
            let countWin = 0;
            let xOffset = ((countWin % 2) * screenWidth) / 2;
            let yOffset = Math.floor(countWin / 2) * winHeight;
            this.app.platform.move_resize_window(this.app.FocusMetaWindow, screenX + xOffset, screenY + yOffset, screenWidth / 2, winHeight);
            countWin++;
            for (let windowIdx in windows) {
                let metaWindow = windows[windowIdx];
                xOffset = ((countWin % 2) * screenWidth) / 2;
                yOffset = Math.floor(countWin / 2) * winHeight;
                this.app.platform.reset_window(metaWindow);
                this.app.platform.move_resize_window(metaWindow, screenX + xOffset, screenY + yOffset, screenWidth / 2, winHeight);
                countWin++;
            }
            this.emit('resize-done');
            return false;
        };
        this.app = app;
        this.classname = 'action-two-list';
        this.connect('button-press-event', this._onButtonPress);
    }
};
AutoTileTwoList = AutoTileTwoList_decorate([
    addSignals
], AutoTileTwoList);

;

;// CONCATENATED MODULE: ../base/ui/GridElement.ts

const GridElement_Main = imports.ui.main;
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
        this._clean = () => {
            GridElement_Main.uiGroup.remove_actor(this.app.area);
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

        // Add label
        if (this.app.config.selectUsingKeyboard) {
            const labelIndex = coordy * numCols + coordx;
            let labelText;
            if (labelIndex < 26) {
                labelText = String.fromCharCode('a'.charCodeAt(0) + labelIndex);
            } else {
                labelText = String.fromCharCode('A'.charCodeAt(0) + labelIndex - 26);
            }
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
        this.last = null;
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
            this.last = null;
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
            this.last = null;
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
                this.actor.opacity = 255;
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
            if (this.cols.length <= this.colKey || this.rows.length <= this.colKey)
                this.Reset();
            this.RebuildGridElements();
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
            if ((this.elementsDelegate && (x <= this.actor.x || x >= this.actor.x + this.actor.width)) || (y <= this.actor.y || y >= this.actor.y + this.tableHeight + this.topbar.actor.height)) {
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
            this.keyElement = this.elements[this.rowKey] ? this.elements[this.rowKey][this.colKey] : null;
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
      /*
        let action = new AutoTileMainAndList(this.app);
        this.veryBottomBar.add(action.actor, { row: 0, col: 2, x_fill: false, y_fill: false });
        action.connect('resize-done', this.OnResize);
        let actionTwo = new AutoTileTwoList(this.app);
        this.veryBottomBar.add(actionTwo.actor, { row: 0, col: 3, x_fill: false, y_fill: false });
        actionTwo.connect('resize-done', this.OnResize);
        */
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
        this.GetNotFocusedWindowsOfMonitor = (monitor) => {
            return app_Main.getTabList().filter((w) => {
                let app = this.tracker.get_window_app(w);
                let w_monitor = app_Main.layoutManager.monitors[w.get_monitor()];
                if (app == null) {
                    return false;
                }
                if (w.minimized) {
                    return false;
                }
                if (w_monitor !== monitor) {
                    return false;
                }
                return this.focusMetaWindow !== w && w.get_wm_class() != null;
            });
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
            if (!this.config.showGridOnAllMonitors)
                this.CurrentGrid.ChangeCurrentMonitor(newMonitor);
            this.currentMonitor = newMonitor;
            this.MoveUIActor();
        };
        this.ShowUI = () => {
            var _a;
            this.focusMetaWindow = getFocusApp();
            let wm_type = this.focusMetaWindow.get_window_type();
            let layer = this.focusMetaWindow.get_layer();
            this.area.visible = true;
            const window = this.focusMetaWindow;
            if (window != null && wm_type !== 1 && layer > 0) {
                for (const grid of this.grids) {
                    if (!this.config.showGridOnAllMonitors)
                        grid.ChangeCurrentMonitor((_a = this.monitors.find(x => x.index == window.get_monitor())) !== null && _a !== void 0 ? _a : app_Main.layoutManager.primaryMonitor);
                    const [pos_x, pos_y] = (!this.config.useMonitorCenter && grid.monitor.index == this.currentMonitor.index) ? this.platform.get_window_center(window) : GetMonitorCenter(grid.monitor);
                    grid.Show(Math.floor(pos_x - grid.actor.width / 2), Math.floor(pos_y - grid.actor.height / 2));
                    this.OnFocusedWindowChanged();
                    this.visible = true;
                }
            }
            this.MoveUIActor();
            this.BindKeyControls();
        };
        this.HideUI = () => {
            this.RemoveKeyControls();
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
            // Add keybindings for a-z and A-Z
            for (let i = 0; i < 26; i++) {
                const lowerCaseLetter = String.fromCharCode('a'.charCodeAt(0) + i);
                app_Main.keybindingManager.addHotKey(`gTile-letter-${lowerCaseLetter}`, lowerCaseLetter, () => this.handleLetterInput(lowerCaseLetter));
                const upperCaseLetter = String.fromCharCode('A'.charCodeAt(0) + i);
                app_Main.keybindingManager.addHotKey(`gTile-letter-${upperCaseLetter}`, '<Shift>' + lowerCaseLetter, () => this.handleLetterInput(upperCaseLetter));
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
                }
            }
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
                    pos_x = pos_x < monitor.x ? monitor.x : pos_x;
                    pos_x = pos_x + gridWidth > monitor.width + monitor.x ? monitor.x + monitor.width - gridWidth : pos_x;
                    pos_y = pos_y < monitor.y ? monitor.y : pos_y;
                    pos_y = pos_y + gridHeight > monitor.height + monitor.y ? monitor.y + monitor.height - gridHeight : pos_y;
                }
                else {
                    [pos_x, pos_y] = GetMonitorCenter(monitor);
                }
                pos_x = Math.floor(pos_x - gridWidth / 2);
                pos_y = Math.floor(pos_y - gridHeight / 2);
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
            if (!this.config.showGridOnAllMonitors)
                this.CurrentGrid.ChangeCurrentMonitor(this.monitors[this.focusMetaWindow.get_monitor()]);
            this.currentMonitor = this.monitors[this.focusMetaWindow.get_monitor()];
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
            const charCode = letter.charCodeAt(0);
            let labelIndex;

            if (charCode >= 'a'.charCodeAt(0) && charCode <= 'z'.charCodeAt(0)) {
                labelIndex = charCode - 'a'.charCodeAt(0);
            } else if (charCode >= 'A'.charCodeAt(0) && charCode <= 'Z'.charCodeAt(0)) {
                labelIndex = charCode - 'A'.charCodeAt(0) + 26;
            } else {
                return null;
            }

            const r = Math.floor(labelIndex / numCols);
            const c = labelIndex % numCols;

            if (grid.elements[r] && grid.elements[r][c]) {
                return grid.elements[r][c];
            }

            return null;
        };

        this.firstLetterSelection = null; // Added
        this.platform = platform;
        app_Main.uiGroup.add_actor(this.area);
        this.config = new Config(this);
        this.InitGrid();
        this.tracker.connect("notify::focus-app", this.OnFocusedWindowChanged);
        global.screen.connect('monitors-changed', this.ReInitialize);
    }
    get CurrentMonitor() {
        return this.currentMonitor;
    }
    get FocusMetaWindow() {
        return this.focusMetaWindow;
    }
    get CurrentGrid() {
        const grid = this.grids.find(x => x.monitor.index == this.currentMonitor.index);
        return grid;
    }
    get Grids() {
        return this.grids;
    }
    destroy() {
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
const reset_window = (metaWindow) => {
    metaWindow === null || metaWindow === void 0 ? void 0 : metaWindow.unmaximize(utils_Meta.MaximizeFlags.HORIZONTAL);
    metaWindow === null || metaWindow === void 0 ? void 0 : metaWindow.unmaximize(utils_Meta.MaximizeFlags.VERTICAL);
    metaWindow === null || metaWindow === void 0 ? void 0 : metaWindow.unmaximize(utils_Meta.MaximizeFlags.HORIZONTAL | utils_Meta.MaximizeFlags.VERTICAL);
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

// mutable GAP value and setter (default 10)
let GAP_SIZE = 10;
const set_gap_size = (size) => {
    const n = Number(size);
    GAP_SIZE = isNaN(n) ? 10 : Math.max(0, Math.floor(n));
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
    const usableRight = usableLeft + usableWidth;
    const usableBottom = usableTop + usableHeight;

    // For sides that touch the usable area edge, keep the full GAP.
    // For internal sides (between two windows), use HALF_GAP on each window so the total gap is GAP_SIZE.
    const HALF_GAP = Math.floor(GAP_SIZE / 2);
    let leftPadding = HALF_GAP;
    let rightPadding = HALF_GAP;
    let topPadding = HALF_GAP;
    let bottomPadding = HALF_GAP;

    if (x <= usableLeft)
        leftPadding = GAP_SIZE;
    if ((x + width) >= usableRight)
        rightPadding = GAP_SIZE;
    if (y <= usableTop)
        topPadding = GAP_SIZE;
    if ((y + height) >= usableBottom)
        bottomPadding = GAP_SIZE;

    x += leftPadding;
    y += topPadding;
    width -= (leftPadding + rightPadding);
    height -= (topPadding + bottomPadding);

    // Ensure we don't produce negative sizes
    if (width < 0) width = 0;
    if (height < 0) height = 0;

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
    // No trailing move_frame call here either - see move_resize_window's
    // own comment on why that was removed.
    metaWindow.move_resize_frame(true, x, y, width, height);
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
let dbusRegistrationId = null; // <-- added
let dbusOwnerId = null; // <-- new
let windowCreatedSignal = null; // <-- new: auto-tile on window-created
let sizeChangeSignal = null; // <-- new: maximize-with-gaps (pre)
let sizeChangedSignal = null; // <-- new: maximize-with-gaps (post)
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
    app = new App(platform);
        monitorChangedSignal = Main.layoutManager.connect('monitors-changed', () => {
            app.destroy();
            app = new App(platform);
            // Per-monitor:workspace keys below would otherwise reference
            // monitor indices that no longer mean anything once the set
            // of monitors changes.
            traditionalTilingState.clear();
            traditionalFullState.clear();
            pendingPreMaximizeRect.clear();
            gapMaximizedState.clear();
            nativeRestoreTarget.clear();
        });

    // --- Auto-tile mode: a settings-panel combobox (see
    // settings-schema.json's "tiling-mode" entry) with four values -
    // "off" (nothing automatic, only the manual "Tile with gaps N"
    // hotkeys), "rules" (tile-rules.json matching, the default),
    // "traditional" (bypasses tile-rules.json entirely and sweeps every
    // new window into a binary-tree dynamic-tiling cycle instead, capped
    // at 3 windows), or "traditional-full" (the same tree, uncapped -
    // see treeInsert/treeRemove above and their own comments for the
    // tree itself). Bound onto its own small object rather than the App
    // class, since this whole feature lives in the standalone
    // window-created handler below, not inside App.
    //
    // maximize-with-gaps (see settings-schema.json's "maximize-with-gaps"
    // entry) is an opt-in checkbox, independent of tiling-mode above -
    // applies no matter which tiling mode is selected. Bound onto its own
    // separate target object too, for the same reason.
    //
    // Both bound onto ONE shared ExtensionSettings instance via
    // bindWithObject (not two separate `new Settings.ExtensionSettings(
    // ..., 'gTile@OhMyDebn')` calls, one per target object) - live-
    // confirmed on Cinnamon 6.6.9 that two ExtensionSettings instances
    // for the SAME extension UUID silently collide:
    // Main.settingsManager.register(uuid, instanceId, obj) stores
    // exactly one object per (uuid, instanceId), so the second
    // construction overwrites the first in that registry, and only the
    // surviving (last-registered) instance ever receives live setting-
    // changed updates afterward - the other is frozen at whatever value
    // it had at construction time until the extension is fully reloaded.
    // Confirmed live: on that Cinnamon version, changing "Automatic
    // tiling" (bound via the first, orphaned instance) silently had no
    // effect until a restart, while "Maximize with gaps" (bound via the
    // second, surviving instance) worked immediately - swapping
    // construction order moved which setting was affected, confirming
    // the collision rather than a per-key issue. Not reproducible on
    // every Cinnamon build (older ones have an additional per-instance
    // file-watcher fallback that masks this exact collision), which is
    // why this went unnoticed until tested on a Cinnamon version without
    // it - but a single shared instance is correct regardless of which
    // fallback a given Cinnamon build happens to have.
    const tilingModeSettingsTarget = {};
    const maximizeWithGapsSettingsTarget = {};
    const gtileAutoTileSettings = new Settings.ExtensionSettings({}, 'gTile@OhMyDebn');
    gtileAutoTileSettings.bindWithObject(tilingModeSettingsTarget, 'tiling-mode', 'mode', null, null);
    gtileAutoTileSettings.bindWithObject(maximizeWithGapsSettingsTarget, 'maximize-with-gaps', 'enabled', null, null);

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
    // gapMaximizedState holds the rect to restore to for windows
    // currently gap-maximized, so a second maximize trigger can be
    // rerouted into a true restore instead of re-applying gaps.
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
              </interface>
            </node>`;
        const nodeInfo = Gio.DBusNodeInfo.new_for_xml(IFACE_XML);
        const ifaceInfo = nodeInfo.interfaces[0];

        // Build a proper vtable object with a method_call function (don't use new Gio.DBusInterfaceVTable)
        const vtable = {
            method_call: function (connection, sender, objectPath, interfaceName, methodName, params, invocation) {
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
                    const colSpan = (args.length >= 5 && Number.isInteger(args[4]) && args[4] > 0) ? args[4] : 1;
                    const rowSpan = (args.length >= 6 && Number.isInteger(args[5]) && args[5] > 0) ? args[5] : 1;

                    // cols/rows feed a division below (screenWidth / nbCols)
                    // - 0 (or negative) produces Infinity/NaN geometry that
                    // flows straight into a native Meta window-resize call,
                    // which this session's own crash debugging established
                    // is not something a JS try/catch can protect against.
                    // colSpan/rowSpan already get this same guard a few
                    // lines up; cols/rows/colIndex/rowIndex didn't.
                    if (nbCols <= 0 || nbRows <= 0 || colIndex < 0 || rowIndex < 0) {
                        invocation.return_dbus_error("org.gTile.Control.Error", "Invalid grid arguments");
                        return;
                    }

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

                    const widthUnit = Math.floor(screenWidth / nbCols);
                    const heightUnit = Math.floor(screenHeight / nbRows);

                    const areaX = screenX + (colIndex * widthUnit);
                    const areaY = screenY + (rowIndex * heightUnit);
                    const areaWidth = widthUnit * colSpan;
                    const areaHeight = heightUnit * rowSpan;

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
                (connection, name) => { global.log('gTile: D-Bus acquired for ' + name); },
                (connection, name) => { global.log('gTile: Acquired well-known name ' + name); },
                (connection, name) => { global.log('gTile: Lost well-known name ' + name); }
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

        const loadTileRules = () => {
            try {
                const file = imports.gi.Gio.File.new_for_path(TILE_RULES_PATH);
                const [ok, contents] = file.load_contents(null);
                if (!ok) return [];
                const parsed = JSON.parse(imports.byteArray.toString(contents));
                return Array.isArray(parsed) ? parsed : [];
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
        const hideNewWindowThenPlace = (win, areaX, areaY, areaWidth, areaHeight) => {
            const applyTileThenReveal = (actor) => {
                try {
                    platform.reset_window(win);
                    platform.move_resize_window(win, areaX, areaY, areaWidth, areaHeight);
                } catch (e) {
                    global.log('gTile: auto-tile apply failed: ' + e);
                }
                // Same settle delay ohmydebn-gtile-apply already uses
                // after its own gdbus tile call, to outlast Cinnamon's
                // resize/move animation before revealing.
                imports.gi.GLib.timeout_add(imports.gi.GLib.PRIORITY_DEFAULT, 150, () => {
                    try {
                        actor.opacity = 255;
                    } catch (e) {
                        global.log('gTile: auto-tile reveal failed: ' + e);
                    }
                    return imports.gi.GLib.SOURCE_REMOVE;
                });
            };

            const hideThenWaitForFirstFrame = (actor) => {
                actor.opacity = 0;
                const firstFrameId = actor.connect('first-frame', () => {
                    actor.disconnect(firstFrameId);
                    applyTileThenReveal(actor);
                });
            };

            const actorNow = win.get_compositor_private();
            if (actorNow) {
                hideThenWaitForFirstFrame(actorNow);
            } else {
                // The compositor actor isn't created yet at
                // window-created time (uncommon but not guaranteed
                // otherwise) - poll on idle until it exists, hiding it
                // the instant it does, same as above.
                imports.gi.GLib.idle_add(imports.gi.GLib.PRIORITY_DEFAULT, () => {
                    const actor = win.get_compositor_private();
                    if (actor) {
                        hideThenWaitForFirstFrame(actor);
                        return imports.gi.GLib.SOURCE_REMOVE;
                    }
                    return imports.gi.GLib.SOURCE_CONTINUE;
                });
            }
        };

        // Shared window-created handler for both dynamic-tiling modes -
        // see treeInsert/treeRemove above for the tree logic itself; this
        // is just the thin Meta-touching layer that applies whatever they
        // decide. maxLeaves: 3 for "Traditional tiling" (capped), null
        // for "Traditional Full" (uncapped) - the only difference between
        // the two modes, since they share the exact same tree.
        const handleTreeTilingWindowCreated = (win, stateMap, maxLeaves) => {
            const monitor = resolveMonitor(win);
            const monitorIndex = typeof monitor.index === 'number' ? monitor.index : 0;
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
            let workspaceIndex = 0;
            try {
                const activeWorkspace = global.workspace_manager.get_active_workspace();
                if (activeWorkspace && typeof activeWorkspace.index === 'function') {
                    workspaceIndex = activeWorkspace.index();
                }
            } catch (e) {
                global.log('gTile: tree-tiling active-workspace lookup failed: ' + e);
            }
            const key = monitorIndex + ':' + workspaceIndex;

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
                try {
                    const [x, y, w, h] = rectForRegion(move.region);
                    platform.reset_window(move.window);
                    platform.move_resize_window(move.window, x, y, w, h);
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
                    imports.gi.GLib.idle_add(imports.gi.GLib.PRIORITY_DEFAULT, () => {
                        const current = stateMap.get(key);
                        if (!current || !current.root) return imports.gi.GLib.SOURCE_REMOVE;
                        // If the capped mode discarded and restarted the
                        // tree since this window was inserted, ownLeaf
                        // belongs to an abandoned tree, not the current
                        // live one - this window was already orphaned/
                        // covered (same as today's shipped "window 4
                        // covers whatever's there" behavior), so leave the
                        // current tree alone rather than splicing into
                        // the wrong structure.
                        let ownRoot = ownLeaf;
                        while (ownRoot.parent) {
                            ownRoot = ownRoot.parent;
                        }
                        if (ownRoot !== current.root) return imports.gi.GLib.SOURCE_REMOVE;

                        const removal = treeRemove(current, ownLeaf);
                        stateMap.set(key, { root: removal.root, insertionLeaf: removal.insertionLeaf, leafCount: removal.leafCount });
                        for (const move of removal.moves) {
                            applyMove(move, 'tree-tiling rebalance move');
                        }
                        return imports.gi.GLib.SOURCE_REMOVE;
                    });
                });
            } catch (e) {
                global.log('gTile: tree-tiling unmanaging hook failed: ' + e);
            }
        };

        windowCreatedSignal = global.display.connect('window-created', (display, win) => {
            try {
                if (!win || win.minimized || !utils_Main.isInteresting(win)) return;

                // "off": nothing automatic. "traditional"/"traditional-full":
                // one of the two dynamic cycles. "rules": rule-table
                // matching below. Anything else - including unset/
                // unrecognized, e.g. before the settings binding's first
                // read completes - does nothing, same as "off": that's
                // the schema's own default, so treating an unknown value
                // the same way is the safe choice, not an arbitrary one.
                if (tilingModeSettingsTarget.mode === 'traditional') {
                    handleTreeTilingWindowCreated(win, traditionalTilingState, 3);
                    return;
                }
                if (tilingModeSettingsTarget.mode === 'traditional-full') {
                    handleTreeTilingWindowCreated(win, traditionalFullState, null);
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

                if (gapMaximizedState.has(id)) {
                    // Second trigger on an already gap-maximized window:
                    // Meta thinks this is a fresh maximize (its own flag
                    // was cleared by our own unmaximize() below last
                    // time) - re-route into a true restore to the
                    // ORIGINAL pre-maximize rect instead of re-gapping.
                    const restoreRect = gapMaximizedState.get(id);
                    gapMaximizedState.delete(id);
                    platform.reset_window(win);
                    // _exact_, not move_resize_window - restoreRect is
                    // already the window's original size; move_resize_window
                    // would shrink it further by the gap on top of that.
                    platform.move_resize_window_exact(win, restoreRect.x, restoreRect.y, restoreRect.width, restoreRect.height);
                    return;
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

                gapMaximizedState.set(id, preRect);
            } catch (e) {
                global.log('gTile: maximize-with-gaps size-changed handler failed: ' + e);
            }
        });
    } catch (e) {
        global.log('gTile: failed to connect maximize-with-gaps signals: ' + e);
    }
};
const disable = () => {
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
