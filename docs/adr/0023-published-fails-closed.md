# ADR-0023 — Published fails closed

**Status**: accepted · 2026-10-04

## Context

Every file under `content/` is a page. An author who wants to Transfer a
Document before it should be read — to check it on the real host, or to have
it ready for a date — has no way to say so but to keep it off the server. A
Category being built up has the same problem at a larger size.

Everywhere else the system reads a setting, a word that is not a choice is
ignored and the next party decides (ADR-0019): a misspelt `theme` gives
Baseline, a misspelt `listing` leaves the Listing on. That rule is right when
the cost of a misspelling is a page drawn in the wrong colours.

## Decision

**Something not Published does not exist for a reader.** A Document says so in
its `published` Meta; a Category or a Sub-category in its Site Config
declaration. Not Published, it is a 404 at its address, no Listing, navigation
or Language indicator names it, a Bundle leaves it out, and a Page Build does
not write it. A Category that is not Published takes its index, its Documents
and its Sub-categories with it.

**Only an absent value or exactly `true` publishes. Any other word hides.**
This is the one setting that fails closed: `published: flase` keeps a draft a
draft. Each Language of a Document is its own file with its own Meta, so a
translation can be held back while the original is read.

**`published` is not printed under the title.** A reader only ever meets a
Document that is Published, so the line could only ever say `true`.

## Consequences

- A hidden Document is on the server and in the repository. It is unreachable,
  not secret: anyone who can read `content/` or the git history reads it.
- The rule lives where each reader of `content/` lives — the Router, the
  Listing, the Bundle and the Page Build — and `bin/test` holds every one of
  them to it with the same hidden fixture.
- The Editor has no draft mark. `published: false` is a Meta Line like any
  other, and the Editor's preview shows the Document as it would read if it
  were Published.
- The `published` exception to the Meta line lives in three implementations
  and the agreement test, as `title` and `palette` do.

## Rejected

**Unlisted: reachable by its address, absent from every Listing.** A preview
link is useful, and also a page anyone can be sent to, which is not what
"not published" means to an author.

**The usual rule, failing open.** It treats a typo in a draft's Meta as an
instruction to release it.

**A Category's `index.md` saying it is unpublished.** A Category exists because
Site Config declares it, and whether it is reachable is part of that.
