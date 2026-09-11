# 03 — The Table strip: drawing it, and pointing at things

Status: ready-for-agent
Spec: ../spec.md
Commit: 2 of 7 — "editor: a table you can point at"

## What

Something on screen that says a Table has Columns, how many, and which one is
the third — so that a writer stops counting pipes.

**The cursor is still on a Line.** There is no Cell cursor and no
`h`/`j`/`k`/`l` between Cells. ADR-0015 stands as written, and this is the
interface it left room for.

## Scope

- A Table Run in the write pane carries a strip above it: one entry per Column,
  each showing that Column's heading Cell.
- It is drawn from the Run's derived Columns — the model already reports the
  heading Cells padded to the Run's width, and no new model call is needed.
- Clicking an entry selects that Column.
- The selected Column is a number held in `editor/ui.js` beside the pane and
  swap state. It is **not** on the Doc and **not** in the history.
- It is cleared when the cursor leaves the Run, or moves to a different Run, so
  there is never a selected Column that is not on screen. 0.1.8 excluded a
  remembered Column as "hidden state that survives cursor moves and is
  invisible on screen"; a strip the writer is looking at is neither, which is
  exactly what makes this one allowed — if it ever outlives what is drawn, that
  exclusion applies again.
- Clicking a Cell puts the cursor on that row and opens it for editing with the
  caret already in that Cell, through the caret-to-Cell path that already
  exists.
- No strip when the cursor is not in a Table Run — it is not chrome on a
  document that has no tables.

## Out

The four operations and the two keys: issue 04. Selecting more than one Column.
Dragging an entry to reorder. Column alignment, width, or a heading that is
anything but the first row — a Column has no identity and carries no properties
(ADR-0015). The strip is write-pane chrome: it is not rendered into the read
pane, does not reach the document renderer, and has no expression in the
exported markdown.

## Acceptance

`tests/editor-probe.js`, run in a browser, covers and passes:

- [ ] a Table Run draws a strip with one entry per Column, carrying the heading
  row's text
- [ ] a Run whose rows are ragged draws entries for the widest row, and drawing
  the strip does not itself change any Line
- [ ] a document with no Table draws no strip
- [ ] two Table Runs separated by a Paragraph draw the strip for the one the
  cursor is in, and its Column count is that Run's
- [ ] clicking an entry selects it and the selection is visible
- [ ] moving the cursor out of the Run clears the selection and the strip
- [ ] moving the cursor to the other Run clears the selection rather than
  carrying it across
- [ ] clicking a Cell opens that row with the caret in that Cell
- [ ] clicking the first and the last Cell of a row both land correctly
- [ ] the strip does not appear in the read pane, and `export` is unchanged

Then:

- [ ] `php bin/test` green
- [ ] the probe green in a browser, with its count noted in the comments
