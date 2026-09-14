#!/bin/bash
#
# Minimal test runner for the parts of this extension that don't need a
# live Cinnamon session (every tests/test-*.js suite and
# tests/check-sync.sh). Anything
# touching global.*/Meta/imports.ui.main still needs manual testing in a
# real session - there's no headless Cinnamon to run those against.
#
# Suites are discovered by glob, not listed by hand - a new
# tests/test-*.js file is picked up automatically, so it can't be
# silently forgotten here.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAIL=0

for TEST in "$REPO_ROOT"/tests/test-*.js; do
  echo "-- tests/$(basename "$TEST") --"
  if ! gjs "$TEST"; then
    FAIL=1
  fi
  echo
done

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
