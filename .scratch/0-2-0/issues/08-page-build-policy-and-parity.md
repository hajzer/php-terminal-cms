# 08 — The Page Build: the page's own policy, and parity

Status: ready-for-human
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

- [x] every built page's first `<head>` child is the `<meta>` policy, and its
  nonce is the one on that page's script and style
- [x] two builds carry two different nonces
- [x] the policy string exists once in the source, and the header and the
  `<meta>` are both derived from it
- [x] parity holds for every sample address, including a Diagram's page and
  `404.html`
- [x] a deliberately introduced difference in one page fails the parity check
  and names the address — tried once, noted in the comments, reverted

Then:

- [ ] a build with a Diagram served by `php -S` with no header of its own:
  drawn, styled, no CSP violation in the console — noted in the comments
- [x] `php bin/test` green

## Comments

- 2026-09-30, agent: how it is built.
  - **`Policy`** (`site/src/Policy.php`) holds the directives, the only place
    `default-src` is spelled in the code. `forHeader($nonce)` is what
    `index.php` sends. `forMeta($nonce)` is the same list without
    `frame-ancestors`. `nonce()` is `random_bytes(16)` in base64, which both
    entry points call.
  - **`Page::html()`** gains `bool $ownPolicy = false`. When set, the page's
    first `<head>` element is
    `<meta http-equiv="Content-Security-Policy" content="…">` built from the
    nonce it is given, so the `<meta>` and the attributes cannot disagree. It
    throws if set without a nonce, because the page would refuse its own
    script. Unset, the page is byte for byte what it was: 07's ten pinned
    hashes and the fixed-shell hashes still pass.
  - **`bin/page-build`** makes one `Policy::nonce()` per build and passes it,
    with `ownPolicy: true`, to both `Page::html()` calls.
  - **`bin/test`**:
    - The policy's literal header and `<meta>` strings.
    - `default-src` counted across `site/src`, `index.php` and
      `bin/page-build`: once, in `Policy.php`.
    - The dev server's actual `Content-Security-Policy` header equals
      `Policy::forHeader()` of the nonce its page carries, and that page has
      no `<meta>` policy.
    - Every built page's first `<head>` element is the `<meta>`, which names
      the nonce on the page's `<script>` and `<style>`, the only two nonced
      tags. That nonce is the same across the build and differs between two
      builds.
  - **Parity** (`parity()` in `bin/test`) runs for the `/proj` build and the
    root build. It covers all ten sample addresses, the Diagram page and
    `404.html` included. The served page is rendered with the build's own
    nonce, so only the `<meta>` is taken out for the policy. On the built
    page, the Base Path is stripped from `href`, `src` and `data-mermaid`,
    and a local address *without* it is marked, so a forgotten prefix
    cannot pass. The trailing slash is stripped from links on both sides. The
    failure names the address, the line number and both lines.
  - A permanent test tampers with a copy of the build: one byte on
    `/about/what-it-is`, and one link on `/guides` without `/proj`. It
    requires parity to name exactly those two addresses.
- 2026-09-30, agent: the deliberate difference, tried once and reverted. I
  edited `bin/page-build` to write the `/guides` page with
  `<nav class="x">`. `php bin/test` failed with
  `/guides differs at line 17`, built `'  <nav class="x">…'` against served
  `'  <nav>…'`. No other page was named. I restored `bin/page-build` from a
  copy, and the suite was green again.
- 2026-09-30, agent: headless Chromium (Playwright chromium 1243), not the
  by-hand box. Built with `--base-url=http://127.0.0.1:8431/proj/` and served
  with a plain `php -S -t <parent>`, so no router and no header. Compared with
  the request-time site under `php -S … index.php`, which sends the header.
  The result on `/about/everything-is-a-line` was identical on both sides:
  - The response has no `Content-Security-Policy` header, and the `<meta>`
    policy is enforced. Violation events fire.
  - The SVG replaces the `<pre>`. The placed `<style>` carries the nonce, and
    a node's fill comes from it (`rgb(251, 249, 245)`).
  - The theme toggle redraws in the dark fill (`rgb(25, 28, 30)`). A second
    toggle puts the light fill back.
  - Requests: the page, `theme.css`, `site.css`, the logo and
    `mermaid.min.js`, all under `/proj/`.
  - **0 `script-src` violations.** The same 3 `style-src-elem` and 66
    `style-src-attr` reports as the request-time site with its header. These
    are the drawing reports 06 accepted. The `<meta>` adds none of its own,
    and nothing else was logged.
  - On the acceptance box's "no CSP violation in the console": I read it the
    way 06's human decision reworded the same line, as no `script-src`
    violation and only the drawing's `style-src` reports. The box is left for
    the by-hand check in a real browser.
- 2026-09-30, agent: after the two-axis review.
  - Changed:
    - parity now checks the Base Path strictly, on the built side only. It
      had been stripped from both sides, so a link the build forgot to prefix
      would have passed.
    - `docs/security.md` says the directives are spelled once "in the code".
    - The test passes `ownPolicy:` by name.
    - A comment in `bin/page-build` that repeated the header's is gone.
    - `Policy::write()` is now `spell()`, because it writes nothing.
  - Left as they are:
    - `HEADER_ONLY` filters the list rather than `forHeader()` appending the
      directive. The list reads as the whole policy.
    - The `<meta>` opening string is repeated in `bin/test`. Each use is a
      different assertion's expected value.
  - `docs/security.md`'s "under two thousand lines" for the entry point and
    `site/src` was already past 2000 before this issue (about 2060). It is
    now about 2125. That is for 11's words pass.
  - **Still to do by hand:** build with
    `php bin/page-build --output=dist/serve/proj --base-url=http://localhost:8080/proj/`,
    serve with `php -S localhost:8080 -t dist/serve`, and open
    `/proj/about/everything-is-a-line/` with the console open.
- 2026-09-30, human: the by-hand check. The `<meta>` read
  `content="default-src &#039;none&#039;; …"` in the page source. It was
  correct but hard to read. The console showed the expected `style-src-attr`
  reports from the drawing. Asked for a readable source.
- 2026-09-30, agent: the `<meta>` is now written unescaped. It reads
  `content="default-src 'none'; …"`.
  - Nothing in it comes from a writer. The directives are `Policy`'s
    constants, and `Page::html()` with `ownPolicy` now refuses any nonce that
    is not base64 (empty included).
  - `bin/test` checks three things:
    - the exact unescaped `<meta>`;
    - that the directives hold none of `"&<>`;
    - that six bad nonces are refused.
  - Headless Chromium on a fresh `/proj` build gave the same result as
    before: drawn, redrawn on toggle, no `script-src` report.

