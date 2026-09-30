# 12 — The Editor's page names no policy

Status: needs-triage
Spec: ../spec.md
Blocked by: —
Found by: the fourth review in issue 10

## What

The public page runs under a Content-Security-Policy that names a nonce, so
an escaping regression in the Renderer is contained by the browser as well as
by the code (ADR-0013). The Editor's page has no such second boundary. It is
opened from `file://` or served as static files, and `editor/index.html`
names no policy in a `<meta>`, so whatever reaches its DOM as markup runs.

Two things this release put on that page make the gap worth closing:

- **A Document from somebody else now includes Diagrams.** Mermaid is about
  three megabytes of third-party code with a security history of its own,
  running with `securityLevel: 'strict'` and nothing else between a pasted
  source and the writer's browser. On the public page the same library runs
  under `default-src 'none'`.
- **The fourth review's one finding was an escaping miss in the Editor** — a
  caption written through `innerHTML` — and it ran, because nothing was there
  to stop it. The public page has had a policy for exactly that kind of miss
  since 0.1.3.

## Why it waits

Not a one-line fix. A `<meta http-equiv="Content-Security-Policy">` on a
`file://` page cannot use a per-request nonce — there is no request — so it
would name hashes or `'self'`, and the page as it stands has three things a
policy would have to accommodate or move:

- the inline `<script>` that reads the starter document out of
  `<script type="text/markdown">` into `window.STARTER`;
- the inline `onerror` on the preview's `<img>`, which the third review looked
  at and left as the one inline handler either half writes — `script-src`
  without `'unsafe-inline'` or `'unsafe-hashes'` refuses it, so the swap to the
  box would have to become a listener in `ui.js`;
- Mermaid's own drawing, which logs `style-src` reports on the public page
  and would log them here too; the placement already carries the styles, so
  the picture would still be right, but `style-src` has to allow the nonced
  `<style>` the placement makes — which on a `file://` page means a fixed
  nonce in the `<meta>`, or `'unsafe-inline'` for styles alone.

Then `img-src` has to stay open enough for an Image Line's src, which is the
Editor's one deliberate outbound request, and `connect-src 'none'` would be
the policy saying what the scan in `bin/test` says today.

Each is a decision about what the Editor promises, and the probe would have to
run under the policy to prove the writing loop still works. That is its own
issue, not a fix to make while reviewing.

## Acceptance

- [ ] `editor/index.html` names a policy in a `<meta>` that refuses inline
  script and any connection, and the probe runs green under it
- [ ] the starter's inline script and the preview's `onerror` are either
  named by the policy or gone
- [ ] `docs/security.md`'s Editor paragraph says what the policy is and what
  it is not
