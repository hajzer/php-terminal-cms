# 04 — Sub-categories: Site Config, routing, pages, Listing, Page Build

Status: done
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
- [x] The example Sub-category reachable on `php -S`, and its parent naming it

## Comments

The example is `guides/hosting`, holding `without-php.md` (on a Page Build).
It is declared in `site.php.example`, and an Instance's own `site.php` has
to declare it too; with it declared, `/guides/hosting` and its Document
answered on `php -S` and `/guides` named it.

The Editor's export path did not already work: `slug()` turned the slash
into `-`. `Doc.prototype.dir()` now spells each part of the Category on its
own, and names no directory past the second part, as the site has none.

A Document shadowed by a Sub-category is left out of every Listing, since its
row would lead to the Sub-category's page; `bin/test`'s warning names it.
