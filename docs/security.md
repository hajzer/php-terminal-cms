# Security model

What a public deployment exposes, what it does not, and where the boundaries
are.

## What is reachable from the internet

On the public origin: Apache (or nginx), the PHP runtime, one entry point of
seventy lines and the renderer, router, listing and page shell in `site/src/`
— under two thousand lines in all. That is the whole of it — there is no other
code, and none of it is somebody else's.

## What does not exist

No database. No login, session, cookie or token. No form, no upload, no POST
route — the site handles `GET` and has no code path that writes anything. No
third-party library in the PHP: no Parsedown, no framework, no composer
dependency. One third-party file on the origin with a CVE feed to track —
Mermaid, vendored and pinned, which only a page with a Diagram loads (see
*The one script on the page*). No CDN request, no external font. The one inline script on a
published page adds a copy button, a Palette toggle and a text-size control; it
reads and writes two `localStorage` keys and touches nothing else, and it runs
under a per-request nonce rather than `unsafe-inline`.

The editor has no server component at all, so it has no endpoints to attack. It
cannot write to `content/`, which means **a compromise of the web tier cannot
alter published content** — publishing requires credentials to the transport
(SSH, git), which the software never handles.

The editor never sends a document anywhere: it holds one in the browser tab and
emits it by download. It does make one request on the author's behalf.
Previewing an image line shows the actual picture, so the browser fetches
whatever that line names as its src — an author who writes an `https://` src is
telling their own browser to contact that host, and that host learns a request
was made from that browser. It learns nothing else the page could have kept
back: the editor's page names `no-referrer`, so where the editor was opened
from does not travel with the request. Any other src is resolved against
wherever the editor page itself was opened from — for a page opened off the
filesystem, that is the filesystem. An image that does not load falls back to
the box with the file name in it, silently. The document is no part of any of
this and still goes nowhere.

That is checked, not asserted. The `source` section of `bin/test` — the one that
scans the site's PHP for the calls that reach the system — reads
`editor/editor.js` and `editor/ui.js` for the ways a page opens a connection:
`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, a dynamic
`import`, the constructors that open one and `window.open`. The editor names
none of them, and a change that added one would fail the suite naming the file
and the call. The scan says the editor initiates no request; the picture that
loads is the browser acting on the `<img>` the editor wrote, which no scan of
the source can see and the paragraph above is what says. The same section checks
that the page names `no-referrer`.

The editor's page also names a policy, in a `<meta>`, so that markup reaching
its DOM by an escaping miss cannot run:

```output
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; script-src 'self'; style-src 'self';
               img-src 'self' https: http: data:; connect-src 'none';
               base-uri 'none'; form-action 'none'; object-src 'none'">
```

Script runs only from the editor's own files beside the page — `'self'`,
which matches a page opened from the filesystem as well as one served — and
nothing inline: not an `<script>` element, not an `on…=` attribute. The page
carries none. The starter document sits in an inert
`<script type="text/markdown">` that `ui.js` reads, and an image that does not
load is swapped for its box by a listener `ui.js` attaches. Stylesheets come
only from the files the page links. A Diagram's stylesheet is a constructed
`CSSStyleSheet` the document adopts, which no `style-src` governs, and
Mermaid's per-element styles are written back through the CSSOM, as on a
published page. `connect-src 'none'` makes the browser refuse what the source
scan says the editor never does.

What it is not:

- **Not a nonce.** A `file://` page has no request to make one for, and a
  nonce the page printed is one injected markup could copy. The policy names
  no nonce and no hash.
- **Not a fence around the editor's own files.** `'self'` on a page opened
  from the filesystem may match any local file, so injected markup that named
  a script already on the disk could load it. On an editor served over HTTP,
  `'self'` is that origin.
- **The same on every copy.** It is part of `editor/index.html`, not made per
  load; anyone can read it, and nothing about it is secret.
- **Not a stop on the image request.** `img-src` allows any `http:`, `https:`
  or `data:` src, because showing the picture an Image Line names is the
  editor's one deliberate outbound request. Markup injected into the page could
  make the same kind of request.
- **Not quiet.** Mermaid measures each drawing in a scratch element with inline
  styles, which the policy refuses; Chromium reports each one as a
  `style-src-attr` violation. The picture is right because the placement
  carries the styles.

`bin/test` fails if the `<meta>` is removed, if any directive names
`'unsafe-inline'`, `'unsafe-eval'`, `'unsafe-hashes'`, a nonce or a hash, if
`connect-src` is anything but `'none'`, or if the page or the read pane's
markup carries an inline script or an event-handler attribute. The browser
probe runs under the same policy, since it is the same page, and fails if the
policy refused any script or stylesheet during the run
([ADR-0020](adr/0020-the-editor-names-a-policy-without-a-nonce.md)).

## The renderer

