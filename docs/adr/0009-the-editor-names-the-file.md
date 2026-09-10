# ADR-0009 — The Editor shows the Name, not the path

**Status**: accepted · 2026-09-10 · amends ADR-0006

## Context

ADR-0006 moved the Category out of the Editor's chrome and had the tab bar show
the resulting path instead: `content/news/my-post.md`, as a dimmed directory
with the Name after it.

Two of those three parts are not the writer's to set there. The directory is
whatever the `category:` Meta Line says, and the Editor only echoes it; only the
Name can be clicked and typed into. Showing all three made the widget look like
a path field, put a click target next to two things that ignore clicks, and cost
the Name the width it wanted on a narrow window.

## Decision

The tab bar shows the Name. The path — directory and Name together — is shown
by `E`, where it is the answer to the question the writer is actually asking:
where does this file go?

## Consequences

- The Name is what the writer sets and what the tab bar shows, and the two are
  now the same thing.
- The Category is still visible, in the Meta Line that defines it and in the
  export overlay that resolves it.
- `tests/editor-probe.html` asserts the directory through the export overlay
  rather than the tab bar, so the behaviour ADR-0006 established — a new
  Document keeps the Category it was filed under — is still covered.
