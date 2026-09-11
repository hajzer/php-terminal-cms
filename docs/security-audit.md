# Security reviews

One section per review: its scope, its findings, and what changed. A reviewed
surface is not a guaranteed one, and the residual requirements are at the foot
of this file.

[security.md](security.md) states the model — what exists, what does not, and
where the boundaries are. This file is the record of checking it.

## Scope, the first two reviews

The public origin in full: the entry point, the router, the markdown parser, the
line renderer, the highlighter, the page shell and the response headers. Around
the edges: the static editor, `site.php` handling, the packaging and test
scripts, and the deployment instructions. The third review states its own scope
below: what changed after the second.

There is no database, no login, no session, no cookie, no form, no upload, no
POST route and no third-party runtime dependency, so there is nothing to review
under those headings. What a public request can cause is the reading of one
markdown file from one declared category and the writing of HTML.

## 0.1.3 — first review

A medium-depth review. No remote code execution, injection, authentication
bypass, deserialization or request-forgery issue was found. Four findings were
fixed.

| # | severity | finding |
| --- | --- | --- |
| 1 | medium | `script-src 'unsafe-inline'` gave the inline enhancement script the weakest possible containment: an escaping regression would have had no second line of defence. Replaced with a per-request nonce, on the script and on the accent style block, plus a `Permissions-Policy` header. |
| 2 | medium | The link and image allowlists accepted any target starting with `/`, which includes `//example.com` — a protocol-relative URL that browsers treat as another origin. Refused, along with traversal, backslashes and control characters. |
| 3 | low–medium | The configured accent colour was HTML-escaped and then written into a CSS custom property. HTML escaping is not CSS validation. It must be six hex digits. |
| 4 | low | The category list is trusted local config, but a malformed entry could reach path construction. Category slugs are validated where they are read. |

## 0.1.4 — second review

A review of the four fixes above and of everything they touched, plus a second
pass over the whole public path. Three findings, two of them in the previous
release's own changes.

| # | severity | finding |
| --- | --- | --- |
| 1 | medium | The 0.1.3 nonce fix turned the enhancement script's nowdoc into a heredoc, so PHP now read the JavaScript: `$` starts a variable and `\` starts an escape. The script as written happened to contain neither, so the bug was latent — the next regular expression added to it would have shipped mangled, or would have interpolated something. Reverted to a nowdoc with the nonce concatenated. |
| 2 | medium | The 0.1.3 link hardening was applied to the PHP renderer and not to `editor/editor.js`, so the editor still previewed `//evil.example` as a link. The editor's whole claim is that its preview is what the site will send, and the existing agreement test compared only block sequences, so nothing caught it. Both halves now share the allowlist, both decode the entities in a target before judging it, and `bin/test` compares their output character for character over one list of cases. |
| 3 | low | Availability, not exposure: 0.1.3 required a request slug to match `^[a-z0-9][a-z0-9_-]*$`, which is narrower than what a file name can be. `Release-1.2.md` was listed on its category page and then 404ed. The rule was removed from the slug — the equality comparison against `scandir()` is the boundary, and a shape rule cannot add to it — and kept on the category, which is the part that becomes a directory name. |

Also changed, as hardening rather than as findings:

- Site Config is read in one place, `TerminalCms\Site`, instead of the same
  three shape checks written out in the router, the page shell and the listings.
- A media path containing a backslash reduces to the file it names.
- A fragment target must be `#name`, and a `mailto:` target must have an address.
- `bin/test` scans `site/public/index.php` for the calls it already forbade in
  `site/src/`, and gained 36 assertions: the link allowlist, the agreement
  between the two halves of it, the nonce on both inline points, the accent
  fallback, malformed category entries, a file name no slug rule predicts, and
  the release manifest.
- What a release archive contains is one list, `bin/manifest.php`, and
  `bin/test` fails if a tracked file has fallen off it. The list is the
  boundary between what is published and what is not, so it should not be
  three lists in two scripts and a habit.

### Looked at and left alone

