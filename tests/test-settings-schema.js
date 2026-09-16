#!/usr/bin/env gjs
//
// Structural validation for 5.4/settings-schema.json - no live
// Cinnamon session required. Schema problems otherwise fail silently
// at extension load time (and a Cinnamon restarted by a system update
// can have its logs pointed at /dev/null, so "silently" is literal).
// Every check here corresponds to a bug class this repo has actually
// seen: checkbox defaults as "false" strings (truthy!), layout
// sections referencing undefined keys, orphaned widget definitions no
// section shows, and drift between a schema default and the pure
// normalizer that backstops the same setting at runtime.

const GLib = imports.gi.GLib;

let failures = 0;
let total = 0;

function check(name, ok, detail) {
    total++;
    if (ok) {
        print('PASS - ' + name);
    } else {
        failures++;
        print('FAIL - ' + name + (detail ? ' (' + detail + ')' : ''));
    }
}

const scriptDir = GLib.path_get_dirname(imports.system.programInvocationName || ARGV[0] || '.');
function readFile(rel) {
    const path = GLib.build_filenamev([scriptDir, '..', '5.4', rel]);
    const [ok, contents] = GLib.file_get_contents(path);
    if (!ok) {
        printerr('Could not read ' + path);
        imports.system.exit(1);
    }
    return imports.byteArray.toString(contents);
}

let schema = null;
try {
    schema = JSON.parse(readFile('settings-schema.json'));
} catch (e) {
    check('settings-schema.json is valid JSON', false, String(e));
    print('');
    print(total + ' check(s), ' + failures + ' failure(s)');
    imports.system.exit(1);
}
check('settings-schema.json is valid JSON', true);

// Load the pure normalizers for the schema<->runtime-fallback
// cross-checks at the bottom.
eval(readFile('gap-math.js'));
eval(readFile('scrollable-tiling.js'));

const layout = schema['layout'];
check('has a layout of type "layout"', !!layout && layout.type === 'layout');
if (!layout) {
    // Nothing below can be checked without it - stop with a summary
    // rather than an uncaught TypeError on layout.pages.
    print('');
    print(total + ' check(s), ' + failures + ' failure(s)');
    imports.system.exit(1);
}

// --- Every page exists, every section exists, every section key is
// defined at the top level ---

const referencedKeys = {};
// One detail list per check, so a failure is reported under the check
// it belongs to (a single shared "last failure" string used to leak
// e.g. a page failure into the keys check's message).
const missingPages = [], missingSections = [], missingKeys = [];
for (const page of (layout.pages || [])) {
    const pageDef = layout[page];
    if (!pageDef || pageDef.type !== 'page') {
        missingPages.push(page);
        continue;
    }
    for (const section of (pageDef.sections || [])) {
        const sectionDef = layout[section];
        if (!sectionDef || sectionDef.type !== 'section') {
            missingSections.push(section);
            continue;
        }
        for (const key of (sectionDef.keys || [])) {
            referencedKeys[key] = true;
            if (!schema[key])
                missingKeys.push(key + ' (section ' + section + ')');
        }
    }
}
check('every page listed in the layout is defined', missingPages.length === 0, missingPages.join(', '));
check('every section listed in a page is defined', missingSections.length === 0, missingSections.join(', '));
check('every key listed in a section is defined at the top level', missingKeys.length === 0, missingKeys.join(', '));

// --- No orphaned widget definitions: every top-level setting that
// renders a widget must be reachable through some section. "generic"
// entries are storage-only (never shown) and exempt. ---

let orphans = [];
for (const key in schema) {
    if (key === 'layout') continue;
    if (schema[key].type === 'generic') continue;
    if (!referencedKeys[key]) orphans.push(key);
}
check('no orphaned widget definitions outside the layout', orphans.length === 0, orphans.join(', '));

// --- Per-type default sanity ---

const badCheckboxes = [], badCombos = [], badSpins = [], badKeybinds = [];
for (const key in schema) {
    if (key === 'layout') continue;
    const def = schema[key];
    switch (def.type) {
        case 'checkbox':
            // The actual historical bug: a default of "false" (string)
            // is truthy in JS and silently inverts the behavior.
            if (typeof def.default !== 'boolean')
                badCheckboxes.push(key);
            break;
        case 'combobox': {
            const values = Object.keys(def.options || {}).map(k => def.options[k]);
            if (values.indexOf(def.default) === -1)
                badCombos.push(key);
            break;
        }
        case 'spinbutton':
            if (typeof def.default !== 'number' ||
                typeof def.min !== 'number' || typeof def.max !== 'number' ||
                def.default < def.min || def.default > def.max)
                badSpins.push(key);
            break;
        case 'keybinding':
            if (typeof def.default !== 'string' || def.default.length === 0)
                badKeybinds.push(key);
            break;
    }
}
check('every checkbox default is a real boolean, not a string', badCheckboxes.length === 0, badCheckboxes.join(', '));
check('every combobox default is one of its own options', badCombos.length === 0, badCombos.join(', '));
check('every spinbutton default is numeric and within its min/max', badSpins.length === 0, badSpins.join(', '));
check('every keybinding default is a non-empty string', badKeybinds.length === 0, badKeybinds.join(', '));

// --- Schema defaults agree with the pure runtime fallbacks: the
// normalizers are what an unset/garbage value falls back to at
// runtime, so a schema default drifting away from them would make a
// fresh install behave differently from a reset/corrupted setting. ---