`Renderer.php` never passes file bytes into its output. It matches a line to a
known type and emits tags it chose itself, with the text escaped by the single
`e()` helper. Raw HTML in a document is not sanitised, it is **unrepresentable**
— there is no code path from file content to unescaped markup
([ADR-0003](adr/0003-own-renderer.md)).

Link targets are rebuilt from an allowlist: `http://`, `https://`, `mailto:` to
an address, a local absolute path, a fragment. Everything else renders as plain
text — `javascript:` and `data:` because they are not on the list, and four
shapes that look local and are not:

| written | why it is not a link |
| --- | --- |
| `//evil.example` | a protocol-relative URL: another origin in disguise |
| `/../secret` | a path that climbs, in a link that cannot |
| `/a\b` | a backslash is a path separator to some clients |
| `&#47;&#47;evil.example` | the first one, written as entities |

The last row is why the target is decoded before it is judged and escaped again
before it is printed: `inline()` escapes the whole line before it looks for
links, so the five entities `e()` produces — and any numeric reference below
128, which is every character a scheme, a slash and a colon are made of — come
back off first. One pass, so `&amp;#47;` stays the text `&#47;`.

`editor/editor.js` holds the same allowlist. The editor previews a document by
rendering it, so a link the preview shows and the site drops would mean the
preview is not what the site sends. `bin/test` renders one list of targets
through both halves and fails if a single byte differs.

The `footer` in `site.php` is the only string outside `content/` that reaches
the page as writing, and it takes the same path: `Renderer::inline()` escapes it
and allowlists its links exactly as it does a paragraph's. There is one inline
renderer on the origin, not two.

`bin/test` asserts this with a document full of `<script>`, `onerror=` and
`javascript:` payloads, and with a footer carrying the same, and fails if any of
it survives.

Two headings with the same words get two ids, so an in-page link cannot be
made ambiguous by a document repeating itself. An `img` path is either a local
absolute path or a name under `/media/`; a protocol-relative URL, a backslash,
a control character and a path trying to climb out of the document root are all
reduced to the file they name. The `logo` and the `favicon` in `site.php` are
two more paths that reach the page, and they take the same reduction before
they are escaped into the page shell.

## The router

The request string never becomes a filesystem path. The category must be
identical to one declared in `site.php`; the slug is compared for equality
against real filenames from `scandir()`. Path traversal has no expression in the
code rather than being filtered out of it
([ADR-0004](adr/0004-routing-by-comparison.md)).

Only the category is checked for shape, and it is checked where it is read:
`TerminalCms\Site` drops a declared category that is not one segment of a URL,
so a malformed `site.php` entry is never routed, never navigated to and never
turned into a path. The slug gets no shape rule, deliberately — comparing it
with the real file names is the boundary, and a rule on top of it would only
make a document whose file is called `Release-1.2.md` unreachable while its own
listing still linked to it.

`bin/test` covers `../`, percent-encoded `../`, unknown categories,
over-deep paths, malformed category entries, and the request lines (`//`, `///`)
that `parse_url` cannot read as a path at all. A category declared in `site.php`
with no directory behind it is an empty listing, not a warning printed into the
page.

## The one script on the page

Each page carries about fifty lines of inline JavaScript that add a copy button
to code blocks, a Palette toggle and a text-size control. The toggle sets
`data-palette` on `<html>` to `light` or `dark` and keeps the reader's choice;
until there is one, the page opens in whatever `data-palette` it was served
with, or with none in the browser's preference. They fetch nothing, store two
strings in `localStorage`, and are inline so there is no third-party origin to
trust. Every
page is complete and readable with it blocked — no content depends on it. Delete
the `enhancement()` method in `site/src/Page.php` if you want a page with zero
script.

A page with a Diagram — a code block in the `mermaid` Dialect — gets about a
hundred more lines in the same script, and that is the only page that does.
They find each Diagram, add one `<script src="/mermaid.min.js">` for the copy
of Mermaid served from the site's own origin, and draw each Diagram over its
code block with `securityLevel: 'strict'`. The added `<script>` carries the
nonce, read from `document.currentScript.nonce` of the running script — the
nonce is never written into the script's text, and `script-src` names nothing
new. Mermaid's picture arrives with a `<style>` element and `style` attributes,
which the policy refuses, so the script places it by hand: the stylesheet into
one `<style>` carrying the nonce, each `style` attribute through the element's
CSSOM a declaration at a time, which the policy permits. Firefox drops the
value of a `style` attribute the policy refuses as it is set, so while Mermaid
draws, the script has its `style` attributes written under another name and
reads them back from there. A source that does not parse keeps its code
block and the page prints nothing. The Palette toggle draws every Diagram again,
and a Diagram's copy button copies its source. With scripts blocked, the Diagram
is the code block it always was.

