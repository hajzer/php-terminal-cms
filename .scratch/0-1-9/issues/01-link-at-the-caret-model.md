# 01 — A link where the caret is: the model half

Status: done
Spec: ../spec.md
Commit: 1 of 8 — "editor: a link where the caret is"

## What

Putting a link somewhere other than the end of a Line's text, with no DOM in it.
Lives in `editor/editor.js` so `tests/js-model.js` can drive it under node —
`editor/ui.js` is keyboard, mouse and DOM only (AGENTS.md, ADR-0005).

`addLink` appends, always. That was 0.1.8's decision and its story 7, and in
use it means a writer makes the link at the end and then cuts `[wording](href)`
out of the tail and pastes it into the sentence. The model needs to be able to
put one at an offset.

## Scope

- A new function beside `addLink`: put a link into a Line's text at an offset,
  replacing the span between two offsets. A caret is the case where the two
  offsets are equal.
- It takes offsets as numbers. It is never told about a Selection, a Range or a
  node — those are `ui.js`'s business and they stop at the boundary.
- Offsets that do not describe a span inside the text are clamped rather than
  refused: `ui.js` reads them off a live DOM, and a stale offset should not
  corrupt a Line.
- It reports where the inserted link ends, so `ui.js` can put the caret
  after it.
- The rules about emptiness do not change and are not restated: what `mkLink`
  already does with an empty wording or an empty href is what happens here.
- `addLink` stays, unchanged and still used — appending is what `a` does on a
  Line that is not open for editing.

## Out

No new markdown syntax. No change to `inline()` in either half, to what a Line
exports, or to the link pattern itself — this writes the same `[wording](href)`
that is already written, in a different place in the string. ADR-0003's
three-implementations rule is not engaged.

## Acceptance

`node tests/js-model.js` covers, and passes:

- [x] a caret in the middle of a Paragraph puts the link there, both halves of
  the text intact byte for byte
- [x] a caret at offset 0, and a caret at the end of the text
- [x] a selection is replaced by the link, and exactly that span
- [x] a selection covering the whole text
- [x] inserting into an empty text
- [x] inserting beside an existing link leaves that link untouched, and the Line
  then reports two links in the order they appear
- [x] offsets past the end, negative offsets, and a start after its end, each
  clamped to something sane rather than corrupting the text
- [x] the reported end offset is where the caret belongs, for a caret and for a
  selection
- [x] no wording, and no href, behave exactly as `addLink` and `setLink` already
  do — no new rule about emptiness
- [x] `addLink` is asserted unchanged, byte for byte, so appending has not moved

Then:

- [x] `php bin/test` green
- [x] `tests/js-inline.js` untouched and still passing
