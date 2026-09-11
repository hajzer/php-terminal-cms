# 03 — Cells: a row that is the right width, and Tab between Cells

Status: done
Spec: ../spec.md
Commit: 2 of 5 — "editor: table cells and columns"

## What

Two things, both about the Cells of one Table Line.

## Scope

**`o` on a Table Line opens a row with the Run's Column count already in it**,
rather than one empty Cell. The Run's width is its widest Line.

**`Tab` and `Shift-Tab` while editing a Table Line walk the caret Cell to
Cell.** `Tab` past the last Cell commits the row and opens the next one with the
caret in its first Cell — the writing loop, sideways. `Shift-Tab` on the first
Cell does nothing rather than leaving the row.

Intercepted on the editing span, beside the existing `Enter`/`Escape` handling.
`Enter` keeps meaning "commit and open the next Line".

**`Tab` outside editing is untouched** — it still cycles the Dialect of a Code
or CLI Line.

## Model / DOM split

Splitting a Line into Cells, joining them back with ` | `, and finding a Table
Run's bounds from a cursor inside it belong in `editor/editor.js` — issue 04
needs the same pieces, so build them here and test them under node. The caret
work is `editor/ui.js`.

## Acceptance

`node tests/js-model.js`:

- [x] split and join, including empty Cells and a Line shorter than its Run
- [x] a Run's bounds from a cursor inside it, not crossing into a second Run further
  down the document

`tests/editor-probe.js`, green in a browser:

- [x] `o` on a Table Line in a three-Column Run opens a three-Cell row
- [x] `Tab` while editing moves Cell to Cell
- [x] `Tab` on the last Cell opens the next row, caret in Cell 1
- [x] `Shift-Tab` on the first Cell does nothing
- [x] `Tab` outside editing still cycles Dialects
- [x] `Enter` while editing a Table Line still commits and opens the next Line

- [x] `php bin/test` green
