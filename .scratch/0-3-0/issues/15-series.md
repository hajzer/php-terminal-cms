# 15 — Series: a Sub-category that is one row

Status: done
Spec: ../../../docs/adr/0028-a-series-is-one-row.md
Blocked by: 04, 05

## What

ADR-0028. A Category that says `'series' => true` in Site Config makes each
of its Sub-categories a Series: one row in a Listing — its `index.md`'s — in
place of its Parts, and a page of its own that lists the Parts by Name.
`CONTEXT.md` already carries Series and Part.

## Scope

- **Site Config.** `Site` reads `series` on a top-level Category entry: only
  exactly `true` is true. Each Sub-category of such a Category is declared as
  a Series; the key on a Sub-category's own entry is ignored.
- **The Series' row.** Built from the Series' Published `index.md` in the
  Language a row is printed in: its `title`, its `date`, its `(EN | SK)`. It
  leads to the Series' page and its category column is the Series' path,
  `<category>/<sub-category>`. No Published `index.md` → no row.
- **The homepage's recent Listing** takes a Series' row and none of its
  Parts. Ordinary Sub-categories are taken Document by Document, as now.
- **The parent's page.** For a `series` Category the Listing holds its own
  Documents and its Series' rows, by date as now; the
  `<ul class="sub-categories">` list is not printed. `'listing' => false`
  prints `index.md` alone.
- **A Series' page.** Its Listing is its Parts by Name ascending, `index.md`
  excluded as now; its own `listing` switch still applies. Everything else
  about the page — Bundle link, Media, `published` — is a Sub-category's.
- **Page Build** prints the same Listings; nothing of its own to change
  beyond what the Router does.
- **`bin/test`.** A warning for a Series with no Published `index.md`, beside
  the existing Sub-category/Document collision warning. A fixture Category
  with `series` covering every Acceptance line below.
- **The shipped example.** `site.php.example` documents `series` in the
  `categories` comment; the example content gains a Series if the docs need
  one to point at.
- **The words.** `README.md` and the docs that describe Sub-categories and
  Listings, and the 0.3.0 entry of `CHANGELOG.md`.

## Out

A Migration step. A `series` switch on a Sub-category. Guessing a Series from
Names or Meta. Redirects from a Part's old address. Next/previous links
between Parts. Anything in the Editor.

## Acceptance

- [x] A Category without `series`, or with any value but `true`, renders
  byte for byte as before
- [x] The homepage Listing has one row per Series and no row for a Part
- [x] That row carries the `index.md`'s title, date and Languages, links to
  the Series' page and names `<category>/<sub-category>`
- [x] A Series whose `index.md` is absent or not Published has no row
  anywhere, its page and Parts still answer, and `bin/test` warns
- [x] The parent's page lists Series as rows among its own Documents by
  date, prints no label list, and with `'listing' => false` prints its
  `index.md` alone
- [x] A Series' page lists its Parts by Name ascending whatever their dates
- [x] A Page Build of the fixture carries the same Listings
- [x] `site.php.example`, the docs and `CHANGELOG.md` describe `series`
- [x] `php bin/test` green

## Comments

Done. 1113 assertions, all green; the Editor is untouched, so the probe was
not run.

- `Site::categories()` gives every declaration a `series`: whether it *is* a
  Series, so it is never true of a Category.
- `Listing::forPage()` is the Listing a Category's or Sub-category's page
  prints, read by the Router and by `bin/page-build`; `Listing::series()` is
  a Series' one row, or null. `Listing::recent()` takes the row and skips the
  Parts.
- The fixture is `seriesFixture()` in `bin/test`, served and Page Built.
- The example content gains no Series: `docs/config.md` describes one without
  pointing at it.

Choices to look at:
- In the row's `(EN | SK)`, the site's own Language leads to the Series'
  page, as the row does; each other leads to `<series>/index-sk`, the
  `index.md` as a Document. That page names `<series>/index` in turn, so a
  Page Build now writes a Series' `index.md` at each of its Languages'
  addresses when it has more than one.
- A Series whose `index.md` exists only in another Language than the site's
  has a row with that title, leading to a Series' page headed by its label —
  the page reads only the site's own `index.md`, as every Category's does.
  Nothing then links `<series>/index-sk`. The ADR does not say; not warned.
- Rows of one date fall in slug order, a Series by its own slug.
- Name order is byte order: `10-…` before `2-…`. `docs/config.md` says so.
