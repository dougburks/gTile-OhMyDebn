# gTile-OhMyDebn

This is a fork of the Cinnamon gTile window tiling extension for [OhMyDebn](https://github.com/dougburks/ohmydebn) with additional features:

- window gaps, to look more like a traditional tiling window manager, with the gap size configurable in settings
- optional automatic tiling, selectable in settings:
  - **Rule-based tiling**: new windows matching OhMyDebn's `tile-rules.json` (`/usr/share/ohmydebn/config/tile-rules.json`) are tiled to their configured spot as they open
  - **Traditional tiling (3 windows)**: every new window splits the current layout in a binary tree (full screen, then left/right, then alternating vertical/horizontal), capped at 3 windows; closing a window rebalances so the remaining windows reclaim the space
  - **Traditional tiling (unlimited)**: the same binary-tree splitting without the 3-window cap
  - **Scrollable tiling (like Niri)**: every new window opens as its own full-height column to the right of the focused one, and the screen scrolls over the strip of columns — focusing a window (window list, Alt-Tab, or the column hotkeys) scrolls its column into view, and columns scrolled out of view are minimized until focused again. A lone window fills the screen and collapses to its configured column width when a second window opens (as in Omarchy), expanding again when it's alone. Column width is configurable in settings, and built-in hotkeys navigate the strip: `Super+comma`/`Super+period` focus the column to the left/right, `Super+Shift+comma`/`Super+Shift+period` move the focused column — all rebindable on the extension's Hotkeys tab
- **Tiling animation**: window rearrangements from automatic tiling (scrollable scrolling, traditional splits and rebalances) glide into place, Hyprland-style; the duration is configurable in settings (0 disables it, and Cinnamon's global desktop-effects switch is respected)
- **Mode cycling**: `Super+L` cycles the tiling mode (Off → Rule-based → Traditional ×2 → Scrollable and around), `Super+Shift+L` cycles backward, with a volume-style on-screen display announcing the new mode — inspired by Omarchy's layout toggle; both keys rebindable on the Hotkeys tab. Switching modes affects windows opened afterwards; existing windows stay where they are. Note: stock Cinnamon binds `Super+L` to Looking Glass by default — OhMyDebn moves Looking Glass to `Super+Alt+L`; on vanilla Cinnamon, rebind one side or the other (either in this extension's Hotkeys tab or in Cinnamon's `looking-glass-keybinding`)
- **Settings hotkey**: `Super+Shift+G` opens the extension's settings window on the Behavior tab (rebindable, like all of the extension's hotkeys)
- **Maximize with gaps**: maximizing a window (titlebar button, keybinding, or double-click) leaves the configured gap instead of going edge-to-edge; maximizing again restores the original size and position
- **Tile labels**: with "Show tile labels" enabled, each tile in the grid UI shows a letter — press two letters to tile the focused window to the rectangle spanning those two tiles
- a D-Bus control interface, so hotkeys or scripts can tile the focused window without showing the overlay:

  ```sh
  gdbus call --session --dest org.gTile.Control \
    --object-path /org/gTile/Control \
    --method org.gTile.Control.TileFocusedWindow \
    <cols> <rows> <colIndex> <rowIndex> <colSpan> <rowSpan>
  # e.g. left half of a 2x1 grid:
  #   ... TileFocusedWindow 2 1 0 0 1 1
  ```

  With Scrollable tiling active, the same interface also offers `FocusColumnLeft`, `FocusColumnRight`, `MoveColumnLeft`, and `MoveColumnRight` (no arguments) for scripted column navigation — the same actions the built-in column hotkeys drive:

  ```sh
  gdbus call --session --dest org.gTile.Control \
    --object-path /org/gTile/Control \
    --method org.gTile.Control.FocusColumnRight
  ```

  `CycleTilingMode <direction>` steps the tiling mode forward (positive) or backward (negative) through the same cycle as the `Super+L`/`Super+Shift+L` hotkeys, on-screen display included.

This extension is actually called gTile@OhMyDebn but GitHub doesn't allow the @ symbol. So after cloning, the directory needs to be renamed from gTile-OhMyDebn to gTile@OhMyDebn.

If you're using [OhMyDebn](https://github.com/dougburks/ohmydebn), then this extension is automatically installed for you.

## Translations

`po/gTile@OhMyDebn.pot` is generated from the current strings (settings-schema.json, metadata.json and `_()` calls in `5.4/`), and every `po/*.po` is merged against it, by:

```sh
python3 tools/update-pot.py
```

Re-run it after changing any user-facing string. gettext matches translations on the exact source text, so an edited string silently loses its translations in every language until the template is regenerated and a translator confirms the entry msgmerge marked fuzzy.

## Tests

The pure-logic modules in `5.4/` and the settings schema have unit tests that run with plain `gjs`, no live Cinnamon session needed — `tests/run.sh` discovers every `tests/test-*.js` suite automatically:

```sh
tests/run.sh
```
