# ADR-0005 — Fold state lives on the Lines

**Status**: accepted · 2026-09-09

## Context

An Output run is folded by default. The editor has to remember which runs the
writer has opened, and the first implementation kept that beside the document:
a `Set` of line ids in `ui.js`, where a run counted as folded when the id of
its **first** line was in the set.

That key is not stable. The first line of a run changes when a line is deleted
from the top of the run, when one is inserted above it, when a line is dragged
across the boundary, and when two runs merge because the Code line between them
was removed. Every one of those made a fold silently stop applying, or apply to
the wrong block. Worse, the set kept ids of lines that no longer existed, so it
grew for the life of the tab and could match a run again by coincidence.

Papering over it needs a re-keying pass after every mutation, and that pass has
to guess: "this run is the one that used to be that run". A guess in the middle
of the writing loop is the wrong shape of solution for the part of the system
the writer touches most.

## Decision

Fold state is a property of the Lines. Every Line in an Output run carries the
same `fold` flag, and a run is folded when its first line says so.

Toggling a fold writes the flag to every Line of the run. A Line inserted into
a folded run inherits the flag from the Line it follows, which is the same rule
that already gives it its Type and Dialect.

## Consequences

- Deleting a run's first line cannot lose the fold: the next Line carries it.
- Splitting a run leaves both halves folded; merging two takes the first one's
  state. Both are what a writer would predict.
- There is no state to re-key, no stale ids to prune, and no set to keep in
  step with the document — so the editor's invariant list is shorter by one.
- `fold` is editor state that rides in the model, and the exporters ignore it:
  it is not in the markdown, because folding is already the default there.
- It is testable without a browser. `tests/js-model.js` asserts each of the
  cases above against the model half, and `bin/test` runs it.
