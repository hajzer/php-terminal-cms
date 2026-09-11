# 04 — Columns: :col add, del, left, right

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 03
Commit: 2 of 5 — "editor: table cells and columns"

## What

Column operations that rewrite every Line in a Table Run at once.

A **Column** is the nth Cell of every Line in a Table Run — derived when asked,
never stored. There is no Table object and no grid. See
`docs/adr/0015-tables-are-lines-not-a-grid.md` (written in issue 07).

## Scope

```
:col add          an empty Column on the right, every Line
:col add 2        an empty Column before Column 2
:col del 3        Column 3 out of every Line
:col left 3       Column 3 swaps with Column 2, every Line
:col right 2      Column 2 swaps with Column 3, every Line
```

- A Column is named by an explicit number, counted from 1. There is no
  remembered "current Column".
- Tab-completion offers the heading Cells against their numbers.
- Rows shorter than the Run are padded to its width when an operation touches
  the Run.
- The operation stops at the Run's bounds — a second table further down is
  untouched.
- Refused, with a message and no change: a number outside the table, `del` on a
  Run of width 1, a cursor on a Line that is not a Table Line.
- One Column operation is one `^Z`.

The operations themselves go in `editor/editor.js`; `:col` is a command entry in
`editor/ui.js` like every other. It documents itself in the `?` overlay, which
is generated from the command list.

## Acceptance

`node tests/js-model.js`, asserting on the text of every Line in the Run:

- [ ] `add` with and without a position; `del`; `left`; `right`
- [ ] a short row padded by an operation that touches it
- [ ] a second Run below left untouched
- [ ] refusals: out-of-range number, `del` at width 1, cursor not on a Table Line

`tests/editor-probe.js`, green in a browser:

- [ ] `:col add`, `:col del 2`, `:col left 2` through the command line each change
  every Line in the Run
- [ ] `:col del 99` is refused with a message
- [ ] Tab-completion on `:col del` lists the heading Cells against their numbers
- [ ] one `:col` is one `^Z`

- [ ] `php bin/test` green
