# ADR-0022 — A Sub-category is declared, one level down

**Status**: accepted · 2026-10-04 · amends ADR-0004

## Context

A Category is one directory under `content/`, declared in Site Config, and the
router serves at most two segments: `/<category>/<slug>`. An Instance with a
Category that has grown — `guides` holding PHP, shell and deployment pieces
side by side — has nowhere to put the next level but in the Name, and the
Listing prints all of it as one run of rows.

ADR-0004 makes the declared Category list the navigation and the routable
surface at once, and turns a request into a path only by comparing each
segment against something that is not the request. Whatever a second level is,
it has to keep that.

## Decision

**A Sub-category is a Category declared inside another, in Site Config, and
there is exactly one such level.** A declaration under `categories` may carry
its own list of Categories; each matches one directory inside its parent's,
is spelled like a Category slug, and is dropped if it is not one, as a
Category is. A Sub-category declares no Sub-categories of its own.

- **Addressing.** `/<category>/<sub-category>/<slug>` is served when the first
  segment `===` a declared Category, the second `===` one of its declared
  Sub-categories, and the third is found by comparison against the names
  `scandir()` returns for that one directory. `/<category>/<x>` is a
  Sub-category's page if `x` is one, else a Document. A third segment under
  anything that is not a declared Sub-category, and any fourth segment, is a
  404. The path is still built only from Site Config and from `scandir()`.
- **A Document says where it is** in its `category` Meta as
  `<category>/<sub-category>`. The Editor reads that as it reads any Category
  (ADR-0006): to say which directory the file belongs in.
- **A parent keeps Documents of its own** beside its Sub-categories' directories.
- **Each page lists its own directory.** A Category's page prints its
  `index.md`, then its Sub-categories by name, then its own Documents — not its
  Sub-categories' Documents, which are on each Sub-category's page. The
  homepage's recent Listing takes from every Category and every Sub-category,
  and a row names the Category as `<category>/<sub-category>`.
- **A Sub-category has what a Category has**: an optional `index.md`, a
  `listing` switch, a label.
- **The navigation names top-level Categories only.**

## Consequences

- ADR-0004's guarantee holds at three segments for the reason it held at two:
  no segment of the request is ever part of a path, only compared against one.
- A directory inside a Category that nobody declared is invisible, exactly as
  an undeclared directory under `content/` already is.
- A Sub-category whose slug is also a Document's Name in the parent shadows the
  Document — `/guides/php` is the Sub-category's page. Site Config is the
  louder of the two, and `bin/test` warns about the collision rather than
  choosing silently.
- Media mirrors the path (ADR-0024), so a Sub-category's Documents keep their
  pictures one directory deeper.

## Rejected

**Any directory under a Category is routable.** Nothing to declare, and the
navigation and the routable surface stop being one list — a directory name out
of the request goes back to deciding what is served.

**A Sub-category as a Meta grouping** (`subcategory: php`) inside a flat
directory. No routing change at all, and no address for the group: a reader
cannot be sent to "the PHP guides".

**Arbitrary depth.** Nothing asked for a third level, and each level is a new
shape for the router, the Listing, the navigation and Media to agree on.
