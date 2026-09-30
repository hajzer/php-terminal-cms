# 08 — The Page Build: the page's own policy, and parity

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 06, 07

## What

A static host sends no header a site chooses, so a built page names its
Content-Security-Policy in a `<meta>` with one nonce per build (ADR-0017). And
the invariant that keeps two ways to publish from drifting becomes a test.

## Scope

- **One policy string**, defined once and read by both `site/public/index.php`
  and `bin/page-build`. The build uses it minus `frame-ancestors`, which a
  `<meta>` cannot carry.
- **One nonce** from `random_bytes(16)` per build, passed to `Page::html()`
  exactly as the request-time nonce is, so the inline script, the accent style
  block and a Diagram's placed stylesheet carry it.
- **The `<meta>` is the first element of `<head>`**, before anything it
  governs. The request-time page does not gain one — it has the header.
- **Parity.** For every sample address, the built file equals `Page::html()` of
  the routed request after normalising exactly three things: the Base Path on
  local addresses, the trailing slash on links, and the policy's carrier and
  nonce. Anything else that differs fails, naming the address.
- `docs/security.md` gains a section on the built site: what the `<meta>`
  carries, what it cannot (`frame-ancestors`), the nonce's lifetime and why it
  is enough there.

## Out

Headers files for particular hosts. Hashes.

## Acceptance

`php bin/test` covers, and passes:

- [ ] every built page's first `<head>` child is the `<meta>` policy, and its
  nonce is the one on that page's script and style
- [ ] two builds carry two different nonces
- [ ] the policy string exists once in the source, and the header and the
  `<meta>` are both derived from it
- [ ] parity holds for every sample address, including a Diagram's page and
  `404.html`
- [ ] a deliberately introduced difference in one page fails the parity check
  and names the address — tried once, noted in the comments, reverted

Then:

- [ ] a build with a Diagram served by `php -S` with no header of its own:
  drawn, styled, no CSP violation in the console — noted in the comments
- [ ] `php bin/test` green
