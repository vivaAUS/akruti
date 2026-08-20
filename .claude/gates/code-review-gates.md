# Code Review Gates — akruti

**Read before reviewing. Append after any real defect ships.**

The point: a defect found once must never ship twice. Every numbered gate below
exists because something in this repo was actually wrong, not because it is
good general advice. Generic advice belongs in a linter; this file is for what
the linter missed or what we learned the hard way.

Tags: `[GATE]` hard pass/fail · `[PROBE]` measure and judge in context ·
`[VERIFIED]` observed in this codebase · `[ASSUMED]` reasoned, not yet observed.

---

## 0. The deterministic gate runs first — always `[GATE]`

`.claude/hooks/verify.sh` (typecheck + lint) must pass before a review agent is
invoked. Reviewing code that does not compile spends judgement on a problem a
machine already found for free.

`verify.sh --full` adds the production build. Run it before any release.

**Never** report "tests pass" without the output. Re-measure any figure someone
else reported before repeating it — a number can be computed correctly and
still describe the wrong comparison.

## 1. Hooks are called unconditionally, in the same order, every render `[GATE]` `[VERIFIED]`

`src/app/product/[slug]/page.tsx` carried **18** `rules-of-hooks` violations —
`useState`/`useEffect` after an early return. React throws *"Rendered more hooks
than during the previous render"* and the page dies at runtime; nothing in the
type system catches it.

→ Every hook above every `return`. If a component needs an early exit, split it:
a thin wrapper that returns early, and an inner component that holds the hooks.

## 2. A dynamic route param is untrusted input `[GATE]` `[VERIFIED]`

Same file, lines 444–446: `product` is `Product | undefined` and used as
`Product`. Any URL with an unknown slug crashes the page.

→ Look the entity up, and if it is missing call `notFound()` before touching it.
Never assume a route param resolves.

## 3. The build must have no undefined identifiers `[GATE]` `[VERIFIED]`

`src/components/home/CategoryMosaic.tsx:119` referenced `categories`, which does
not exist in scope (`TS2552`). Either dead code or a live `ReferenceError`.

→ `tsc --noEmit` clean is non-negotiable. A type error in a page component is a
production crash, not a style preference.

## 4. Any server route that writes must authenticate `[GATE]` `[VERIFIED]`

`src/app/api/upload/route.ts` accepts `POST` from anyone and writes into
`public/uploads/`. There is no auth anywhere in the app — `/admin` is a styling
wrapper with no gate at all.

→ A route that writes to disk, mutates data, or costs money authenticates
first. No exceptions for "it's only the admin page".

## 5. Never persist a caller-supplied filename or extension `[GATE]` `[VERIFIED]`

The upload route keeps the original extension and trusts `file.type`, which is
a client-declared header, not a sniffed signature. `evil.html` declared as
`image/png` is written as `<ts>-evil.html` and served from your own origin —
stored XSS, plus free malware hosting.

→ Generate the filename yourself. Derive the extension from a sniffed content
type against an allow-list. Serve user uploads from a separate origin or object
store, never from `public/`.

## 6. A client store is not server state `[GATE]` `[VERIFIED]`

`src/store/catalog.ts` persists the catalogue to `localStorage`. Admin edits are
per-browser: customers see `src/data/products.ts` and nothing else. The admin
panel looks functional and changes nothing anyone else can see.

→ Before shipping a UI that edits data, name where the write lands. If the
answer is `localStorage`, it is a preview, and it must say so.

## 7. Do not promise a capability the code does not have `[GATE]` `[VERIFIED]`

`src/app/faq/page.tsx` tells customers card payments, Apple Pay and Google Pay
are supported at checkout. Stripe is a dependency, but there is no checkout
route and no client call — the cart cannot take money.

→ Customer-facing copy is a claim about behaviour. When copy and code disagree,
that is a defect in one of them; decide which, and fix that one.

## 8. Review the diff, not the repository `[PROBE]`

Pre-existing problems the change did not touch are NOTE, marked "pre-existing".
A review that expands into unrelated refactors stops being read.

---

## Log

- **2026-08-20 · First gate run.** `verify.sh` on a clean checkout:
  4 typecheck errors, 26 lint errors, 3 warnings. Gates 1, 2, 3 seeded from the
  typecheck/lint output; gates 4, 5, 6, 7 from reading the upload route, the
  catalog store and the FAQ copy. No code changed in this pass.
