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

## 0.2.0 — fourth review

A review of the surface this release adds and of nothing older, in the shape
of the three before it. The Dialect a Diagram is made of and the library that
draws one: its advisories at the pinned version, what `securityLevel:
'strict'` shuts, the placement that keeps the policy narrow, how a Diagram's
source reaches `render()`, what the Editor's network claim now covers, and the
one script `bin/test` does not scan. The paste, from the clipboard to a Line's
text. The Base Path — where it enters the Renderer, and what judges an Href
before it is prefixed. The Page Build's writes, which are the first time code
that renders the site writes a file rather than a response: the refusals, the
swap, the marker, symlinks on both sides of it, a relative output, and what an
interrupted run leaves. And the policy a built page names itself. The
request-time path and the Editor's older surface were re-read as context and
not re-audited. A code read ran beside the review over the same surface, for
correctness and drift rather than exposure: the three implementations over the
new Dialect, the raw face against `toMarkdown`, and the documentation against
the code.

No remote code execution, injection, request-forgery or origin-escape issue
was found on the public origin. One finding, in the Editor, fixed.

| # | severity | finding |
| --- | --- | --- |
| 1 | medium | The Editor's status line names the Line under the cursor, and names an Image Line by its caption — through `innerHTML`, unescaped, since 0.1.7. A caption is the writer's own text, and `![<img src=x onerror=…>](x.png)` in a file opened, or in markdown pasted, put an element on the page that ran; it was tried, and it ran. Every other place the Editor writes a Line's text is escaped, and the read pane escapes this same caption twice; the status line was the one it missed. This release is what made it reachable from the clipboard: a paste puts the cursor on the last Line it added, which is exactly where the status line looks, so the paste's own promise — that no pasted byte reaches the DOM except as a Line's text — is what it broke. The caption is escaped now, and the probe pastes one with markup in it and requires the status line to hold text. Nothing stood between that element and the browser, because the Editor's page names no policy of its own — which is issue 12. |

Also changed, as hardening rather than as findings:

- `bin/test` reads the first line of `shared/mermaid.min.js` and checks it
  rather than trusting it: the SHA-256 it names is the hash of every byte
  below it, the version it names is the one `docs/security.md` names, and the
  licence is beside it. An upgrade that replaces the file without the sentence,
  or the sentence without the file, fails the suite.
- The build refuses a Document whose file is named `.md` by name, as it already
  refused `..md`. Its address is the Category's own, and the build found that
  out only when the page landed on a file it had itself just written — and
  said so in the wrong words. `bin/test` builds with both names.
- ADR-0016 now records what 06 built and the ADR did not say: the library
  arrives by a `<script src>` the page's own script creates, carrying the
  nonce it read off its own tag — the one `<script src>` a page may run, and
  the exception to ADR-0013's rule that there is none.

And from the code read, fixed where found:

- `docs/deploy.md` counted the Editor at six static files. It has been eight
  since 0.1.9 shipped a logo and an icon beside it, and is nine with Mermaid.
- `docs/security.md` names the vendored version, which the spec asked for and
  nothing had written. The sentence is the one `bin/test` now reads.

And from the code read, handed to issue 11, which owns the words: `docs/security.md`
still says there is no third-party JavaScript and nothing with a CVE feed,
that the Editor makes one request, and that the site's PHP is under two
thousand lines — it is about 2,200; `docs/keymap.md` has no `w`, `^B 4`,
`:raw` or `:read`; the README, `docs/format.md` and `docs/line-types.md` say
nothing of a Diagram being drawn. 11 already lists most of these; the line
count is added to it here.

And from the review, deferred: the Editor's page carries no
Content-Security-Policy of its own, so a bug in its escaping — finding 1 —
or in the library it now runs is bounded by the browser alone. Not a one-line
fix: the page has an inline script and an inline `onerror` that a policy would
have to name or move, and a policy on a `file://` page is a `<meta>` with
hashes, not a header with a nonce. It is issue 12.

### Looked at and left alone

