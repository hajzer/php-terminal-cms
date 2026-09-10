# Security model

What a public deployment exposes, what it does not, and where the boundaries
are.

## What is reachable from the internet

On the public origin: Apache (or nginx), the PHP runtime, one entry point of
seventy lines and about thirteen hundred lines of renderer, router and page
shell in `site/src/`. That is the whole of it — there is no other code, and
none of it is somebody else's.

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
reduced to the file they name.

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
to code blocks, a theme toggle and a text-size control. It fetches nothing,
stores two strings in `localStorage`, and is inline so there is no third-party
origin to trust. Every
page is complete and readable with it blocked — no content depends on it. Delete
the `enhancement()` method in `site/src/Page.php` if you want a page with zero
script.

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
`<script src>`, no inline handler, no `style` attribute.

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
