# ADR-0015 — Tables are Lines, not a grid

**Status**: accepted · 2026-09-11

## Context

A Table is a Run of Table Lines, each holding its Cells as one pipe-separated
string. There is no Table object anywhere in the model, and until this release
there was no way to speak about a Column at all: adding one meant retyping every
Line in the Run by hand and counting pipes to keep them aligned.

The obvious fix is to make a table a thing — a Table with rows and cells in it,
and a grid editing mode over it: h/j/k/l between Cells, a current-Cell cursor,
an edit box that opens on a Cell rather than on a row. Every operation that
now rewrites a string would become a structured edit on real cells.

That would be a second editing model inside an Editor whose whole premise is
that the cursor is on a Line (ADR-0005, ADR-0007). Two cursors, two sets of
movement keys, two shapes of undo entry, and a boundary the writer has to cross
and notice. It would also give the model its first object that is not a Line,
which the parser, the exporter, the Renderer, the history and the reordering
keys would all have to learn.

## Decision

A Table stays a Run of Lines. A **Cell** is one of the `|`-separated parts of a
Table Line; a **Column** is the nth Cell of every Line in the Run — **derived
when it is asked for, and never stored**.

`:col add|del|left|right` reads the Run's bounds from the cursor, splits every
Line into Cells, pads the short ones to the Run's width, applies the operation
and joins back with ` | `. What it produces is Lines, which is what it was
given.

The width of a Run is its widest Line, and padding happens only when an
operation touches the Run. `:col del` on a Run one Cell wide is refused: what
is left of a table with no columns is not a table.

Cells are reached while writing, not navigated between: `Tab` and `Shift-Tab`
inside the edit box walk the caret from one Cell to the next in the same string.
`Tab` past the last Cell commits the row and opens the next one — the writing
loop, sideways. Nothing about the cursor changes.

## Consequences

- One editing model. The cursor is on a Line, here as everywhere else, and
  there is no mode to enter or leave.
- Rows need no new keys. Reordering a row is `J`/`K`, removing one is `D`,
  duplicating one is `y` — because a row **is** a Line, and those keys already
  move Lines.
- Undo needs nothing new. A Column operation rewrites Lines, and the history
  records states of Lines, so one Column operation is one entry for free.
- Every Column operation rewrites the whole Run, including the Lines it did not
  mean to change. On a table of any size a writer would ever type, that costs
  nothing worth measuring.
- Short rows get padded. A Run whose Lines have different numbers of Cells comes
  out of the first Column operation rectangular, with empty Cells where a Line
  was short. That is a visible change the writer did not ask for, and it is the
  price of the Run having a width at all.
- A Column has no identity. It is a number and the Cells that number picks out;
  moving one is rewriting text, so nothing follows it — not a width, not an
  alignment, not a name.
- The Renderer is untouched. It already reads a Table Run row by row, and a
  padded row is a row.

## Rejected

**A Table object with a grid editing mode.** h/j/k/l between Cells and a
current-Cell cursor is the right interface for a spreadsheet and the wrong one
for this Editor: it is a second editing model, with its own cursor and its own
undo, inside a document whose every other Line is edited the same one way. It
also buys the model its first non-Line, and every part of the system that walks
Lines would have to be told about it.

**Storing the Cells on the Line.** A Line whose text is also a list of Cells has
two representations of one thing and a moment where they disagree — the moment
the writer is typing. The string is what the file holds and what the writer
edits; splitting it when a Column is asked about is cheaper than keeping a
second copy true.

**Padding every Run on parse.** It would give every Run a width without waiting
for an operation, at the cost of a file that comes out of the Editor different
from the one that went in, having been touched nowhere.
