#!/bin/bash
#
# Minimal test runner for the parts of this extension that don't need a
# live Cinnamon session (see tests/test-tile-rules.js,
# tests/test-traditional-tiling.js, tests/test-screen-area.js, and
# tests/check-sync.sh). Anything
# touching global.*/Meta/imports.ui.main still needs manual testing in a
# real session - there's no headless Cinnamon to run those against.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAIL=0

echo "-- tests/test-tile-rules.js --"
if ! gjs "$REPO_ROOT/tests/test-tile-rules.js"; then
  FAIL=1
fi

echo
echo "-- tests/test-traditional-tiling.js --"
if ! gjs "$REPO_ROOT/tests/test-traditional-tiling.js"; then
  FAIL=1
fi

echo
echo "-- tests/test-screen-area.js --"
if ! gjs "$REPO_ROOT/tests/test-screen-area.js"; then
  FAIL=1
fi

echo
echo "-- tests/check-sync.sh --"
if ! bash "$REPO_ROOT/tests/check-sync.sh"; then
  FAIL=1
fi

echo
if [ "$FAIL" -eq 0 ]; then
  echo "all suites passed"
else
  echo "one or more suites FAILED"
fi
exit "$FAIL"
