#!/usr/bin/env bash
# Stop hook: refuse to end a turn that left TypeScript broken.
#
# Only fires when the working tree actually has .ts/.tsx changes, so prose,
# config and doc turns are untouched. Exit 2 = block, message shown to Claude.
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 0
[ -d node_modules ] || exit 0

changed=$(git status --porcelain -- '*.ts' '*.tsx' 2>/dev/null | wc -l)
[ "$changed" -eq 0 ] && exit 0

if ! out=$(npx tsc --noEmit 2>&1); then
  {
    echo "BLOCKED: TypeScript does not compile, and this turn changed .ts/.tsx files."
    echo
    echo "$out" | head -30
    echo
    echo "Fix these before finishing. Run: .claude/hooks/verify.sh"
  } >&2
  exit 2
fi
exit 0
