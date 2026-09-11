# 0.1.9 — a link where the caret is, and a table you can point at

Status: draft

## Problem Statement

**A link can only land at the end of the Line.** `a` opens the address overlay,
the two fields are filled in, and the link is appended — always. 0.1.8 decided
that deliberately, so that a writer always knows where it went (story 7), with
"you can move it by editing the Line" as the way to put it anywhere else. In
practice a link belongs in the middle of a sentence, so the writer creates it at
the end and then cuts `[wording](href)` out of the tail and pastes it into
place. That is the bracket-counting the overlay was built to abolish, arrived at
by a longer road.

**On a touch screen a Table is still out of reach.** 0.1.8 shipped with the
address overlay reachable by key alone; `link` joined the Legend in `341b75d`
before the tag, so a link and an Image's caption are now a finger away. Every
Column operation is not: `:col` is a command, and the `: commands` hint in the
Legend is inert text.

**A Table is only reachable through the command line.** `Tab` walks the Cells of
a row and `J`/`K` move a row, but every Column operation is `:col add|del|left|
right` with a number the writer has to work out. Nothing on screen says a Table
has Columns, how many there are, or which one is the third. The writer counts
pipes — in a different place and for a different reason than before, but counts
them.

## Solution

**The link lands where the writer is.** While a Line is open for editing, `^K`
opens the address overlay, and what it commits is placed at the caret rather
than at the end. Text selected inside the edit box arrives in the overlay as the
`wording`, and the committed link replaces that selection — which is what
selecting a phrase and asking for a link means everywhere else. `a` on a Line
that is not open for editing keeps today's behaviour exactly, appending, because
there is no caret to speak of and the end is the only honest answer.

**A Table says what its Columns are.** A Table Run in the write pane carries a
strip above it, one entry per Column, each showing that Column's heading Cell.
Clicking an entry selects that Column and reveals `+ × ‹ ›` — add, remove, move
left, move right — which call the same `Doc.prototype.column` the commands call.
Clicking a Cell puts the cursor on that row and opens it with the caret already
in that Cell. With a Column selected, `^←` and `^→` move it.

**The cursor is still on a Line.** There is no Cell cursor, no `h`/`j`/`k`/`l`
between Cells, and no second editing model — ADR-0015 stands as written and this
is the interface it left room for. A selected Column is not remembered state: it
is drawn on screen the whole time it exists, and it is gone the moment the
cursor leaves the Run. 0.1.8 rejected a remembered current Column because it
would be "hidden state that survives cursor moves and is invisible on screen";
a strip the writer is looking at is neither hidden nor invisible, which is what
makes this one allowed.

## User Stories

### The link where the caret is

1. As a writer, I want to select a phrase in the Line I am editing, press one
   key, and have that phrase become a link's wording, so that linking a phrase
   is the same gesture here as everywhere else I write.
2. As a writer, I want the committed link to replace exactly the text I
   selected, so that the sentence reads the way it read before.
3. As a writer with nothing selected, I want the link inserted at the caret, so
   that I can put one where I am without selecting first.
4. As a writer, I want the overlay to open with the selection already in the
   `wording` field, so that I only have to write the href.
5. As a writer, I want `Esc` to leave the Line byte for byte as it was, caret
   and selection included, so that opening the overlay is never destructive.
6. As a writer, I want `a` on a Line I am not editing to append exactly as it
   does today, so that nothing I already know stops being true.
7. As a writer, I want one link edited or inserted to be one undo step.

### The Table strip

8. As a writer, I want a Table Run to show its Columns above it, so that I can
   see how many there are and which one is the third without counting pipes.
9. As a writer, I want each entry to show that Column's heading Cell, so that
   I can find the Column by what it says rather than by its number.
10. As a writer, I want to click an entry to select that Column, so that the
    thing I am about to operate on is the thing I pointed at.
11. As a writer, I want a selected Column to offer add, remove, move left and
    move right, so that every `:col` operation has a place to be clicked.
12. As a writer, I want `^←` and `^→` to move the selected Column, so that the
    operation is on the keyboard and not only under the mouse.
13. As a writer, I want the selection drawn on screen for as long as it exists
    and dropped when the cursor leaves the Run, so that there is never a
    selected Column I cannot see.
14. As a writer, I want to click a Cell and land in that Cell, so that editing
    the third Cell of the fourth row is one gesture.
15. As a writer, I want the strip to disappear when the cursor is not in a Table
    Run, so that it is not chrome on a document that has no tables.
16. As a writer, I want a Column operation from the strip to be one undo step,
    the same one `:col` produces.
17. As a writer, I want `×` on a Run one Column wide to be refused and say why,
    as the command is.

## Implementation Decisions

