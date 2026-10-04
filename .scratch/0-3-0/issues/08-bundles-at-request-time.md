# 08 — Bundles at request time

Status: done
Spec: ../spec.md
Blocked by: 05, 06, 07

## What

ADR-0025 on a PHP host. `<address>.zip` answers a Document's or a Category's
Bundle; the doc-foot and the Category page offer it unless `bundle` says not to.

## Scope

- `site/src/Bundle.php`: the `(archive path, source)` list for a Document (every
  Published Language, its Media) and a Category (its `index.md`, its Documents,
  its Sub-categories' Documents, each with Media, skipping `bundle: false` and
  anything not Published), plus `editor/**` and a generated `README.txt`. Top
  directory: the Document's base, or the Category path with `/` as `-`.
- `Router`: a trailing `.zip` on the last segment resolved as the page; 404
  where the page is, or where the Bundle is not offered. Paths only from Site
  Config and `scandir()`.
- `bundle` precedence: Document Meta, Site Config, on; other words fall through.
- The controls: `↓ bundle` in the doc-foot; under the Sub-categories on a
  Category page. Plain links.
- `index.php`: `Content-Type: application/zip`, `Content-Disposition:
  attachment`, the usual policy header; streamed.
- `site.php.example`, `docs/config.md`, `docs/format.md`: `bundle`.
  `docs/deploy.md`: importing an edited Bundle with the deploy `rsync`.

## Out

The Page Build (09). An import route. The homepage.

## Acceptance

- [x] `bin/test`: spec Testing §4's Bundle contents and precedence bullets
- [x] `bin/test`: a hidden Document, a hidden Category and `bundle: false`
  each give a 404 at `.zip` and no control on the page
- [x] By hand: a Bundle unzipped, `editor/index.html` opens its `.md` and shows
  its picture, in Firefox and Chromium
- [x] By hand: `rsync <bundle>/site/` into a scratch Instance shows the Document

## Comments

`Router::route()` answers a `.zip` address with the page's usual result plus
a `bundle` key holding a `Bundle`, and `index.php` streams it after the
policy headers. A Page Build can call the same `route()` (09).

A file whose own Meta says `bundle: false` is in no Bundle: not its
Category's, and not another Language's Document Bundle. Inclusion reads only
that literal line, not the whole precedence. So on an Instance with
`'bundle' => false`, a Category whose `index.md` says `bundle: true` carries
every Document that says nothing, though none of them offers its own Bundle.
That is the spec's wording ("skips Documents with `bundle: false`"). If "the
default is the operator's" should reach inside a Category Bundle, the fix is
`Site::bundles()` per file in `Bundle::take()`. That call is the maintainer's.

A Category's offer is its `index.md`'s `bundle:`, then Site Config. Only
`false` turns Site Config off, as `listing` does. A Document that a
Sub-category shadows is left out of the parent's Bundle. `/guides/index.zip`
is a Document Bundle of `index.md` alone, because `/guides/index` is already
a page.

`Bundle` reads an Instance as one is laid out: `public/media/` and `editor/`
beside the content directory it is given. It does not follow a symbolic
link, take a dot file, or take a name `Zip::isName()` refuses. A Bundle's
README.txt names the Document by its first Language's title, so every
Language's address writes the same bytes.

Both by-hand checks were run headlessly and passed, but are left for the
maintainer's own browser. For the first, a scratch Instance had a bare-name
picture. Its Bundle came from `php -S`, with `application/zip` and
`attachment; filename="pic.zip"` under the CSP. Unzipped, `editor/index.html`
in Playwright Chromium and Firefox 155 opened the `.md`, and the picture
loaded (`naturalWidth` 160) with no console error. For the second, `rsync -a
pic/site/` went into a fresh copy of `site/`, and `/about/pic` answered 200
with its picture at 200.

For the sixth review (12): `.zip` routing, the Media walk, and
`Content-Disposition`, which carries `filename*` when the name is not ASCII.

The maintainer ran both by hand on 2026-10-04 and both pass: the unzipped
Bundle in the Editor, and the `rsync` into a scratch Instance. The first run
showed no picture, because the test Document's Meta had no `category:` — the
Editor finds a Document's Media from that Meta, having no other way to know
the file's directory. Accepted for 0.3.0 and said in `docs/format.md`.