- **The pinned version.** Mermaid 11.17.2, the last release of 11. Fifteen
  advisories stand against the package; three, from 2021 and 2022, predate 11
  altogether, and each of the twelve since is fixed at 11.16.1 or earlier: the
  two label XSS of August 2025 (CVE-2025-54880, -54881) at
  11.10.0; the four of May 2026 — `classDef` CSS injection, state-diagram
  `classDef` HTML injection, a Gantt infinite loop, configuration CSS
  injection (CVE-2026-41148, -41149, -41150, -41159) — at 11.15.0; the five of
  August 2026 — an XY-chart loop, a radar DoS, two prototype pollutions, CSS
  reaching sibling elements (CVE-2026-71436, -71439, -71438, -71437, -50159)
  — at 11.16.1; and the bundled-DOMPurify pollution at 10.9.3, which 11 never
  carried. OSV answers nothing for 11.17.2 on the day of this review. 12.0.0
  exists, published 2026-09-10, and is not taken: it is a major with no patch
  release behind it yet.
- **`securityLevel: 'strict'`.** What it shuts: `click` callbacks — a function
  named in the source is never bound; HTML in labels — each label goes through
  DOMPurify with `<style>` forbidden, and the whole SVG goes through DOMPurify
  again before `render()` returns it, with `foreignObject` and the
  `dominant-baseline` attribute allowed and nothing else added; and a `click`
  link's URL is sanitised. `securityLevel` is one of six keys in the library's
  own `secure` list — with `secure` itself, `startOnLoad`, `maxTextSize`,
  `maxEdges` and `suppressErrorRendering` — that an `%%{init}%%`
  directive in a Diagram's source cannot set, so a source cannot loosen the
  level it is drawn under. What strict does not shut: `click X "https://…"`
  still makes an `<a>` in the picture, judged by Mermaid's URL sanitiser and
  never by the Href allowlist — `javascript:` and `data:` refused; `http`,
  `https`, `mailto` and a protocol-relative `//host` allowed. A Diagram is the
  author's, as a Line's Href is, and GitHub draws the same link from the same
  file; it is under residual risks as the one link on a page the allowlist
  does not judge.
- **What the library reaches for.** Read once by hand, since the scan does
  not read it. No `fetch(` call of its own — the twenty-eight are a KaTeX
  tokenizer's method — and no `XMLHttpRequest`, `WebSocket`, `EventSource`,
  `sendBeacon`, `importScripts`, `Worker` or dynamic `import(`. `new Image`
  twice, and both load what a source names: a flowchart node drawn in the
  `img` shape is measured by loading its URL, and the graph library behind
  mindmaps caches a node's background image the same way — requests the
  Diagram chose, which `img-src 'self'` refuses on the public page and nothing
  refuses in the Editor. `iframe` only for the `sandbox` level, which is not
  used. Icon packs load through a loader an application registers, and this
  one registers none. `window.location` is read for absolute marker URLs,
  which are off by default. `@import` is a token in its CSS parser, and
  `Function("return this")` is lodash finding the global object. On the public
  page all of that is bounded by the policy in any case; in the Editor it is
  bounded by this reading, until issue 12.
- **The placement.** Read side by side in `editor/ui.js` and
  `Page::DRAWING`. `render()` returns a string. `DOMParser` parses it as
  `text/html` in an inert document, where a `<script>` is marked as already
  started and never runs, even once imported. Every `<style>` is lifted into
  one `<style>` made with the page's nonce; every `style` attribute is taken
  off before `importNode` and written back through `cssText` once the SVG is
  in the page — the CSSOM, which the policy permits, and not markup, which it
  refuses. The library itself arrives by a `<script>` the page's script
  creates, with its `nonce` set from `document.currentScript.nonce` — so the
  two things the drawing adds to the page, that script and the one `<style>`,
  both carry the nonce, and `bin/test` requires the page's script never to
  hold the nonce in its text. The probe watches the read pane with a `MutationObserver` and
  requires every `style` attribute on a drawn SVG to have been written from
  none; the by-hand checks require a node's fill to come from the placed
  stylesheet. The two copies differ where 06 said they would — the page keeps
  no cache and prints no error — and `bin/test` does not compare them; a
  drift between them fails the probe or the by-hand check, not the suite.
- **The source as text.** `pre.textContent` on both sides: the `<pre>` the
  Renderer or `renderDoc` wrote from escaped, highlighted spans, read back as
  the text it was, and `render(id, src)` takes a string. Only Mermaid's
  *output* is ever parsed as markup, and only in the inert document above.
  `hasDiagram()` matches the Renderer's own tags and nothing a writer's text
  can produce, the drawing code finds Diagrams the same way, and `bin/test`
  renders a page that spells the tags out and gets no drawing.
