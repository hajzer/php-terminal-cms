# ADR-0010 — An index page lists, unless the Instance says not to

**Status**: accepted · 2026-09-10

## Context

Every index page ended with a Listing the code had decided on: the homepage
printed the recent Documents from every Category, and a Category page printed
its own. There was no way to say no. An Instance whose homepage is a single
paragraph about who is writing, or whose `about` Category is three pages nobody
needs an index of, got a list under it anyway — and an empty Category got
"Nothing here yet." printed at a reader who had not asked.

Writing the page without the list was not possible either way round: `index.md`
is content and the Listing is generated after it, so there was nothing an author
could put in the file to suppress it.

## Decision

Site Config gains a `listing` switch, in two places: at the top level for the
homepage, and inside a Category entry for that Category's page. `false` prints
the `index.md` and nothing else — no list, and no empty-state line where the
list would have been.

Absent means on: a `site.php` that does not name the switch gets the Listings,
which is what every other key in that file does too.

## Consequences

- The two switches are independent. A hand-written homepage can sit above
  Categories that all list, and one Category can be a written page while its
  neighbour is an index.
- A switched-off Listing hides no Document. Every one of them is still routable
  at `<category>/<slug>` and still reachable from any link written to it — what
  is gone is the automatic list, not the content.
- The Listing stays code, not content. An author who wants a curated list writes
  one in `index.md` as ordinary Lines, and turns the automatic one off.
- `Router` now looks a Category's whole configuration up rather than only its
  label, which is the shape a second per-Category setting would want too.