Drawing leaves style-src reports in the browser's console: Mermaid measures its
picture in a scratch element with inline styles, and parsing its output does the
same in an inert document, and the policy blocks both. Each report is the
boundary holding. The picture is right because placement carries the styles.

The copy is Mermaid 11.17.2, the npm package's own `dist/mermaid.min.js`
with one line added at the top that names the version, the licence beside it in
`shared/mermaid.LICENSE`, and the SHA-256 of everything below that line.
`bin/test` checks that the hash is the file's, and that the version named here
is the one the file names — so upgrading the library is replacing one file,
running `php bin/build`, and correcting this sentence. It is the one file on
the origin with a CVE feed to watch; the reviews in
[security-audit.md](security-audit.md) record what was open at each release.

Every other page gets the script byte for byte as it was: nothing new is sent,
nothing is fetched, and `bin/test` holds the shell of a page without a Diagram to
a fixed hash.

## Headers

`index.php` sends:

```output
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
Content-Security-Policy: default-src 'none'; img-src 'self';
                         style-src 'self' 'nonce-<per request>';
                         script-src 'nonce-<per request>'; base-uri 'none';
                         form-action 'none'; frame-ancestors 'none'
```

A page has one inline point, the enhancement script, and it names a nonce
instead of the policy naming `unsafe-inline`. Sixteen random bytes per request,
so the value a page carries is no use to the next one. Nothing else on the page
may run: no inline handler, no `style` attribute, and no `<script src>` but the
one the enhancement script adds on a page with a Diagram, which carries the
nonce. The page as served has no `<style>` element at all; the nonce on
`style-src` is for the one stylesheet a Diagram places, which the script makes
with the nonce on it.

No config value reaches the page as CSS. The Theme and the Palette arrive as a
name and a word, each one of a fixed set or not used: a Theme is a name with a
stylesheet in `site/public/themes/`, linked like the others, and a Palette is
`light` or `dark`.

The policy is written once, in `site/src/Policy.php`. The header above and the
`<meta>` a built page carries are both read from it, and `bin/test` fails if
the directives are spelled anywhere else in the code.

To go further: delete `enhancement()` in `site/src/Page.php` and send
`script-src 'none'`.

HSTS and TLS belong in the vhost, not here.

## The built site

A Page Build ([ADR-0017](adr/0017-a-page-build-is-a-second-way-to-publish.md))
is served by a host that runs nothing and sends no header the site chooses.
Every built page therefore names its policy itself, in a `<meta>` that is the
first element of its `<head>`, ahead of everything it governs:

```output
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; img-src 'self';
               style-src 'self' 'nonce-<per build>';
               script-src 'nonce-<per build>'; base-uri 'none';
               form-action 'none'">
```

It is the header's policy, directive for directive, but for one. A browser
ignores `frame-ancestors` in a `<meta>`, so the build leaves it out, and a
built page can be framed by another site. It has no form, no login and nothing
to click that acts on a reader's behalf, so a framing page has nothing to trick
a reader into doing. A host that can send headers can send `frame-ancestors
'none'` itself. The three other headers above are the host's to send or not:
the build cannot carry them.

The nonce is sixteen random bytes, made once per build. Every page of one
build carries the same value, and every reader gets the same value until the
next build. Anyone who reads a page can see it. That is enough there. A nonce
stops markup that someone else put into a page from running. The per-request
value matters where a response can reflect what an attacker sent. A built page
reflects nothing: it is a file, written before any request. The only thing
that puts markup into it is the build, from the content, and the Renderer
cannot express raw HTML. Someone who can change what the build reads can
already change the page. The nonce does not stand between them.

The inline script, the Mermaid script and a Diagram's placed stylesheet carry
the build's nonce exactly as they carry a request's. `bin/test` builds the
sample content and checks three things. Every page's first `<head>` element is
the policy. The policy's nonce is the one on the page's script. Every built page is the page the PHP site serves for
the same address, but for the Base Path, the trailing slash and where the
policy is named.

## What to keep patched

PHP and the web server. There is no application dependency to update.

Two PHP settings belong in the pool or the vhost: `display_errors` off, so a
warning is never reconnaissance, and `expose_php` off, so the version is not in
a header.

## What would reintroduce risk

- Giving the editor a save endpoint — authentication, CSRF and path validation
  come back with it, which is exactly what [ADR-0002](adr/0002-request-time-rendering.md)
  rejected.
- Making any directory writable by the web user.
- Serving `content/` directly, or moving the document root above `public/`.
- Adding a markdown library to "support more syntax" — it would become the
  single largest piece of untrusted code on the origin.

## What has been reviewed

[security-audit.md](security-audit.md) records each review: its scope, its
findings, and what changed. A reviewed surface is not a guaranteed one. The
requirements above — patched PHP, `site/public` as the document root, no
writable directory, TLS in the vhost — are part of this model, not additions to
it.

## Reporting

Open an issue on the repository. There is no separate security contact and no
embargo process.
