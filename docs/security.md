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
third-party library on the public origin: no Parsedown, no framework, no
composer dependency, nothing with a CVE feed to track. No third-party
JavaScript, no CDN request, no external font. The one inline script on a
published page adds a copy button, a theme toggle and a text-size control; it
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
to code blocks, a theme toggle and a text-size control. They fetch nothing,
store two strings in `localStorage`, and are inline so there is no third-party
origin to trust. Every
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
CSSOM, which the policy permits. A source that does not parse keeps its code
block and the page prints nothing. The theme toggle draws every Diagram again,
and a Diagram's copy button copies its source. With scripts blocked, the Diagram
is the code block it always was.

Drawing leaves style-src reports in the browser's console: Mermaid measures its
picture in a scratch element with inline styles, and parsing its output does the
same in an inert document, and the policy blocks both. Each report is the
boundary holding. The picture is right because placement carries the styles.

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

A page has two inline points — the enhancement script and the one style block
that carries the configured accent — and they name a nonce instead of the
policy naming `unsafe-inline`. Sixteen random bytes per request, so the value a
page carries is no use to the next one. Nothing else on the page may run: no
inline handler, no `style` attribute, and no `<script src>` but the one the
enhancement script adds on a page with a Diagram, which carries the nonce.

The accent is the only config value that reaches the page as CSS rather than as
text, and escaping is not a way of validating CSS, so it has to be six hex
digits or the default is used.

To go further: delete `enhancement()` in `site/src/Page.php` and send
`script-src 'none'`.

HSTS and TLS belong in the vhost, not here.

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