- **`Highlighter`** compiles its patterns from `shared/langs.json`. That file
  ships with the code and is not reachable from a request; a bad pattern edited
  into it is a broken install, not an exposure.
- **Catastrophic backtracking** in the inline and highlighter patterns is
  bounded by the author's own file: `content/` is written by whoever deploys the
  site, and they can already publish anything.
- **The `cli-server` branch in `index.php`** resolves and contains the path it
  serves, and only runs under `php -S`. Apache and nginx never reach it.
- **`random_bytes()`** throwing on a system with no entropy source would be a
  500, not a page without a nonce.

## 0.1.9 — third review

A review of everything under `site/` and `editor/` that differs from 0.1.4,
which is 0.1.6, 0.1.7, 0.1.8 and this release in full: the Language suffix
reaching the Router, and the Listing grouping files by base name; `listing_max`,
`link_open`, `logo` and `favicon` reaching the page from `site.php`; the address
overlay, and the href allowlist's second reader in it; the image preview, which
is the Editor's one outbound request; the Cell and Column rewrites and the Table
strip that drives them; the control treatment in `shared/theme.css` and its two
generated copies; the write pane's measure; the assets the archive now ships and
the manifest line for `docs/media/`; and `bin/build`'s repathing, by shape now
rather than by list. The four things 0.1.8's own closing note asked a fresh
audit to look at — the Editor's first outbound request, `logo` through the
media-path reduction, `target="_blank"` beside the `rel` that was already
there, and the allowlist's second reader — are the four the middle of that
list is. The public path's shape was re-read as context and not re-audited. A
deep code read ran beside the review over the same surface, for
correctness and drift rather than exposure; its findings are fixes below, and
one issue, not a second document.

No remote code execution, injection, request-forgery or origin-escape issue was
found. Two findings, both fixed.

| # | severity | finding |
| --- | --- | --- |
| 1 | low | Identity, not exposure: a file whose name ends in the site's own language — `hello-en.md` on a site whose `lang` is `en` — answered at `/hello-en` as well as at `/hello`. ADR-0014 and `docs/config.md` say one Document has one address per Language and no others, and the Listing printed only the bare one, so the same page stood at two addresses and one of them was linked from nowhere. The Router now refuses a suffix that is the site's own language: the file answers at the bare address and there alone. |
| 2 | low | The address overlay's warning judged the href as typed, while the Line is written with the href cut down to what the syntax holds — no whitespace, no closing paren. The two readers of one allowlist disagreed, in one direction: `https://example.com/a b` was marked as a link the page would refuse, and the page then made a link of `https://example.com/ab`. No href the page refuses was ever shown as one it would make, which is the direction 0.1.4's finding ran in. The overlay now judges the href it will write, and `tests/js-model.js` holds it to that. |

Also changed, as hardening rather than as findings:

- A `lang` or an `accent` that is not a string is its default and raises no
  warning, as a malformed category entry already did not.
- The Editor's page names `no-referrer`, so the one request it causes carries
  the src the Line names and nothing about where the Editor was opened from.
- The scan that says the Editor opens no connection names the constructors
  that open one — `Image`, `Worker`, `serviceWorker`, `importScripts`,
  `RTCPeerConnection`, `WebTransport` — and `window.open`, beside the six calls
  it named. Setting `location` and clicking an anchor are navigations, and the
  export overlay clicks an anchor to hand over a download, so neither is on the
  list; the comment where the scan lives says so.

And from the code read, fixed where found:

- A relative media path that climbs — `../x.png` — is a name under `/media/`,
  as `docs/config.md` and this file both said it was. It reduced to `/x.png`:
  a local absolute path, on the allowlist either way, but not the file the rule
  says it names, because every leading dot came off before the path was judged.
  The reduction is 0.1.4's code and was not re-audited; this is the one place
  the code read found it and its three descriptions apart, and the code is what
  moved. Only a leading `./` comes off now, and `bin/test` reduces seven shapes
  of relative path, with the absolute one beside them.
