const { gtile } = require('./gTile');

/**
 * called when extension is loaded
 */
function init(metadata) {
    // metadata holds this extension's metadata.json contents
    gtile.init(metadata);
}

/**
 * called when extension is enabled
 */
function enable() {
    gtile.enable();
}

/**
 * called when extension gets disabled
 */
function disable() {
    gtile.disable();
}