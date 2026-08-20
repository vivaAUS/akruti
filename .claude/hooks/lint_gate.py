#!/usr/bin/env python3
"""Lint gate with a baseline.

A gate that always fails is a gate nobody reads. This repo carries 26
pre-existing eslint errors that need a component split to clear, so a bare
`eslint src` can never go green and therefore can never signal a regression.

This compares the current findings against a checked-in baseline and fails only
on NEW ones. The baseline is keyed on file+rule counts, not line numbers, so
routine edits that shift lines do not produce phantom findings.

    lint_gate.py             check against the baseline
    lint_gate.py --update    rewrite the baseline from the current state
"""
import collections
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
BASELINE = ROOT / ".claude" / "gates" / "lint-baseline.json"


def current():
    proc = subprocess.run(
        ["npx", "eslint", "src", "-f", "json"],
        cwd=ROOT, capture_output=True, text=True,
    )
    if not proc.stdout.strip():
        sys.stderr.write(proc.stderr)
        raise SystemExit("lint_gate: eslint produced no JSON output")
    counts = collections.Counter()
    for f in json.loads(proc.stdout):
        rel = pathlib.Path(f["filePath"]).relative_to(ROOT).as_posix()
        for m in f["messages"]:
            if m["severity"] == 2:
                counts[f"{rel}::{m.get('ruleId') or 'unknown'}"] += 1
    return counts


def main():
    counts = current()
    if "--update" in sys.argv:
        BASELINE.write_text(json.dumps(dict(sorted(counts.items())), indent=2) + "\n")
        print(f"lint baseline written: {sum(counts.values())} errors "
              f"across {len(counts)} file+rule pairs")
        return 0

    if not BASELINE.exists():
        print("lint_gate: no baseline yet — run with --update to create one")
        return 0

    base = collections.Counter(json.loads(BASELINE.read_text()))
    new = {k: (base.get(k, 0), v) for k, v in counts.items() if v > base.get(k, 0)}
    fixed = {k: (v, counts.get(k, 0)) for k, v in base.items() if counts.get(k, 0) < v}

    for k, (was, now) in sorted(fixed.items()):
        print(f"  improved  {k}: {was} -> {now}")

    if new:
        sys.stderr.write("\nNEW lint errors not in the baseline:\n")
        for k, (was, now) in sorted(new.items()):
            sys.stderr.write(f"  {k}: {was} -> {now}\n")
        sys.stderr.write("\nFix them, or if they are deliberate run:\n"
                         "  .claude/hooks/lint_gate.py --update\n")
        return 1

    total = sum(counts.values())
    print(f"no new lint errors ({total} pre-existing, baselined)")
    if fixed:
        print("baseline is now stale in your favour — refresh it with --update")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