- An image's src and caption written from the overlay are cut down to what
  `![caption](src)` can hold, as a link's two halves already were. A `)` in the
  src or a `]` in the caption exported a Line that read back as a Paragraph, on
  the site and in the Editor alike. `tests/js-model.js` and the probe hold it.
- A line break in an open edit box commits as one character, not as one space
  for a run of them, so the offset `^K` reads off the box is the offset in the
  Line the link lands in. Two `Shift+Enter`s before the caret put the link one
  character early. The probe holds it.
- `docs/security.md` counted the site's PHP at about thirteen hundred lines. It
  has been about eighteen hundred since 0.1.7; the count is now a bound. The
  same file now names `logo` and `favicon` as two more paths that take the
  media-path reduction, which it did not.

And from the code read, deferred: a link clicked in the read pane, or a URL
dropped on the page outside the edit box, does what the browser does with
either and navigates the tab away from the document — which is held in that
tab and nowhere else. Not exposure, and not a one-line fix: whether the answer
is a `beforeunload` guard, preview links that open elsewhere, or a drop that is
refused is a decision about what the preview is. It is issue 12.

### Looked at and left alone

- **The Language suffix and the slug.** `Language::split()` compares the tail
  of the slug for equality with each declared code and does nothing else, and a
  code is validated by shape where it is read, so `../` cannot be declared as
  one. The 0.1.4 decision stands: the slug has no shape rule, and the equality
  comparison with `scandir()` is still the boundary — a suffix is read off the
  request and the base is compared with real names; no file name is built from
  either.
- **The Listing grouping by base name.** A file whose name ends in a declared
  code with no bare file beside it is one entry, in that language, with no
  indicator. Two files claiming one language are one entry at the bare address,
  and after finding 1 the Router agrees. A file called `.md`, or `-sk.md`, is a
  Document with an odd name and nothing more.
- **`link_open`.** `target="_blank"` is emitted only where
  `rel="noopener noreferrer"` already was: a target naming `http` or `https`,
  after the allowlist has passed it. The scheme is the right test — the site is
  never told its own name, and a `mailto:` or a fragment in a new tab is a
  blank tab. Any value but `'tab'` is `'here'`. The Editor is never told the
  setting, so `bin/test` compares the two halves on the default rendering; the
  `'tab'` rendering has no second implementation to drift from.
- **`listing_max`.** It reaches one `array_slice()` as an `int` of at least
  one or as `null`, and nothing else reaches it.
- **`logo` and `favicon`.** Two config strings become two attributes, an
  `<img src>` and a `<link rel="icon" href>`, through the one media-path
  reduction and then `e()`; the icon's `type` comes from a fixed table keyed on
  the extension. One rule for both is right, not two jobs in one hat: the rule
  is about what a configured path may address — this origin, by an absolute
  path or a name under `/media/` — and both want exactly that. `img-src 'self'`
  would refuse another origin for the logo in any case; the reduction is what
  makes it a picture instead of a broken one. A query string on either is
  dropped by the same rule, so a cache-busting `?v=2` is not expressible: that
  is the rule as documented, not a hole in it.
- **The Editor's one request.** The three descriptions — `ui.js`'s header,
  CONTEXT.md's **Editor** entry and the Editor paragraph in `docs/security.md`
  — were checked against the code and against each other, and say the same
  true thing: the read pane writes `<img src>` from the Line's text, escaped,
  with a fixed `onerror` that swaps in the box; neither script opens a
  connection, the two stylesheets carry no `url()` and no `@import`, and the
  page's own assets are relative paths beside it. What the request carries is
  the browser's — its cookies for that host, its user agent — and no referrer.
  The src is shown as written rather than reduced as the site reduces it, which
  `docs/security.md` already says: the preview shows the writer the picture
  they named, and the site shows the reader the file under `/media/`.
