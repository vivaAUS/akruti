import { NextResponse } from "next/server";

/**
 * File upload — DISABLED pending a secure rebuild.
 *
 * What was wrong: this route accepted POST from anyone — there is no auth
 * anywhere in the app — kept the caller's file extension, and validated
 * `file.type`, which is a client-declared multipart header rather than a
 * sniffed signature. `evil.html` labelled `image/png` was written into
 * `public/uploads/` and then served from this origin: stored XSS against the
 * catalogue and cart in localStorage, plus open file hosting.
 *
 * Why it is disabled rather than patched: the hole may already have been used,
 * and closing a live write primitive should take minutes.
 *
 * Note on where uploaded files are served from, because it is easy to get
 * backwards. Next serves `public/` from a snapshot taken at server start, so a
 * file written at runtime 404s *until the process restarts* — and is served
 * normally from then on, with no rebuild required and no `nosniff` header.
 * Production is therefore not safer than dev, only delayed by one restart, and
 * restarts are routine. (On a read-only serverless filesystem the write fails
 * outright, but `package.json` still has `"start": "next start"`, so a
 * long-running Node process is a live possibility.) This is exactly why a
 * `NODE_ENV` guard was rejected: it would have been inert under `next dev`,
 * where such files are served immediately, and merely delayed elsewhere.
 *
 * Disabling does NOT reclaim bytes already written. `public/uploads/` is
 * gitignored, so anything sitting there is invisible to a diff and becomes
 * servable at the next restart. It must be listed and cleared on each deployed
 * instance before this is called closed.
 *
 * The replacement, tracked separately: require auth; sniff magic bytes instead
 * of trusting the declared type; generate the filename server-side; store
 * outside `public/` and serve it back through a GET handler that sets
 * Content-Type from the sniffed type plus `X-Content-Type-Options: nosniff`.
 * That closes it structurally, so the extension stops mattering at all.
 *
 * Admin image fields still accept a pasted URL, which is ImageRow's default.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "File upload is disabled while it is being rebuilt securely. " +
        "Paste an image URL instead.",
    },
    // 410 rather than 503: this is a deliberate removal pending a rebuild, not
    // a transient outage. 503 invites client retries and uptime-monitor pages.
    { status: 410 },
  );
}
