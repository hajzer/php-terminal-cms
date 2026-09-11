# 02 — A link where the caret is: the overlay half

Status: done
Spec: ../spec.md
Blocked by: 01
Commit: 1 of 8 — "editor: a link where the caret is"

## What

The DOM half: reaching the address overlay from inside an open edit box, taking
the selection with you, and putting the committed link back where you were.

## Scope

- `^K` while a Line is open for editing opens the address overlay. It is bound
  on the editing span's own keydown handler, beside the `Tab` that walks Cells,
  and calls `preventDefault()`.
- Text selected inside the edit box arrives in the overlay as the `wording`,
  so linking a phrase is select-then-one-key, as it is everywhere else.
- With nothing selected, the overlay opens empty and the link lands at the
  caret.
- Committing puts the link where the selection was, or at the caret, and leaves
  the caret after it so the writer carries on typing.
- `Esc` leaves the Line exactly as it was — text, caret and selection.
- The offsets are read off the live span before the overlay opens and handed to
  the model as numbers. No Selection or Range crosses into `editor/editor.js`.
- `a` on a Line that is **not** open for editing is untouched: it opens the
  picker, and a new link appends. There is no caret there to speak of.
- One link inserted or edited is one `^Z`.
- `^K` on a Line whose text carries no inline markup says so and changes
  nothing, the way `a` already does.

## Out

`^K` on an Image Line offering anything new — the Image half of the overlay is
`src` and `caption` and has no caret in it. No link picker in the read pane and
no editing from the preview. No second key that does the same thing.

## Acceptance

`tests/editor-probe.js`, run in a browser, covers and passes:

- [x] `^K` with a selection inside an open edit box opens the overlay with the
  selection as the `wording`
- [x] committing replaces exactly the selected span, and the rest of the Line is
  byte-identical
- [x] `^K` with a caret and no selection opens an empty form and the committed
  link lands at the caret
- [x] the caret sits after the inserted link and typing continues there
- [x] `Esc` leaves the Line's text identical
- [x] a Line that already carried a link still reports both afterwards, in order
- [x] `a` on a Line not being edited still appends, unchanged
- [x] one `^Z` takes back the whole insertion
- [x] `^K` on a Code Line says so and changes nothing
- [x] `Tab` still walks Cells in a Table Line, unaffected by the new binding

Then:

- [x] `php bin/test` green
- [x] the probe green in a browser, with its count noted in the comments
