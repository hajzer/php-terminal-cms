# Security reviews

One section per review: its scope, its findings, and what changed. A reviewed
surface is not a guaranteed one, and the residual requirements are at the foot
of this file.

[security.md](security.md) states the model — what exists, what does not, and
where the boundaries are. This file is the record of checking it.

## Scope, both reviews

The public origin in full: the entry point, the router, the markdown parser, the
line renderer, the highlighter, the page shell and the response headers. Around
the edges: the static editor, `site.php` handling, the packaging and test
scripts, and the deployment instructions.

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

## Validation

`php bin/build` and `php bin/test` clean at both releases — 212 assertions at
0.1.3, 248 at 0.1.4. 0.1.5 changed documentation, comments and test names only:
no file under `site/` or `editor/` differs from 0.1.4 in behaviour, and the
suite is unchanged at 248.

`tests/editor-probe.html` drives the editor's DOM half through a real browser
and is the one check the suite cannot run.
