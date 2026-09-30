# 07 — The Page Build: layout, Base Path, output

Status: done
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

- [x] the sample content built with Base Path `/proj` yields every expected
  file, `404.html` and `.page-build`, and no `.php` and no `.htaccess`
- [x] every local `href` and `src` in every built page starts with `/proj/` and
  resolves to a file in the output
- [x] a root-relative Href and Image src carry the Base Path; a fragment,
  `https:` and `mailto:` do not
- [x] built with no `--base-url`, addresses start at `/`
- [x] refusals — no `site.php`; a non-empty unmarked output; an output that is
  or holds `site/` or `content/` — each exit non-zero and leave the filesystem
  as they found it
- [x] a build forced to fail part-way leaves the previous build in place
- [x] request-time output for every sample address is byte-identical to before
  this issue
- [x] the Router answers `/<category>/<slug>/` with the page it answers
  without the slash

Then:

- [x] a build of the sample served with `php -S localhost:8080 -t <output>`
  browsed by hand, from the root and from a `/proj` Base Path, and noted in the
  comments

## Comments

- 2026-09-30, agent: how it is built.
  - **`BasePath`** (`site/src/BasePath.php`) is the one value. It holds a
    path and whether a page's address ends in `/`. `page('guides/x')` writes
    a page's address, and `local('/x')` puts an address written from the root
    under the path; a fragment, `https:` and `mailto:` pass through unchanged.
    It is a parameter, not a Site Config key. Its default is `''` with no
    slash. It goes into `Router`, `Page::html()`, `Document::html()`,
    `Renderer::render()`/`inline()`, `Listing::forCategory()`/`recent()`
    (and so `Entry::url()`), and `Language::addresses()`. `index.php` passes
    `new BasePath('', false)` explicitly. `bin/test` checks that a site.php
    naming `base`, `base_path` or `base_url` changes nothing.
  - **Mermaid:** as 06 left it, `Page::MERMAID` goes through `local()` into
    `data-mermaid`, and nowhere else.
  - **The Editor is untouched.** `inline()` with the default Base Path emits
    the same bytes as before, and `tests/js-inline.js` still agrees.
  - **Byte-identical:** `bin/test` pins sha256 hashes of `Page::html()` for all
    10 sample addresses (the 404 included), recorded before any code changed.
    The spec reviewer also compared against a `git archive` of HEAD, with both
    `site.php` and the example: identical.
  - **The missing-config sentence** is `Site::NO_CONFIG`, which both entry
    points print.
  - **`bin/page-build`** holds all the filesystem code, so `site/src` still
    writes nothing and the source scan still holds. `bin/manifest.php` ships
    `bin` whole, so the script is in the release archive.
  - **404.html** is rendered from `/404.html`. A dot can never be in a
    Category slug, so that address is never a Category.
- 2026-09-30, agent: what it does beyond the letter of the issue, and why.
  - Every `*.php` and every `.htaccess` is left out at any depth, not only
    the two at the root. A static host would serve PHP source as text.
  - An output *inside* `site/` is refused as well. An output inside
    `site/public/` would copy itself into itself.
  - Two refusals: a `--base-url` whose path has `//`, a `.` or `..` segment,
    a backslash, whitespace or a control character; and a misspelled or
    repeated flag. Without the second, `--baseurl=/proj` would build at the
    root without a word.
  - Three reasons a build fails:
    - a listed address that does not answer 200;
    - a Document named `..md` or `...md`;
    - a page landing on a file already copied from `site/public/`, such as
      `public/guides/index.html` against the `guides` Category. At request
      time Apache would serve the file there, so the build says so rather
      than pick.
  - Parent directories of `--output` are created if missing, and removed
    again on failure.
  - The swap moves the old output aside, renames the new one in, and only
    then removes the old one. If both renames fail, the message names where
    the old build is.
  - Left as it is: `site/public/` is copied following symlinks, as a web
    server would serve them. A link to a file outside `public/` is published
    either way. An interrupted run (SIGINT) can leave a hidden
    `.<name>.page-build-*` directory beside the output.
- 2026-09-30, agent: a smoke check, not the by-hand box. I built the sample
  twice, into `serve/proj` with `--base-url=https://example.gitlab.io/proj/`
  and into a root build with no flag, and served each with `php -S`. `curl`
  fetched every local `href`, `src` and `data-mermaid` of every page: 88
  addresses each, all 200. One thing to know when browsing by hand: `php -S`
  without a router answers a mistyped address with the docroot's
  `index.html`, not `404.html`. That is the dev server's fallback; GitLab and
  GitHub Pages serve `404.html`. To browse the `/proj` build, put it in a
  `proj/` directory and serve that directory's parent.
- 2026-09-30, human: the by-hand check. Built with
  `php bin/page-build --output=dist/serve/proj --base-url=http://localhost:8080/proj/`
  and served with `php -S localhost:8080 -t dist/serve`, then built with
  `php bin/page-build --output=dist/pages` and served with
  `php -S localhost:8080 -t dist/pages`. Browsed both, from `/proj/` and from
  the root: everything worked.
