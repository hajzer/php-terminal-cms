# 02 — Markdown in by paste: the model half

Status: done
Spec: ../spec.md

## What

Adding a markdown string to the Document as typed Lines at the cursor, with no
DOM in it. It lives in `editor/editor.js` so `tests/js-model.js` can drive it
under node — `editor/ui.js` is keyboard, mouse and DOM only (AGENTS.md).

*Open .md* replaces the Document. This adds to it.

## Scope

- A `Doc` method that takes a markdown string, parses it with the existing
  `parse()`, and:
  - inserts every non-Meta Line below the cursor, in order, and leaves the
    cursor on the last one inserted;
  - for each pasted Meta Line, replaces the value of the Document's Meta Line
    with the same key **in place**, or appends it after the Document's last
    Meta Line — at the top when the Document has none;
  - reports how many Lines it added and how many Meta it set, for the status
    line.
- The Name rule is not restated: a Name still following `title` follows the new
  title because it already follows `title`, and a Name that was set or came
  from a file stays.
- An empty or whitespace-only paste changes nothing and says so in its report.
- The cursor is taken from the Document, not passed in.

## Out

Any change to `parse()` — what it does with nested lists or raw HTML is what a
paste does with them, the same as *Open .md*. The DOM, the clipboard and
history recording, which are 03's.

## Acceptance

`node tests/js-model.js` covers, and passes:

- [x] Lines land below the cursor in the order written, cursor on the last
- [x] a heading, a list, a table, a note, a fence with a Dialect, a
  ```` ```console ```` fence and an ```` ```output ```` fence become the Types
  *Open .md* makes of them
- [x] a pasted `title:` replaces the Document's `title:` in place, and its
  position among the Meta does not move
- [x] a pasted key the Document lacks is appended after the last Meta Line
- [x] a Document with no Meta receives pasted Meta at the top
- [x] a frontmatter-only paste changes only Meta
- [x] an empty paste and a whitespace-only paste change nothing
- [x] the Name follows a pasted title when it was following, and not otherwise
- [x] a paste at the last Line and at the first Line, for the two edges
- [x] `toMarkdown` after a paste has exactly one frontmatter block and no
  duplicate key

Then:

- [x] `php bin/test` green
