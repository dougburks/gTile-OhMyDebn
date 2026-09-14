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

// --- Every page exists, every section exists, every section key is
// defined at the top level ---

const referencedKeys = {};
let pagesOk = true, sectionsOk = true, keysOk = true;
let missingDetail = '';
for (const page of (layout.pages || [])) {
    const pageDef = layout[page];
    if (!pageDef || pageDef.type !== 'page') {
        pagesOk = false;
        missingDetail = 'page ' + page;
        continue;
    }
    for (const section of (pageDef.sections || [])) {
        const sectionDef = layout[section];
        if (!sectionDef || sectionDef.type !== 'section') {
            sectionsOk = false;
            missingDetail = 'section ' + section;
            continue;
        }
        for (const key of (sectionDef.keys || [])) {
            referencedKeys[key] = true;
            if (!schema[key]) {
                keysOk = false;
                missingDetail = 'key ' + key + ' (section ' + section + ')';
            }
        }
    }
}
check('every page listed in the layout is defined', pagesOk, missingDetail);
check('every section listed in a page is defined', sectionsOk, missingDetail);
check('every key listed in a section is defined at the top level', keysOk, missingDetail);

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

let checkboxOk = true, comboOk = true, spinOk = true, keybindOk = true;
let typeDetail = '';
for (const key in schema) {
    if (key === 'layout') continue;
    const def = schema[key];
    switch (def.type) {
        case 'checkbox':
            // The actual historical bug: a default of "false" (string)
            // is truthy in JS and silently inverts the behavior.
            if (typeof def.default !== 'boolean') {
                checkboxOk = false;
                typeDetail = key;
            }
            break;
        case 'combobox': {
            const values = Object.keys(def.options || {}).map(k => def.options[k]);
            if (values.indexOf(def.default) === -1) {
                comboOk = false;
                typeDetail = key;
            }
            break;
        }
        case 'spinbutton':
            if (typeof def.default !== 'number' ||
                typeof def.min !== 'number' || typeof def.max !== 'number' ||
                def.default < def.min || def.default > def.max) {
                spinOk = false;
                typeDetail = key;
            }
            break;
        case 'keybinding':
            if (typeof def.default !== 'string' || def.default.length === 0) {
                keybindOk = false;
                typeDetail = key;
            }
            break;
    }
}
check('every checkbox default is a real boolean, not a string', checkboxOk, typeDetail);
check('every combobox default is one of its own options', comboOk, typeDetail);
check('every spinbutton default is numeric and within its min/max', spinOk, typeDetail);
check('every keybinding default is a non-empty string', keybindOk, typeDetail);

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

{
    // bindProperty(direction, 'key', ...) / bindWithObject(target, 'key', ...)
    const bindingRe = /bind(?:Property|WithObject)\([^,)]+,\s*'([^']+)'/g;
    let match;
    let bindingCount = 0;
    const missingBindings = [];
    while ((match = bindingRe.exec(bundle)) !== null) {
        bindingCount++;
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
        if (!schema[match[1]] && missingHotkeys.indexOf(match[1]) === -1)
            missingHotkeys.push(match[1]);
    }
    check('every TILING_HOTKEYS settingKey in gTile.js exists in the schema (' + hotkeyCount + ' entries scanned)',
        hotkeyCount > 0 && missingHotkeys.length === 0, missingHotkeys.join(', '));
}

{
    // The reverse direction: a keybinding defined in the schema but
    // never referenced by the bundle would render an editable key in
    // the settings UI that does nothing.
    const deadKeybindings = [];
    for (const key in schema) {
        if (key === 'layout' || schema[key].type !== 'keybinding') continue;
        if (bundle.indexOf("'" + key + "'") === -1)
            deadKeybindings.push(key);
    }
    check('every keybinding in the schema is referenced by gTile.js (no dead hotkey settings)',
        deadKeybindings.length === 0, deadKeybindings.join(', '));
}

print('');
print(total + ' check(s), ' + failures + ' failure(s)');
imports.system.exit(failures === 0 ? 0 : 1);
