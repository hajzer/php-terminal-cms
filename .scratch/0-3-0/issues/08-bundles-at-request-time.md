# 08 — Bundles at request time

Status: ready-for-agent
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

- [ ] `bin/test`: spec Testing §4's Bundle contents and precedence bullets
- [ ] `bin/test`: a hidden Document, a hidden Category and `bundle: false`
  each give a 404 at `.zip` and no control on the page
- [ ] By hand: a Bundle unzipped, `editor/index.html` opens its `.md` and shows
  its picture, in Firefox and Chromium
- [ ] By hand: `rsync <bundle>/site/` into a scratch Instance shows the Document

## Comments