check('gap-size schema default matches normalizeGapSize\'s fallback',
    schema['gap-size'].default === normalizeGapSize(undefined),
    schema['gap-size'].default + ' vs ' + normalizeGapSize(undefined));
check('scroll-animation-duration schema default matches normalizeScrollDuration\'s fallback',
    schema['scroll-animation-duration'].default === normalizeScrollDuration(undefined),
    schema['scroll-animation-duration'].default + ' vs ' + normalizeScrollDuration(undefined));
check('scrollable-column-width schema default matches columnWidthFraction\'s fallback',
    schema['scrollable-column-width'].default === columnWidthFraction(undefined) * 100,
    schema['scrollable-column-width'].default + ' vs ' + columnWidthFraction(undefined) * 100);

// --- Schema ranges agree with the pure runtime clamps too: the
// spinbutton's min/max is what the UI lets a user pick, the clamp is what
// the code accepts from a value set any other way (dconf, an old
// setting). They had drifted (clamp 10..100 vs UI 20..80, clamp 1000ms vs
// UI 500ms) before the code started reading its bounds from one place. ---

check('scrollable-column-width schema min/max match the code\'s clamp bounds',
    schema['scrollable-column-width'].min === SCROLLABLE_COLUMN_WIDTH_MIN_PERCENT &&
    schema['scrollable-column-width'].max === SCROLLABLE_COLUMN_WIDTH_MAX_PERCENT,
    schema['scrollable-column-width'].min + '..' + schema['scrollable-column-width'].max +
    ' vs ' + SCROLLABLE_COLUMN_WIDTH_MIN_PERCENT + '..' + SCROLLABLE_COLUMN_WIDTH_MAX_PERCENT);
check('scroll-animation-duration schema max matches the code\'s clamp',
    schema['scroll-animation-duration'].max === SCROLL_ANIMATION_MAX_MS,
    schema['scroll-animation-duration'].max + ' vs ' + SCROLL_ANIMATION_MAX_MS);

// The Super+L cycle (TILING_MODE_CYCLE in scrollable-tiling.js) and
// the tiling-mode combobox options must be exactly the same set of
// modes - a mode added to one but not the other would either be
// unreachable from the hotkey or crash the cycle into an unknown
// value.
{
    const opts = schema['tiling-mode'].options;
    const optionValues = Object.keys(opts).map(k => opts[k]).sort().join(',');
    const cycleValues = TILING_MODE_CYCLE.slice().sort().join(',');
    check('nextTilingMode\'s cycle covers exactly the tiling-mode combobox options',
        optionValues === cycleValues, optionValues + ' vs ' + cycleValues);
}

// --- The bundle's settings bindings agree with the schema ---
// gTile.js references settings keys as string literals in
// bindProperty/bindWithObject calls and in the TILING_HOTKEYS table's
// settingKey fields. A key renamed on either side fails silently at
// extension load time, so pin the two sides together by scanning the
// bundle's source text (no eval - just literals). Keys passed as
// variables (the grid1x-style loop) are invisible to this scan and
// exempt by construction.

const bundle = readFile('gTile.js');
// Keys the bundle actually wires up, collected by the two scans below and
// reused by the dead-keybinding check after them.
const referencedByBundle = {};

{
    // bindProperty(direction, 'key', ...) / bindWithObject(target, 'key', ...)
    const bindingRe = /bind(?:Property|WithObject)\([^,)]+,\s*'([^']+)'/g;
    let match;
    let bindingCount = 0;
    const missingBindings = [];
    while ((match = bindingRe.exec(bundle)) !== null) {
        bindingCount++;
        referencedByBundle[match[1]] = true;
        if (!schema[match[1]] && missingBindings.indexOf(match[1]) === -1)
            missingBindings.push(match[1]);
    }
    check('every settings key bound by literal name in gTile.js exists in the schema (' + bindingCount + ' bindings scanned)',
        bindingCount > 0 && missingBindings.length === 0, missingBindings.join(', '));
}

{
    // TILING_HOTKEYS entries: { settingKey: 'hotkey-...', ... }
    const settingKeyRe = /settingKey:\s*'([^']+)'/g;
    let match;
    let hotkeyCount = 0;
    const missingHotkeys = [];
    while ((match = settingKeyRe.exec(bundle)) !== null) {
        hotkeyCount++;
        referencedByBundle[match[1]] = true;
        if (!schema[match[1]] && missingHotkeys.indexOf(match[1]) === -1)
            missingHotkeys.push(match[1]);
    }
    check('every TILING_HOTKEYS settingKey in gTile.js exists in the schema (' + hotkeyCount + ' entries scanned)',
        hotkeyCount > 0 && missingHotkeys.length === 0, missingHotkeys.join(', '));
}

{
    // The reverse direction: a keybinding defined in the schema but
    // never wired up by the bundle would render an editable key in the
    // settings UI that does nothing. "Wired up" means one of the two
    // binding forms scanned above - a bare mention of the key's name in
    // a string (a comment, a log line) doesn't count.
    const deadKeybindings = [];
    for (const key in schema) {
        if (key === 'layout' || schema[key].type !== 'keybinding') continue;
        if (!referencedByBundle[key])
            deadKeybindings.push(key);
    }
    check('every keybinding in the schema is referenced by gTile.js (no dead hotkey settings)',
        deadKeybindings.length === 0, deadKeybindings.join(', '));
}

print('');
print(total + ' check(s), ' + failures + ' failure(s)');
imports.system.exit(failures === 0 ? 0 : 1);
