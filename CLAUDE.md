# Akruti — custom 3D prints storefront

Next.js 16 · React 19 · TypeScript · Tailwind 4 · Zustand · Stripe (installed,
not yet wired). Deployed public. Currency AUD, Australian spelling, Canberra.

**This file governs code work on this repo only.** The 3D printing workshop has
its own separate setup; nothing here applies to it and nothing there applies
here. Keep it that way — these agents and hooks are deliberately project-scoped
(`.claude/` in the repo, never `~/.claude/`) so they cannot load into a
workshop session.

## Verify before you review

```bash
.claude/hooks/verify.sh          # typecheck + lint — seconds
.claude/hooks/verify.sh --full   # + production build — before any release
```

A Stop hook blocks the turn if `.ts`/`.tsx` changed and `tsc` fails. That is
the floor, not the standard.

`.claude/gates/code-review-gates.md` is the written gate list. Read it before
reviewing; append to it whenever a real defect ships.

## Scale the process to the risk

Most changes do not need a plan gate. Ceremony that fires on every change stops
being read.

| Tier | What it covers | Process |
|---|---|---|
| **Trivial** | copy, styling, config, content | `verify.sh` only. No agents. |
| **Normal** | a feature, a bug fix, a component | brief plan → implement → `verify.sh` → **code-reviewer** |
| **Risky** | auth, payments, schema, migrations, uploads, anything touching money or customer data | plan → **plan-challenger** → implement → `verify.sh --full` → **code-reviewer** → **release-judge** |

When unsure which tier, take the higher one. Anything under `src/app/api/`,
anything touching Stripe, and anything that writes to disk is Risky by default.

## The agents

| Agent | Model | Does |
|---|---|---|
| **plan-challenger** | opus | Attacks a plan before code exists — bad assumptions, edge cases, reversibility. Risky tier only. |
| **code-reviewer** | opus | Adversarial review of the diff against the gate list. Reports; never edits. |
| **release-judge** | opus | Go/no-go: do requirement, plan, diff and evidence actually agree? Risky tier only. |

### Rules of engagement

- **The reviewer never implements.** Whoever wrote the code does not review it.
  Independence is the whole point.
- **Deterministic before judgement.** `verify.sh` first, every time. Do not
  spend an opus call on something a linter already answers.
- **A false FAIL costs as much as a false PASS**, and gets less scrutiny because
  it feels safe. Before calling anything broken: read its own docs, and if you
  could not reproduce it say "UNTESTED", not "it is broken".
- **BLOCK is rare.** It means production breaks, data is lost, or a hole opens.
  Everything else is FIX or NOTE.
- **The main session dispatches.** Subagents cannot spawn subagents — plan
  agents return plans, and this session runs the steps.

## Known state (2026-08-20)

First gate run on a clean checkout: **4 typecheck errors, 26 lint errors**.
Gates 1–3 in the gate list are seeded from that output; gates 4–7 from reading
the upload route, the catalog store and the FAQ copy. Not yet fixed.

## Conventions

- Money is integer cents throughout; format only at the edge via
  `formatPrice()` in `src/lib/stripe.ts`. Never do arithmetic on a formatted
  string.
- `src/data/*.ts` holds the seed catalogue. `src/store/catalog.ts` layers
  `localStorage` over it — that is per-browser, not server state.
- Components over ~400 lines are hard to review; prefer splitting when touching
  one. `product/[slug]/page.tsx` (1004) and `admin/page.tsx` (947) are the
  worst offenders and carry most of the defects.
