#!/bin/bash
#
# 5.4/gTile.js is a hand-patched compiled webpack bundle with no build
# step (see the repo root for the lack of package.json/webpack config),
# so pure-function sibling files' bodies can't be require()'d into it at
# runtime - they're copied byte-for-byte instead, between matching
# "BEGIN/END <filename>" marker comments in gTile.js. This script
# extracts each block and diffs it against its canonical file, so the
# copies can't silently drift apart - the canonical files are what the
# tests/test-*.js suites actually test, so a drift would mean the code
# under test isn't the code that runs live.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GTILE_JS="$REPO_ROOT/5.4/gTile.js"

# Add a new "<canonical file>" entry here whenever a new pure-logic file
# gets embedded into gTile.js this way.
# Derived from the markers actually present in gTile.js rather than a
# hand-maintained list, so a new "// BEGIN x.js" block can't go unchecked.
# The reverse direction is covered below: every pure module in 5.4/ must
# have a block.
mapfile -t SYNCED_FILES < <(grep -oP '^// BEGIN \K\S+' "$GTILE_JS")

FAIL=0
for NAME in "${SYNCED_FILES[@]}"; do
  CANONICAL="$REPO_ROOT/5.4/$NAME"
  # NAME (e.g. "tile-rules.js") gets interpolated into a sed regex below -
  # escape its '.' so it matches a literal dot, not "any character".
  # The marker match is anchored to the exact full line ("// BEGIN <name>"
  # at column 0) so an indented prose comment that happens to mention a
  # marker can't reopen the sed range and swallow the rest of the file.
  NAME_RE="${NAME//./\\.}"
  if [ ! -f "$CANONICAL" ]; then
    echo "FAIL - gTile.js has a BEGIN/END $NAME block but 5.4/$NAME does not exist"
    FAIL=1
    continue
  fi
  # A missing/mistyped END marker would otherwise make the sed range run
  # to end-of-file and show up as a bewildering thousands-of-lines "drift".
  if ! grep -q "^// END $NAME_RE\$" "$GTILE_JS"; then
    echo "FAIL - gTile.js has a BEGIN $NAME marker but no matching END $NAME marker"
    FAIL=1
    continue
  fi
  EXTRACTED=$(sed -n "/^\/\/ BEGIN $NAME_RE\$/,/^\/\/ END $NAME_RE\$/p" "$GTILE_JS" | sed '1d;$d')
  # The canonical file carries its own file-level header comment (not
  # copied into gTile.js, which has its own surrounding marker comment
  # instead) - strip everything up to and including the first blank line
  # before comparing.
  CANONICAL_BODY=$(awk 'f{print} /^$/{f=1}' "$CANONICAL")

  if [ -z "$EXTRACTED" ]; then
    echo "FAIL - the BEGIN/END $NAME block in $GTILE_JS is empty"
    FAIL=1
    continue
  fi

  if [ "$EXTRACTED" = "$CANONICAL_BODY" ]; then
    echo "PASS - gTile.js's embedded copy matches $NAME"
  else
    echo "FAIL - gTile.js's embedded copy has drifted from $NAME"
    diff <(echo "$CANONICAL_BODY") <(echo "$EXTRACTED")
    FAIL=1
  fi
done


# Reverse direction: every pure module next to gTile.js must be embedded.
for CANONICAL in "$REPO_ROOT"/5.4/*.js; do
  NAME=$(basename "$CANONICAL")
  case "$NAME" in gTile.js | extension.js) continue ;; esac
  if ! grep -q "^// BEGIN ${NAME//./\\.}\$" "$GTILE_JS"; then
    echo "FAIL - 5.4/$NAME exists but has no BEGIN/END block in gTile.js"
    FAIL=1
  fi
done

exit "$FAIL"
