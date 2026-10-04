# ADR-0028 — A Series is one row

**Status**: accepted · 2026-10-04 · amends ADR-0022 · related to ADR-0010

## Context

Some writing is one thing in several Documents: a solution with its design
chapters, a subject with its lessons. An Instance that publishes one — a
Vault deployment in fifteen files — has two ways to hold it, and both list it
wrong. Flat in a Category, the fifteen are fifteen rows on the Category's page
and on the homepage, and nothing but a shared prefix in their Names says they
belong together. In a Sub-category (ADR-0022) the parent's page names it once,
by its label, but the homepage's recent Listing still takes every Document in
it, and its own page prints the chapters newest first — which for chapters
written on one day is the last one first.

The workaround is to switch the Listings off (ADR-0010) and write the index by
hand, and the homepage has no such switch per Category.

## Decision

**A Category may say `'series' => true` in Site Config, and each of its
Sub-categories is then a Series: one row in a Listing, in place of its
Documents.** A Document in a Series is a Part.

- **The parent says it, for all of its Sub-categories.** There is no switch on
  a Sub-category, so a Category does not mix Series with ordinary
  Sub-categories. Only exactly `true` makes Series; absent or anything else
  leaves the Sub-categories as ADR-0022 has them, as `published` is read
  (ADR-0023). On a Sub-category's own declaration the key means nothing.
- **The row is the Series' `index.md`.** Its `title`, its `date` and its
  Languages, as any row is one Document's; it leads to the Series' page and
  names the Series' own path, `<category>/<sub-category>`, as a row names
  where its Document is. Adding a Part does not move the row: the date is the
  `index.md`'s, and the author's to change.
- **No Published `index.md`, no row.** The Series' page and its Parts still
  answer at their addresses; no Listing names them. `bin/test` warns.
- **A Part has no row outside its Series.** The homepage's recent Listing
  takes the Series' row and none of its Parts.
- **The parent's page lists Series as rows**, in its Listing, by date among the
  Documents the Category holds itself. The list of Sub-category labels is not
  printed for such a Category, and with `'listing' => false` the page is its
  `index.md` and nothing else.
- **A Series' page lists its Parts by Name, ascending.** `01-…`, `02-…` is the
  reading order, and the dates do not enter into it. The Series' own `listing`
  switch still turns that Listing off.
- **Nothing else differs.** Addresses, Media, Bundles, `published` and the
  Editor treat a Series as the Sub-category it is.

No Migration brings an Instance here. No release requires the shape, and
whether a group of Documents is a Series is its author's to say; moving them
into a Sub-category is the operator's.

## Consequences

- "Newest first" is no longer true of every Listing: a Series' page is in Name
  order.
- A Series' label is shown only where its page has no `index.md` to take a
  heading from.
- Every Series is a declaration in Site Config, as every Sub-category is, and
  an Instance that turns a flat Category into Series changes its Parts'
  addresses — `/solutionz/vault-01-use-cases` becomes
  `/solutionz/vault/01-use-cases` — with no redirect.
- A Series without a Published `index.md` is reachable and listed nowhere.
  The warning in `bin/test` is the only thing that says so.

## Rejected

**The Name's prefix** — `vault.md` and every `vault-*.md` beside it are one
Series. Nothing to declare and no address changes, and a later Document that
happens to begin `vault-` joins without anyone saying so. ADR-0014 reads a
suffix out of a Name only because the suffixes are declared.

**A Meta Line** — `part-of: vault` in each Part. ADR-0022 rejected a Meta
grouping for a Sub-category already; here it would also mean reading every
file in a directory to print one row.

**The switch on each Sub-category.** A Category could then mix both sorts,
its page would name some of its Sub-categories as rows and some as labels, and
a new Series declared without the key would put every Part on the homepage.

**The newest Part's date on the row.** A Series would return to the top of
the homepage for a corrected typo, and the row would stop being one
Document's.

**The parent's path on the row.** Shorter beside the title, and the one row
whose third column is not where its Document is.
