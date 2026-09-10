# ADR-0006 — The Editor does not know the Category list

**Status**: accepted · 2026-09-09 · amended by [ADR-0009](0009-the-editor-names-the-file.md)

## Context

The Editor used to be told the Category list. `editor/index.html` ended with

```js
window.CATEGORIES = ['about', 'guides'];
```

which drew a category bar across the top of the page, exactly like the public
site's navigation, and supplied the first category as the default for a document
that had none. `docs/config.md` called it "the one duplication the design did
not manage to remove".

It was a duplication, and it was also a lie about what the Editor is. The bar
looked like navigation and navigated nowhere; clicking a category did not open
anything, it edited a Meta Line on the document in the tab. Two installations of
the same code had to differ in an HTML file, which contradicts Site Config being
the only thing that differs between Instances. And a writer editing a document
whose category was not in the list saw a bar with nothing selected, with no way
to say what the document actually was.

## Decision

The Editor knows nothing about Categories. A document's Category is a Meta Line
like any other, written with `m`, `:cat` or `:meta category`, and the Editor
reads it for one purpose: to say which directory the file belongs in.

The top bar carries what the Editor actually does to a document instead — Open
.md, New .md, Clear, undo, redo — and the tab bar shows the resulting path.
(ADR-0009 later narrowed that to the Name alone, with the path shown by `E`.)

## Consequences

- `window.CATEGORIES` is gone. The Editor is now byte-identical across every
  Instance, and Site Config really is the only per-instance file.
- A category the site does not have can be typed. The writer finds out on
  deployment, by the same 404 the URL would give — the Editor never validated
  it against the running site anyway, only against a hand-copied list.
- A document with no Category is legal, and belongs at the top of `content/` —
  which is where `content/index.md`, the home page, already lived.
- Nothing about the format changed: the `category:` Meta Line is what it always
  was, and the site still routes on it.
