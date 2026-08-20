import { NextResponse } from "next/server";

/**
 * File upload — DISABLED.
 *
 * This route previously accepted POST from anyone, with no authentication
 * anywhere in the app, and wrote the bytes into `public/uploads/`. Two things
 * made that dangerous rather than merely untidy:
 *
 *   1. It kept the caller's file extension, and validated `file.type` — a
 *      client-declared multipart header, not a sniffed signature. `evil.html`
 *      labelled `image/png` was written as `<ts>-evil.html` and then served
 *      from this origin. That is stored XSS, plus free file hosting.
 *   2. Writing into `public/` is not viable in production anyway: Next
 *      snapshots that directory once at server start, so new files 404 until a
 *      restart, and on a read-only serverless filesystem the write just fails.
 *      `.gitignore` has said "migrate to object storage before prod" all along.
 *
 * Gating on NODE_ENV was considered and rejected: it is inert under
 * `next dev`, which is precisely where uploaded files ARE served immediately,
 * so the guard would have been silent in the one setup where the hole is live.
 *
 * The replacement, tracked separately: require auth; sniff magic bytes instead
 * of trusting the declared type; generate the filename server-side; write
 * outside `public/` and serve it back through a GET handler that sets the
 * Content-Type from the sniffed type plus `X-Content-Type-Options: nosniff`.
 * That closes it structurally, so the extension stops mattering at all.
 *
 * Meanwhile the admin image fields still accept a pasted URL, which is how
 * ImageRow already defaults to behaving.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "File upload is disabled while it is being rebuilt securely. " +
        "Paste an image URL instead.",
    },
    { status: 503 },
  );
}