### Link placement

- `editor/editor.js` gains `addLinkAt(text, wording, href, at, end)`, beside
  today's `addLink`. It is model work and is tested in node. `addLink` stays and
  keeps its callers: appending is still what `a` does outside editing.
- The caret offset and selection extent are DOM facts, so `editor/ui.js` reads
  them off the editing span before the overlay opens and hands them in as
  numbers. `editor.js` is never told about a Selection — the split ADR-0005 and
  AGENTS.md draw between the two files holds.
- `^K` is bound on the editing span's own keydown handler, beside the `Tab`
  that walks Cells, and calls `preventDefault()`.
- Committing restores the edit box from the model and puts the caret after the
  inserted link, so the writer carries on typing where they left off.

### The Table strip

- Drawn by `editor/ui.js` from `doc.columns(doc.cur)`, which already exists and
  already returns the heading Cells padded to the Run's width. No new model
  call is needed to draw it.
- The selected Column is a number held in `ui.js` beside the pane and swap
  state, not on the Doc and not in the history. `render()` clears it when
  `doc.tableRun(doc.cur)` is null or names a different Run.
- The four controls call `doc.column(op, n)` — the same entry point, the same
  refusals, the same one-rewrite-is-one-history-entry.
- Clicking a Cell computes which Cell was hit from the click offset, then uses
  the existing `caretToCell(span, n)`.
- The strip is write-pane chrome and is not rendered into the read pane, does
  not reach `renderDoc`, and has no expression in the exported markdown.

## Testing Decisions

The seams already exist and no new one is introduced.

### 1. `editor/editor.js` under node, via `tests/js-model.js`

Where the link placement lives, and the only half of this release that is
model work.

- `addLinkAt` with a caret in the middle of a Paragraph puts the link there and
  leaves both halves of the text intact.
- With `at === end` (a caret, no selection) nothing is replaced.
- With a selection, exactly the selected span is replaced.
- At offset 0 and at the end of the text, for the two edges.
- A link with no wording, and one with no href, behave as `mkLink` already
  says they do — no new rule about emptiness is introduced here.
- `addLink` is asserted unchanged, byte for byte, so appending has not moved.
- `Doc.prototype.column` is untouched and its existing assertions stand.

### 2. `tests/editor-probe.js` in a browser

Everything else here is DOM, which is what the probe is for and what
`bin/test` cannot run.

- `^K` with a selection inside an open edit box opens the overlay with the
  selection in `wording`, and committing replaces the selection in the Line.
- `Esc` leaves the Line's text identical.
- A Table Run draws a strip with one entry per Column carrying the heading
  text; a document with no Table draws none.
- Clicking an entry selects it, `+ × ‹ ›` operate, and `×` at width 1 is
  refused with the command's own message.
- Clicking a Cell opens that row with the caret in that Cell.
- Moving the cursor out of the Run clears the selection and the strip.
- One undo takes back a strip operation entirely.

### 3. `php bin/test`

Unchanged and must stay green. Nothing in this release reaches the PHP half,
the exported markdown, or the rendered page.

## Out of Scope

- **A Cell cursor and a grid editing mode.** `h`/`j`/`k`/`l` between Cells,
  editing one Cell as its own field. Rejected in ADR-0015 and still rejected;
  everything here is an affordance over the Line model, not a way around it.
- **Selecting more than one Column**, and any Column-range operation.
- **Dragging a Column in the strip to reorder it.** `‹` and `›` move one step,
  which is `J`/`K` for rows written sideways. Drag is a second interaction for
  the same operation and can come later if the step proves tedious.
- **Column alignment, width, or a heading that is not just the first row.** A
  Column still has no identity and carries no properties — ADR-0015.
- **A remembered Column that survives the cursor leaving the Run.**
- **Inline images, linked images, and any new inline syntax.** Unchanged from
  0.1.8's exclusions: none of the three implementations of the line model
  change in this release, which is what keeps ADR-0003 out of it.
- **A link picker in the read pane**, and any editing from the preview.
- **`a` inserting at a caret on a Line that is not open for editing.**
- **Pushing and packaging.** As ever, the maintainer's own call.

## Further Notes

- The line model's three implementations do not change: no new markdown syntax,
  no change to what a Line exports, no change to `inline()` in either half. The
  cross-implementation risk ADR-0003 guards is not engaged.
- `docs/keymap.md` and the `?` overlay's hand-written key table each need a
  line for `^K`. The `?` overlay's command table is generated and needs nothing.
- ADR-0015 needs no amendment and should not get one. This release is what it
  described as the alternative to a grid: affordances over Lines. If the strip
  turns out to want a Cell cursor after all, that is the moment to reopen it,
  and a superseding ADR is how.
