# 07 — The Page Build: layout, Base Path, output

Status: ready-for-agent
Spec: ../spec.md

## What

`php bin/page-build --output=<dir> --base-url=<url>` renders every page of an
Instance to files (ADR-0017). This issue is the build and its filesystem
behaviour; 08 is the policy each page names and the test that holds the built
site to the request-time one.

## Scope

- **Entry point.** `bin/page-build`, PHP. `--output` required, `--base-url`
  optional. The Base Path is the URL's path with any trailing `/` removed; an
  absent flag, a bare host, or `/` all mean an empty Base Path.
- **No Site Config, no build.** A missing `site/site.php` exits non-zero with
  the entry point's own sentence.
- **Addresses.** The homepage, each Category, each Document in each of its
  Languages as `Listing` already enumerates them, and one address that is not
  a Category, rendered through `Router::route()` and `Page::html()` — no page
  assembly of the build's own. Files: `index.html`, `<category>/index.html`,
  `<category>/<slug>/index.html`, `404.html`.
- **The Base Path and the trailing slash.** One value reaches every place an
  address is written: `Page` (nav, brand, stylesheets, favicon, logo),
  `Router` (the 404 body, the back link, Listing rows), `Listing::url()`,
  `Language::addresses()`, the enhancement script's Mermaid address from 06,
  and the Renderer's Href and Image src beginning with `/`. The request-time
  entry point sets it to `''` and no trailing slash, and its output does not
  change by one byte. A writer cannot set it in `site.php`.
- **Assets.** `site/public/` copied as it is, except `index.php` and
  `.htaccess`.
- **Output.** Render into a fresh sibling of `--output`. On success, remove the
  old output and rename the new one in. On any failure, remove the new one and
  exit non-zero, the old one untouched. An existing output is replaced only if
  empty or holding `.page-build` at its root; the marker is written into every
  build. An output that is, or contains, `site/`, `content/` or the repository
  root is refused.
- `bin/page-build` is in the release archive: `bin/` is copied whole — confirm
  against `bin/manifest.php` rather than assume.

## Out

The `<meta>` policy and the parity test (08). CI (09). Any change to the
request-time URL scheme.

## Acceptance

`php bin/test` covers, and passes:

- [ ] the sample content built with Base Path `/proj` yields every expected
  file, `404.html` and `.page-build`, and no `.php` and no `.htaccess`
- [ ] every local `href` and `src` in every built page starts with `/proj/` and
  resolves to a file in the output
- [ ] a root-relative Href and Image src carry the Base Path; a fragment,
  `https:` and `mailto:` do not
- [ ] built with no `--base-url`, addresses start at `/`
- [ ] refusals — no `site.php`; a non-empty unmarked output; an output that is
  or holds `site/` or `content/` — each exit non-zero and leave the filesystem
  as they found it
- [ ] a build forced to fail part-way leaves the previous build in place
- [ ] request-time output for every sample address is byte-identical to before
  this issue
- [ ] the Router answers `/<category>/<slug>/` with the page it answers
  without the slash

Then:

- [ ] a build of the sample served with `php -S localhost:8080 -t <output>`
  browsed by hand, from the root and from a `/proj` Base Path, and noted in the
  comments
