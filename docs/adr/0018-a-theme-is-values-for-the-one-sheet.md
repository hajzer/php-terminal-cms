# ADR-0018 — A Theme is values for the one sheet

**Status**: accepted · 2026-10-01

## Context

The reader sheet, `shared/theme.css`, is one set of structural rules with a
block of custom properties at the top — backgrounds, inks, border, accent,
six syntax colours — and a dark block that overrides them. It is derived from
terminal.css and is monospace throughout. 0.2.0 adds twelve **Themes**, each
derived from an MIT-licensed Obsidian community theme: Minimal, Wasp, GitHub,
Things, Shimmering Focus, Baseline, Flexoki, Reverie, Retroma, Underwater,
Origami and Material Flat. Each of those is, at its source, a whole Obsidian
stylesheet, and several are known by a typeface as much as by a colour.

## Decision

A Theme is a set of values for the tokens the one structural sheet reads, in
both Palettes, and nothing else. The structural rules stay in `shared/theme.css`
and carry no colour, typeface or shape of their own; those become tokens, and
the token set grows by what a recognisable port needs — a body font stack, a
heading font stack, a radius, a heading weight — and no further.

- **One file per Theme**, `shared/themes/<name>.json`: its light and its dark
  Palette as two maps of token to value, its typefaces and shapes, and its
  source's repository, copyright line and licence. `bin/build` writes the
  stylesheet each one describes into both halves, as it writes `langs.js`
  from `langs.json`, with the notice in the stylesheet's first comment. A
  Theme is added by adding a file, and the directory is the list of Themes —
  no name is written down twice.
- **An attribute, not `:root`.** The generated stylesheet defines the tokens
  under `[data-theme="<name>"]` and `[data-palette="light|dark"]`, so one file
  colours a whole page when the attributes sit on `<html>` and one pane when
  they sit on it — which is how the Editor draws its preview in the Document's
  Theme and its chrome in the writer's.
- **System typefaces only.** A Theme's font stack starts with what its source
  uses and falls through to what a reader already has. No font file is
  shipped and no font origin enters the policy. Code keeps the one monospace
  stack in every Theme.
- **The public page loads one Theme**, as a second stylesheet beside the
  structural one. The Editor links all twelve, since it runs from `file://`
  and can load nothing on demand.

## Consequences

- Every Theme is the same page recoloured. What a page contains and where its
  parts sit never differ between two Themes, which is what keeps the agreement
  test meaningful: the Renderer and the Editor emit one markup, and a Theme
  cannot ask for another.
- A port is reading values off a source theme's own custom properties, not
  re-styling. A port is therefore also lossy: Things without Inter installed
  is Things in the reader's system sans, and a source theme's structural ideas
  do not come across.
- `bin/test` can hold a Theme to a contract — every token, in both Palettes,
  in every file, and no colour literal left in the structural sheet — because
  a Theme is data, and the dark block that the browser-preference fallback
  needs twice is written once and generated twice.
- A structural fix is made once. With twelve full sheets it would be made
  twelve times, and nothing in the suite could tell when one was missed.

## Rejected

**Whole stylesheets, one per Theme.** The faithful port, and twelve copies of
every structural rule to keep in step by hand.

**Colours only.** The cheapest port, and one in which Things, Minimal and
GitHub are three greys on the same monospace page.

**Shipping the typefaces.** Pixel-exact, several hundred kilobytes per family
in two copies, each under a licence of its own, and a `font-src` the policy
has never needed.
