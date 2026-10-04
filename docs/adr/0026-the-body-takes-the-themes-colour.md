# ADR-0026 — The body takes the Theme's colour, from the sheet

**Status**: accepted · 2026-10-04 · amends ADR-0018

## Context

ADR-0018 made a Theme a set of values for the tokens one structural sheet
reads, and grew the token set "by what a recognisable port needs, and no
further". The body spent almost none of what it was given: every heading was
`--fg-strong`, a table head `--block-bg`, a quote a `--border` line, and a
Note the one place `--accent` appeared. Five Themes' light Palettes are white
with near-black text, so switching between them moved the links and little
else.

A prototype set one article in all twelve Themes and both Palettes three ways:
as it was; with tints derived from each Theme's `--accent` and `--primary`
(A); and with those tints plus heading, bold and table-head colours ported
from the Themes' Obsidian sources where a source sets them (B). The maintainer
chose A, at twice the prototype's starting strength, and asked for code blocks
to be tinted the way Material Flat's already were — its bar and its body
lavender from its accent — in every Dialect alike.

## Decision

**The body's colour is the structural sheet's, derived from the tokens a Theme
already gives.** Headings, bold, the `##` marks, the list dash and the rule
lean toward `--accent`; a Note is a wash of it with a bar of it; a table head
and every other row are tinted toward `--primary`; a block's bar is `--accent`
at the strength that reproduces Material Flat's own `--block-bg`, and its code,
CLI and output sit on a lighter wash at the strength that reproduces its
`--code-bg`. Each derived colour is declared once, in the block a Theme
recomputes, as a `color-mix()` of tokens; the strengths are the sheet's and
the same in every Theme. No Theme file changes and no token is added.

**Text on a tinted ground leans toward the far end of the scale** — black on a
light page, white on a dark one, derived from `--bg` — by as much as keeps it
at 4.5:1 wherever it was at 4.5:1 on the plain ground. It keeps its hue. A
table head's ink leans most: in Underwater, Wasp light and Retroma light
`--fg-strong` was already within a few hundredths of 4.5:1 on the plain head,
so any tint at all took it below.

## Consequences

- A thirteenth Theme is tinted the moment its file exists, and a Theme author
  has nothing more to port.
- `bin/test` evaluates the sheet's own declarations in every Theme and both
  Palettes and fails any body text the tints take below 4.5:1 that was at or
  above it before. It reads `color-mix()` in srgb and oklab and the one
  relative colour that names the far end; a colour written any other way is a
  failure, not a pass.
- The far end is `oklch(from var(--bg) calc(1 - round(l)) 0 0)`: relative
  colour syntax and `round()`, which current Firefox and Chromium compute as
  the suite does. A browser without them finds every leaning ink invalid when it
  computes it, and the element takes the colour it inherits: an h3, the list
  dash, a table's text, a Note's tag, a CLI prompt and an output are in the
  text colour around them, and code inside a block loses its syntax colours to
  the block's plain text. The grounds, which do not lean,
  are tinted all the same.
- Syntax colours inside a block lean as well, so a Theme's syntax palette is
  a little darker on a light page and a little lighter on a dark one than its
  source's. Inline `code` and the Editor's own chrome keep `--code-bg` and
  `--block-bg` as they were.
- A Theme's character in the body is its hue, never its source's choices: an
  Obsidian theme that colours its headings differently from its accent is not
  followed.

## Rejected

**B, ported tokens.** Optional `--h1`…`--strong` per Theme where a source
defines them. Four Themes gained a recognisable heading colour; GitHub dark's
default heading green was loud and not GitHub's look, Underwater's solid table
head broke the brief, three ported values had to be darkened for contrast, and
seven Themes had nothing to port. The tokens would have been a second
contract to keep for a third of the Themes.

**Capping the table head's tint.** Underwater dark falls below 4.5:1 at half
the chosen strength; a cap low enough for it would have flattened the other
eleven.