- **Cell and Column rewrites.** A Column operation rewrites every Line of the
  Run through `cells()` and `joinCells()`, which trim each Cell and put one
  space either side of each pipe — the normalisation both parsers apply on the
  way in. An unusual Cell is a trimmed Cell: a pipe cannot be inside one, a
  line break never reaches one, and one that is empty stays a Cell. The number
  a Column is named by is judged as the writer typed it before anything is
  rewritten, and `tests/js-model.js` holds each refusal to leaving the Run
  byte-identical.
- **The control treatment.** Custom properties and rules in
  `shared/theme.css`, copied byte for byte into both halves by `bin/build`;
  `bin/test` fails if either copy drifts. No `url()`, no `@import`, no font.
- **The write pane's measure.** One token in two forms for two font bases; the
  probe measures the computed width. Nothing here reaches a request or a file.
- **The assets.** `favicon.ico` is one ICO of three PNG frames — 16, 32 and
  48 — and `logo.png` one PNG, byte-identical between the Editor and the site;
  `docs/media/logo.png` is the same mark beside the wordmark, one PNG, which
  only the README shows. The diagram is an SVG with one internal `url(#tip)`
  marker, a `<style>` of its own holding two `prefers-color-scheme` queries
  and no `@import`, and no script, no external reference and no
  `foreignObject`; the
  example site serves a copy of it from `site/public/media/`, which
  `bin/build` writes from `docs/media/` and `bin/test` compares, the way the
  two copies of `theme.css` are kept. `bin/package` copies directories with
  `cp -r` and files with `copy()`, both binary-safe, and `bin/test` fails if a
  tracked file is not named by the manifest — which is what covers
  `docs/media/`.
- **`bin/build`'s repathing.** It rewrites the `href` and `src` values that
  carry no scheme and no fragment and do not start with `/`, and appends the
  probe's own script after the rewrite. On the page as it stands that is seven
  assets and nothing else; the starter document and the help overlay carry no
  such attribute. An asset the rewrite misses, or a value it rewrites that is
  not a file, fails `bin/test`'s check that every asset the probe names exists,
  which is the check the hand-written list could not have.
- **The `onerror` on the preview's `<img>`.** The one inline handler either
  half writes: a fixed string, on the Editor's own page, with no reader, no
  server and no second origin for it to be a vector against. The site's
  Renderer writes none, and `bin/test` fails if one appears.

## Residual risks

- This is not impenetrable and does not claim to be. It is a small surface.
- Keep PHP and the web server patched. There is nothing else to track.
- Serve only `site/public` as the document root. `content/`, `src/`, `site.php`
  and the project tooling must sit above it.
- No directory needs to be writable by the web user.
- TLS and HSTS belong in the vhost or the reverse proxy, not in the application.
- `site/site.php` is trusted administrator-controlled configuration. It is read
  defensively so a mistake in it cannot become a path or a stylesheet, but it is
  PHP: whoever can edit it can run code.
- Turn `display_errors` off in production, and `expose_php` with it. A stack
  trace is not a vulnerability; it is reconnaissance.
- Adding a server-side editor or a save endpoint puts authentication, CSRF, path
  validation and authorization back on the table, and none of this review would
  carry over.
- The editor's preview turns whatever an image line names into an `<img src>`
  for the browser to fetch. It is the writer's own browser and the writer's own
  line, and the request carries no referrer — but it is a request, and a file
  opened from somebody else is a file whose image lines somebody else wrote.
- The editor holds the document in the browser tab and nowhere else. Anything
  that navigates the tab away loses it: a link clicked in the preview, or a URL
  dropped on the page, does today. Export before either.

## Validation

`php bin/build` and `php bin/test` clean at every release: 212 assertions at
0.1.3, 248 at 0.1.4 and, 0.1.5 having changed no behaviour, still 248 there;
256 at 0.1.6, 306 at 0.1.7, 477 at 0.1.8 and 548 at 0.1.9.

`tests/editor-probe.html` drives the editor's DOM half through a real browser
and is the one check the suite cannot run. At 0.1.9 it is 172 assertions, run
green in Firefox for the third review.
