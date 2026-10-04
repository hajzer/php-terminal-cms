# 15 — Series: a Sub-category that is one row

Status: ready-for-agent
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

- [ ] A Category without `series`, or with any value but `true`, renders
  byte for byte as before
- [ ] The homepage Listing has one row per Series and no row for a Part
- [ ] That row carries the `index.md`'s title, date and Languages, links to
  the Series' page and names `<category>/<sub-category>`
- [ ] A Series whose `index.md` is absent or not Published has no row
  anywhere, its page and Parts still answer, and `bin/test` warns
- [ ] The parent's page lists Series as rows among its own Documents by
  date, prints no label list, and with `'listing' => false` prints its
  `index.md` alone
- [ ] A Series' page lists its Parts by Name ascending whatever their dates
- [ ] A Page Build of the fixture carries the same Listings
- [ ] `site.php.example`, the docs and `CHANGELOG.md` describe `series`
- [ ] `php bin/test` green

## Comments
