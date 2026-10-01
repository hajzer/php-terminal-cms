# ADR-0021 — The preview keeps the tab

**Status**: accepted · 2026-10-01 · related to ADR-0003, ADR-0020

## Context

The Editor holds one Document in the browser tab and nowhere else. Its read
pane is the page the site will make, and `bin/test` holds the two renderings
to the same bytes (ADR-0003) — so a Link in the preview is a real `<a href>`,
and the site's default rendering opens a Link in the tab it is clicked in.

Two ordinary gestures therefore took the tab, and the Document with it: a
click on a Link in the read pane, and a URL or a run of text let go of over
the page, which the browser opens. The page reloaded as the starter document
and `^Z` had nothing to bring back. The third review found it and left it,
because each answer changes what the preview is or what the page refuses.

## Decision

The markup stays the page's, and the gestures are the Editor's.

- **A click on a Link in the read pane is sent to a tab of its own.** The
  Editor's DOM half sets `target="_blank"` and `rel="noopener noreferrer"` on
  the element as the click passes. `renderDoc()` writes what it wrote: the
  preview's HTML is still byte for byte the site's default rendering, and the
  comparison in `bin/test` is untouched. A fragment stays in the pane and a
  `mailto:` never leaves the page, so both go as written. A link a Diagram
  draws — a `click` statement's, or an `<a>` in a label — goes the same way,
  because the rule is about the pane, not about who wrote the link.
- **A drop is a file to open, or it is refused.** The page's `drop` listener
  stops the browser's own handling of whatever carries no file, and says so.
  The one drop left to the browser is text let go of over a box that is being
  typed in — an open Line, the command line, the Name, the address overlay's
  fields — which the browser puts there.

## Consequences

- Neither gesture can lose the Document. A Link in the preview behaves as the
  site's `link_open: 'tab'` does, whatever the Instance's own setting, which
  the Editor is never told.
- The read pane's markup after a click differs from what `renderDoc()` wrote
  by the two attributes, until the next redraw writes it again. Nothing reads
  the pane's markup back.
- Closing the tab, reloading it and going back still lose the Document, and so
  would markup that reached the page and navigated on its own, which the
  Editor's policy does not govern (ADR-0020).
- The probe drives both gestures and asserts the Document is what it was.

## Rejected

**A `beforeunload` guard.** The browser's own "leave this page?" would cover
every way out at once, and would also ask on every deliberate close of a tab
with writing in it. It answers a different question — whether leaving was
meant — where this one is that a click in the preview should not be leaving
at all. It can be added later without undoing this.

**Rendering preview links with `target="_blank"`.** It would make the preview
a rendering the site does not make by default, and the byte comparison between
the two halves would have to carry an exception for it.
