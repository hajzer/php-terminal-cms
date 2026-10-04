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

- [x] `bin/test`: spec Testing §1 in full
- [x] `bin/test`: the Page Build writes the Sub-category page and its Documents
- [x] `tests/js-model.js`: the export path for `category: guides/php`
- [ ] The example Sub-category reachable on `php -S`, and its parent naming it

## Comments

The example is `guides/hosting`, holding `without-php.md` (on a Page Build).
It is declared in `site.php.example`; an Instance's own `site.php` has to
declare it before `/guides/hosting` answers on `php -S`. It answered on a
copy of `site/` with the example as its `site.php`, and its parent named it.

The Editor's export path did not already work: `slug()` turned the slash
into `-`. `Doc.prototype.dir()` now spells each part of the Category on its
own, with no check on how many parts there are.

A Document shadowed by a Sub-category stays in its parent's Listing, and its
row leads to the Sub-category's page. `bin/test`'s warning is the answer to
that, as ADR-0022 says, and the Listing makes no choice of its own.
