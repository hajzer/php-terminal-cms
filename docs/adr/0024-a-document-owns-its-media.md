# ADR-0024 — A Document owns its Media

**Status**: accepted · 2026-10-04 · related to ADR-0022, ADR-0025

## Context

Every image an Instance has lives flat in `site/public/media/`. An Image Line
writes `/media/shot.png`, and any src that is not an absolute local path is
reduced to its file name under `/media/` — which is also what keeps a src from
climbing out of the document root. Nothing records which picture belongs to
which Document: two Documents cannot each have a `shot.png`, and taking one
Document somewhere else means knowing which of the files are its.

A Bundle (ADR-0025) has to take exactly one Document's pictures, and the
Editor, opened from `file://`, has never been able to show an image written
`/media/…` at all.

## Decision

**A Document's Media is one directory: its path under `content/`, repeated
under `media/`.** `content/about/what-it-is.md` keeps its pictures in
`site/public/media/about/what-it-is/`, a Sub-category's Document one level
deeper, and `content/index.md` in `media/index/`. Every Language of the
Document shares it.

- **A bare file name in an Image Line names a file in the Document's Media.**
  Every src that is not an absolute local path is reduced to its file name, as
  before, and the file name is now placed in the Document's directory instead
  of in `media/`. The reduction is unchanged, so a src still cannot address
  anything but a file name in a directory the Renderer chose.
- **An absolute local path names that path**, as it always has. The site's
  logo belongs to no Document and resolves as it did.
- **No fallback.** A bare name that is not in the Document's Media is a broken
  picture, not a look in the old flat directory.
- **The Editor resolves a bare name the same way**, relative to its own page
  in the repository's layout — `../site/public/media/<category>/<document>/` —
  from the Document's `category` Meta and its Name. That is where a checkout
  and an unzipped Bundle both keep it. The Editor knows no Language list, so
  for a Name that may end in one it looks under the whole Name first and, if
  the picture does not load, once more without a trailing two-letter suffix.
  That second look is the preview's only; the site knows the list and does
  not guess.

## Consequences

- This breaks an Instance whose Image Lines write bare names: its files move
  into each Document's directory once, and the release notes say how.
- Moving a Document to another Category moves its Media directory with it.
- The Editor's preview shows a Document's pictures offline for the first time,
  wherever the repository's layout is around it.
- `bin/test` compares the two halves' resolution of the same Image Line, as it
  compares their inline markup.

## Rejected

**A directory named after the Name alone** (`media/what-it-is/`). Recategorising
moves nothing, and every Category's `index.md` — and any two Sub-categories'
`intro.md` — share one directory.

**The Document's Media first, the flat directory as a fallback.** Nothing
breaks, and the Renderer has to stat a file per picture to decide what the
Line means, while the Editor cannot make that check at all: the preview and
the page would show different pictures for the same Line.
