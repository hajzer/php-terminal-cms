# 04 — Sub-categories: Site Config, routing, pages, Listing, Page Build

Status: ready-for-agent
Spec: ../spec.md

## What

ADR-0022 end to end. A Category declaration may declare Sub-categories one
level down; `/<cat>/<sub>/<slug>` is served by comparison; a Category's page
names its Sub-categories and lists its own Documents; the homepage's recent
Listing takes from every level; the navigation names top-level Categories.

## Scope

- `Site::categories()`: each Category with its validated `categories`; a
  malformed Sub-category dropped; a second level ignored.
- `Router`: up to three segments, as spec §Sub-categories says; `resolve()`
  takes the Category path; every path component from Site Config or `scandir()`.
- Category page: `index.md` or the label, the Sub-categories by label, then
  the Listing if on. A Sub-category's page is the same shape without the
  Sub-category list.
- `Listing::recent()` walks both levels; `Entry` carries the path and writes it.
- `Page`: navigation top-level only; active item from the path's first part.
- Collision: a Sub-category slug equal to a Document's base in its parent —
  the Sub-category answers, and `bin/test` prints a warning naming the file.
- `bin/page-build`: the new pages.
- The Editor: the export overlay's path with a slash in `category:` — check
  it already works and add a `tests/js-model.js` case.
- `site.php.example`, `docs/config.md`, `docs/format.md`: Sub-categories and
  `category: <cat>/<sub>`.
- One Sub-category in the repository's own `site/content/` as the example and
  the fixture.

## Out

Published (05). Media (06). Bundles (08).

## Acceptance

- [ ] `bin/test`: spec Testing §1 in full
- [ ] `bin/test`: the Page Build writes the Sub-category page and its Documents
- [ ] `tests/js-model.js`: the export path for `category: guides/php`
- [ ] The example Sub-category reachable on `php -S`, and its parent naming it

## Comments
