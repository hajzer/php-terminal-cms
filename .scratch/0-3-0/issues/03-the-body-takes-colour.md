# 03 — The body takes the Theme's colour

Status: ready-for-agent
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

- [ ] `bin/test` green
- [ ] `bin/test`: the contrast check, failing on the prototype's 200% table head
- [ ] The public page and the Editor's preview match the prototype's mode A at
  200% in every Theme and both Palettes, with the table head fixed, looked at
  in Firefox
- [ ] ADR-0026 written — A over B and why, the code block's calibration on
  Material Flat; ADR-0018 marked amended; `docs/themes.md` updated

## Comments
