# ADR-0011 — A page shows what the Document says about itself

**Status**: accepted · 2026-09-10

## Context

A Document's Meta was the one part of it the public page threw away. The
Renderer filtered every Meta Line out of the body, and the only trace left was
the `date` in the Document's footer, at the bottom, under everything. An author
who wrote `author:` or `updated:` into a Document saw it in the exported
markdown, in the editor's line list — and nowhere on the page.

The Editor's preview did print them, as a `.front` bar above the title. So the
two renderers disagreed about where a Document's own metadata belongs, and the
one a reader actually sees showed the least.

## Decision

Every Meta Line but `title` is printed on the page, in one line directly under
the Document's title, in both renderers. `title` is left out because the title
is already there, as the `H1` above it.

A Document with Meta but no `H1` prints them where the title would have been. A
Document with no Meta gets no such line, not an empty one.

The `date` leaves the Document's footer, which is now the way back to the
Category and nothing else. It has not disappeared — it is under the title, with
the rest of what the Document declares.

## Consequences

- Meta is content, and behaves like it: what an author writes is what a reader
  sees, in the order they wrote it.
- The Editor's preview and the public page now put the same line in the same
  place, which is the property ADR-0003 asks of every rendering decision — the
  three implementations of the line model do the same thing or the suite says
  which one does not.
- Meta is escaped like any other text. A `key: value` cannot introduce markup
  on the page any more than a Paragraph can.
- `Renderer::render()` takes a flag to leave the line off, because the PHP/JS
  agreement test compares block sequences and has to ask both halves for the
  same thing. It is the only argument that class has ever needed.
