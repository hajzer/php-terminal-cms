# ADR-0007 — Undo is a stack of whole-document snapshots

**Status**: accepted · 2026-09-09

## Context

The Editor had no undo. Every other change in the writing loop was one keystroke
away — `D` removes a line, `J` moves one, a drag reorders a run — and none of
them could be taken back. A writer who deleted the wrong line retyped it.

The two usual shapes were on the table. **Inverse commands**: each mutation
returns the mutation that undoes it. **Snapshots**: keep the whole document as
it was and put it back.

Inverse commands are the cheaper one for large documents and the more expensive
one for correctness. Every mutation on `Doc` needs a matching inverse, every new
mutation needs another, and an inverse that is subtly wrong corrupts the
document rather than failing loudly. `Doc.remove()` alone would need to restore
a Line's position, its Type, its Dialect and its Fold flag — and `reveal()`,
which unfolds whatever is hiding the cursor, mutates lines nobody named.

A Document here is a markdown article: a few hundred Lines of a handful of
fields each. Copying one is cheap enough that the question is only ever
correctness.

## Decision

The history is a stack of snapshots of the whole document, in `editor/editor.js`
where `tests/js-model.js` can drive it without a browser. `render()` — the one
function that draws — records the state it is about to draw, and records nothing
when nothing changed.

Three rules make the granularity match what a writer thinks they did:

1. **The cursor is not in the signature.** Walking down the document is not
   something to undo. Each snapshot still carries the cursor, so undo returns
   you to where you were working.
2. **Folds are not in the signature either.** Opening an Output section is
   looking, not editing, and it never reaches the file ([ADR-0005](0005-fold-state-on-the-lines.md)).
3. **A line opened to be typed into is a half-step.** `o` records the empty
   line and then marks the history `coalesce()`, so the text that follows
   replaces that state instead of adding one after it. Opening a line and
   filling it is one undo, as it was one action.

## Consequences

- Undo cannot corrupt the document: it puts back bytes that were there, rather
  than computing what they must have been.
- Every mutation is covered the day it is written, including ones nobody thought
  about — opening a file, **Clear**, **New .md**, a drag, `foldall`.
- Memory is the cost: 200 states of a whole document. For an article that is a
  few megabytes at worst; for a document large enough to matter, the Editor is
  the wrong tool already.
- The history lives in the browser tab and dies with it, like the document it
  belongs to. The Editor still keeps nothing between visits.
- Undo and redo are the one thing that does not go through `render()`: what they
  hand back was recorded while the invariants held, so re-recording it would
  only record itself. They call `paint()` instead.
