# 03 — The body takes the Theme's colour

Status: done
Spec: ../spec.md
Blocked by: 01

## What

What issue 01 chose goes into `shared/`: **A, derived tints, at 200%**, and
code blocks tinted the way Material Flat's already are — every Dialect, Code
and CLI alike. No Theme file changes; no optional token. ADR-0026 records it
and amends ADR-0018.

## Scope

- `shared/theme.css`: the ten strengths from issue 01's table, at their 200%
  values, as tokens at the top; the Note, the table head and rows, the quote's
  bar, h1–h3, the `##` mark, bold, the rule, the list dash, the Code and CLI
  block's bar and body and the Output section drawn from `color-mix()` of each
  Theme's `--accent`/`--primary` into `--bg` or `--border`, as the prototype
  does. The block's `--block-bg`/`--code-bg` stay what inline `code` and the
  Editor's chrome use.
- **The table head's text** keeps 4.5:1 in every Theme and Palette — the
  prototype's 200% puts Underwater, Wasp light and Retroma light at 3.2–4.0.
  The fix is the head's ink or a cap on its tint, chosen so the other nine
  Themes keep what the prototype shows.
- `bin/test`: in every Theme and both Palettes, computed from the token values
  and the strengths, no body text that is at least 4.5:1 today falls below
  4.5:1; no colour literal in the structural sheet still holds; every
  `color-mix()` names only tokens.
- `php bin/build`; both `theme.css` copies regenerated.
- `docs/adr/0026-the-body-takes-the-themes-colour.md`; ADR-0018 marked amended.
- `docs/themes.md`: the body is tinted from each Theme's own colours, and the
  strengths are the structural sheet's, not a Theme's.

## Out

Any change to the markup either half emits. A thirteenth Theme.

## Acceptance

- [x] `bin/test` green
- [x] `bin/test`: the contrast check, failing on the prototype's 200% table head
- [x] The public page and the Editor's preview match the prototype's mode A at
  200% in every Theme and both Palettes, with the table head fixed, looked at
  in Firefox
- [x] ADR-0026 written — A over B and why, the code block's calibration on
  Material Flat; ADR-0018 marked amended; `docs/themes.md` updated

## Comments

**Done (2026-10-04).** The tints are mode A at 200% as issue 01 records, with
two changes the maintainer decided while this was built:

- **Every ink on a tinted ground leans, not only the table head's.** The
  contrast check holds all body text, not the five elements the prototype
  measured, and at 200% about ninety pairs fell below 4.5:1: h3 and the list
  dash (mostly accent), syntax colours, the CLI prompt, Output and its fold on
  the tinted washes, the Note's tag in Minimal dark, and the head. Each such
  ink leans toward `--far` — black on a light page, white on a dark one,
  `oklch(from var(--bg) calc(1 - round(l)) 0 0)` — by the least that keeps
  it at 4.5:1 plus five points: the head 35%, `--accent-ink` (dash, tag,
  prompt, h3's hue) 25%, syntax inside a block 20%, a cell, an Output and its
  fold 10%. Hues stay; the maintainer chose this over drawing them as the
  prototype did.
- **A CLI body and an Output sit on the code body's 7% wash, not the bar's
  18%.** The bar keeps 18%. At 18% their syntax and output text would have
  needed a 25–35% lean; the maintainer chose the lighter wash.

The strengths are written into each derived colour (`--note-ground`,
`--head-ground`, …) at the top of the sheet rather than as separate `--t-*`
numbers: the suite evaluates the declarations as written, and a percentage
held in a custom property would be one more indirection for it and a reader.

`bin/test`'s `the body's colours` section evaluates every derived colour in
all twelve Themes and both Palettes (sRGB and OKLab `color-mix()`, the far
end, 8-bit rounding), fails a rule that mixes a colour of its own instead of
naming a derived one, and fails any of 28 body-text pairs that would read at
4.5:1 on the plain ground and reads below it on the tinted one. With the
prototype's head ink it fails on Underwater (3.81, 3.19), Wasp light (3.84)
and Retroma light (4.04). Chromium and Firefox compute the same contrasts as
the suite to within 0.02; all 24 panes looked at in Firefox; the probe is 299
of 299 in both.

