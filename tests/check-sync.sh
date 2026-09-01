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
SYNCED_FILES=(
  tile-rules.js
  traditional-tiling.js
  screen-area.js
)

FAIL=0
for NAME in "${SYNCED_FILES[@]}"; do
  CANONICAL="$REPO_ROOT/5.4/$NAME"
  # NAME (e.g. "tile-rules.js") gets interpolated into a sed regex below -
  # escape its '.' so it matches a literal dot, not "any character".
  NAME_RE="${NAME//./\\.}"
  EXTRACTED=$(sed -n "/BEGIN $NAME_RE/,/END $NAME_RE/p" "$GTILE_JS" | sed '1d;$d')
  # The canonical file carries its own file-level header comment (not
  # copied into gTile.js, which has its own surrounding marker comment
  # instead) - strip everything up to and including the first blank line
  # before comparing.
  CANONICAL_BODY=$(awk 'f{print} /^$/{f=1}' "$CANONICAL")

  if [ -z "$EXTRACTED" ]; then
    echo "FAIL - no BEGIN/END $NAME markers found in $GTILE_JS"
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

exit "$FAIL"
