#!/usr/bin/env bash
# Deterministic verification gate. No LLM judgement — measurements only.
#
# Runs before any review agent is worth invoking. A review of code that does
# not typecheck is wasted tokens.
#
#   verify.sh          fast gate: lint + typecheck   (seconds)
#   verify.sh --full   release gate: + production build
#
# Lint is checked against .claude/gates/lint-baseline.json and fails only on
# NEW findings. A gate that can never go green is a gate nobody reads.
#
# Exit 0 = pass, 1 = fail, 0 with a notice if the toolchain is not installed.
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 0

if [ ! -d node_modules ]; then
  echo "verify: node_modules missing — run 'npm install' first. Skipping." >&2
  exit 0
fi

fail=0
run() {
  local label="$1"; shift
  printf '\n=== %s ===\n' "$label"
  if "$@"; then
    echo "PASS  $label"
  else
    echo "FAIL  $label" >&2
    fail=1
  fi
}

run "typecheck" npx tsc --noEmit
run "lint"      ./.claude/hooks/lint_gate.py

if [ "${1:-}" = "--full" ]; then
  run "build" npx next build
fi

printf '\n'
[ "$fail" -eq 0 ] && echo "VERIFY PASS" || echo "VERIFY FAIL" >&2
exit "$fail"