- **The CSS a Diagram brings.** `classDef` and `style` statements in the
  source become declarations in Mermaid's stylesheet and `style` attributes,
  and both are carried into the nonced `<style>` and the CSSOM by design — on
  a page with a Diagram, the source's CSS runs under the nonce. What CSS can do
  there is bounded by the policy — `img-src 'self'` for a `url()`,
  `default-src 'none'` for a font, `style-src` for an `@import` — and by the
  author already owning the page. In the Editor there is no policy, and a
  `url()` in a pasted Diagram's `classDef` is a request from the writer's
  browser, as an Image Line's src is; the residual risk below says so.
- **The Editor's network claim.** `ui.js`'s header, CONTEXT.md's **Editor**
  entry and the scan's comment in `bin/test` say the same thing: the Document
  goes nowhere; the page fetches an image a Line names and, once there is a
  Diagram, its own copy of Mermaid from beside `ui.js` — `document.currentScript.src`,
  so the probe loads the Editor's copy without a rewrite. Checked in headless
  Chromium: with a Diagram pasted, every request is a `file://` beside the
  page, and one of them is `editor/mermaid.min.js`.
- **The paste.** The document-level `paste` listener acts only when nothing
  is being typed — no open Line, the command line hidden, the Name not open —
  no overlay is on, and the focus is not on the Name; the probe tests each
  guard in turn. It reads `text/plain` and nothing else, through
  `parse()`, which is the reader *Open .md* uses, and every byte that arrives
  becomes a Line's `text`, an Image Line's caption, or a Meta Line, which reach
  the DOM through `esc()`, the highlighter, `renderDoc()` and `textContent`.
  Finding 1 was the one place that was not so. `:paste` reads the Clipboard
  API and asks the same question again when the clipboard answers, so a Line
  opened in the meantime is left alone. A pasted `title:` moves the Name only
  through `slug()`, and the download's name with it.
- **The Base Path.** A `BasePath` value, validated in its constructor — one
  or more segments, none `.` or `..`, none holding a backslash, whitespace, a
  control character, `?` or `#` — given a value in exactly two places:
  `index.php` with `''` and no slash, and `bin/page-build` from
  `--base-url`'s path; every other construction is the default, an empty
  path, which is the request-time site's.
  Nothing reads `$_SERVER` for it, nothing reads Site Config for it, and
  `bin/test` requires a `site.php` naming `base`, `base_path` or `base_url` to
  change nothing. In the Renderer it enters `inline()` and `render()` as a
  parameter; `safeHref()` judges the Href as written, and `local()` prefixes
  only afterwards, and only an Href that starts with `/` and not `//` — which
  the allowlist has already refused. Every write of a local address goes
  through `e()`, so a Base Path with a quote in it (`--base-url='https://h/a"b'`
  was tried) is escaped where it lands, and it never reaches the `<meta>`
  policy, which carries directives and a base64 nonce and nothing else.
- **The build's refusals.** By the suite and again by hand: an output that
  is or holds the repository root, `site/` or `content/`, or is inside
  `site/` — inside the repository root is allowed, which is where `dist/`
  is; a symlink
  at `--output` pointing at `content/`, resolved through `realpath` and refused
  as `content/`; a non-empty directory with no marker; a file; a marked output
  that holds `site/` or `content/`; a misspelled or repeated flag; a Base Path
  that is not one. Each leaves the filesystem as it found it, the directory
  beside the output included. A relative `--output`, from another directory
  and with `./` and `..` in it, builds where it says and replaces its own
  earlier build.
- **Symlinks.** Under the output, `remove()` unlinks a link and never
  descends: a marked output holding a link to a directory with a file in it
  was replaced, and the file survived. Under `site/public/`, the copy follows
  a link as a web server serves one — a link to a directory outside `public/`
  publishes it, which 07 recorded and which stands; a link that leads back
  into a directory being copied is refused as a cycle; a dangling link fails
  the build by name. Under `content/`, the build reads what the request-time
  site reads, links included, and both are the author's own directory.
- **The swap.** The marker is written last, into the fresh directory. The
  old output is moved aside, the fresh one renamed in, and the old one removed
  only then. A failure of the second rename puts the old one back; a failure
  of both exits from inside the `try`, naming where the old build is, and
  leaves the fresh directory beside it. A process killed between the two
  renames leaves both under their hidden names and nothing at the output; the
  next run builds afresh, and the two stay until removed by hand. Availability
  on the author's own machine, recorded under residual risks.
