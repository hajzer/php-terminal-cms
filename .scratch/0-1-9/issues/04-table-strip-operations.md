# 04 — The Table strip: the four operations and the two keys

Status: done
Spec: ../spec.md
Blocked by: 03
Commit: 2 of 8 — "editor: a table you can point at"

## What

Every `:col` operation given a place to be clicked, and a pair of keys so the
work is not only under the mouse.

**No new model work.** The operations exist and are tested; this issue reaches
them from the strip. If a Column operation needs changing to make this work,
that is the signal to stop and say so rather than to add a second path.

## Scope

- A selected Column reveals four controls — add, remove, move left, move right.
- Each calls the same Column operation the command calls, with the selected
  Column's number. Same entry point, same refusals, same message.
- `^←` and `^→` move the selected Column, and do nothing when none is selected.
- A refusal changes nothing and says why, in the operation's own words: a Run
  one Column wide refuses remove, and a Column at the edge refuses the move
  that would take it off.
- One operation from the strip is one `^Z` — the same single history entry the
  command already produces, because it is the same rewrite.
- After an operation the strip redraws from the Run as it now is, and the
  selection follows the Column the writer was working on, where that still
  means something.

## Out

`:col` itself, which is unchanged and stays the complete path. Any new refusal,
any new operation, and any change to what a Column operation does to the Lines.
Multi-Column selection and ranges. Drag to reorder — `‹` and `›` move one step,
which is `J`/`K` for rows written sideways; drag is a second interaction for the
same operation and can come later if one step proves tedious.

## Acceptance

`tests/editor-probe.js`, run in a browser, covers and passes:

- [x] add from the strip puts an empty Cell in every Line of the Run, at the
  selected Column
- [x] remove takes that Column out of every Line
- [x] move left and move right swap it with its neighbour, in every Line
- [x] a Run with ragged rows is padded to its width by the first operation, and
  the rows that were already full width are byte-identical afterwards
- [x] the Run's bounds hold: a second table further down the document is
  untouched by any of the four
- [x] remove on a Run one Column wide is refused, says why, and changes nothing
- [x] move left on Column 1 and move right on the last are refused the same way
- [x] `^←` and `^→` move the selected Column
- [x] `^←` with nothing selected does nothing and changes nothing
- [x] one `^Z` takes back a strip operation entirely, in every Line of the Run
- [x] the strip redraws after each operation with the Run's new width
- [x] `:col` still does all four, unchanged

Then:

- [x] `php bin/test` green
- [x] the probe green in a browser, with its count noted in the comments