- **The marker.** A file whose presence lets a directory be replaced, and
  whose text says so. It is not a secret and need not be: what it guards
  against is a mistyped `--output`, not an adversary with write access to the
  author's disk, who needs no build to do harm with it.
- **The built policy.** The `<meta>` is the first element of `<head>`, so
  everything the policy governs comes after it; it is written unescaped
  because nothing in it comes from a writer, and `Page::html()` refuses a
  nonce that is not base64. It is the header's policy directive for directive
  but `frame-ancestors`, which a `<meta>` cannot carry — nor can it carry
  `X-Content-Type-Options`, `Referrer-Policy` or `Permissions-Policy`, which
  are a host's to send. Of those, the one that shaped a request —
  `strict-origin-when-cross-origin` — is what every current browser does with
  no header at all. One nonce per build, public in every page: it is fresh per
  build, so a `nonce="…"` written into content before the build cannot name
  it, which is the whole of what a nonce is for. A built page can be framed,
  and has nothing on it that acts on a reader's behalf.
- **The three implementations over the Dialect.** `mermaid` is in
  `shared/langs.json` and in `TYPES`' Code Dialects, the tokenizers agree on
  it — `bin/test` compares them on samples — a Diagram in the sample content
  round-trips, and both renderers emit the same `<pre>` for it. The raw face
  is `toMarkdown(doc.lines)`, the export's own function and not a second one,
  and the probe holds it to an edit.

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
- The Editor's preview turns whatever an Image Line names into an `<img src>`
  for the browser to fetch, and hands a Diagram's source to Mermaid to draw —
  and a Diagram can name a picture of its own, in a node's `img` shape or a
  `url()` in a `classDef`, which the browser fetches as it fetches the Image
  Line's src. It is the writer's own browser and the writer's own Lines, and
  the request carries no referrer — but it is a request, and a library is a
  library. A file opened from somebody else, or markdown pasted from them, is
  one whose Image Lines and Diagrams somebody else wrote, and the Editor's page
  names no policy of its own to stand between those and the browser. The
  Document is the only thing in the tab.
- A Diagram may carry a `click` link, which Mermaid judges and the Href
  allowlist never sees: `javascript:` and `data:` refused, and a
  protocol-relative `//host` allowed that a Line's Href would not be.
- Mermaid is the one file on the origin with a CVE feed. Upgrading it is part
  of a release, and `bin/test` fails an upgrade that forgets to say so.
- A built page can be framed: a `<meta>` cannot say `frame-ancestors`. It
  carries none of the three other headers the entry point sends either. A host
  that can send headers should.
- A Page Build killed between moving the old output aside and the new one in
  leaves both under hidden names beside the output, and nothing at the output,
  until the next build or a hand removes them. `site/public/` is copied
  following symlinks, as a web server serves them.
- The editor holds the document in the browser tab and nowhere else. Anything
  that navigates the tab away loses it: a link clicked in the preview, or a URL
  dropped on the page, does today. Export before either.

## Validation

`php bin/build` and `php bin/test` clean at every release: 212 assertions at
0.1.3, 248 at 0.1.4 and, 0.1.5 having changed no behaviour, still 248 there;
256 at 0.1.6, 306 at 0.1.7, 477 at 0.1.8, 548 at 0.1.9 and 835 at 0.2.0 —
721 when the fourth review was written, the rest arriving with the Themes and
the Editor's policy after it.

`tests/editor-probe.html` drives the editor's DOM half through a real browser
and is the one check the suite cannot run. At 0.1.9 it was 172 assertions, run
green in Firefox for the third review. At 0.2.0 it is 292, run green in
headless Chromium and headless Firefox at the release; it was 248, green in
both, for the fourth review — the maintainer's first run
in Firefox found the probe's synthetic paste empty there, which was the probe's
own clipboard stand-in and not the Editor, and the probe now pastes the same
way in both — beside a scripted re-run of the by-hand checks
of issues 05 to 08 — the Editor from `file://`, the site with its header, and
a Page Build under `/proj` and at the root with the `<meta>` — 31 checks, all
green; the maintainer's own run in a real browser is what the release waits
for.
