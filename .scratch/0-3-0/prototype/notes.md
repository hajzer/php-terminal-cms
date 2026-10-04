# Body colour prototype — notes

PROTOTYPE, throwaway. Question: how much colour should a Theme put into the
article body (0.3.0, option B of the grilling: derived tints plus a few
ported tokens)? Open `body-colour.html` straight from disk; it links the real
generated sheets in `site/public/`. `?mode=today|a|b` or the bottom bar.

## Modes

- **today**: the 0.2.0 sheet, untouched.
- **a: derived tints**: each Theme's own `--accent` / `--primary`, mixed in
  with `color-mix(in srgb, …)` at low strength. That covers the Note's wash
  and its 3px bar, a tinted table head with faint zebra rows and table borders,
  a 3px quote bar, h1/h2 text pulled a little toward the accent, an
  accent-tinted h3 and `##` mark, bold, the rule, and the list dash. The
  strengths are `--t-*` on `:root`, and the slider scales them all from 0 to 250%.
- **b: derived + ported**: everything in (a), plus the optional tokens `--h1 --h2 --h3 --strong
  --table-head --table-head-ink`, only where the Obsidian source sets them
  by default (no style-settings class applied). An unset token falls back
  to (a)'s tint. `--note` was planned but no source defines a plain callout colour
  by default, so it stays derived everywhere.

## Ported values (resolved in Chromium from each source's `theme.css`)

| Theme | light | dark | source variable |
|---|---|---|---|
| github | — | h1/h2/h3 `#7ee787` | `--h1/2/3-color` |
| retroma | h1/h2/h3 `oklch(0.5 0.1 26.4 / 64.0 / 102.5)` | `oklch(0.75 0.15 …)` | `--rtm-color-red/orange/yellow` |
| reverie | `#063530` `#073d38` `#084540` | `#c1dde1` `#8ab8bd` `#56a7b0` | `--h1/2/3-color` |
| shimmering-focus | strong `#dc388f`, table-head `#d9dbe8` | strong `#ed5aa8`, table-head `#303241` | `--bold-color` (= text-accent-hover), `--table-header-background` (= bg5) |
| things | h3 `#2b73d7`* | h3 `#3986f2`* | `--h3-color` = `--blue` `#2e80f2` |
| underwater | h1 `#b4637a`, h2 `#cc7c78`*, h3 `#9d6923`*, strong `#b4637a`, table-head `#907aa9` on `#fffaf3` | h1 `#eb6f92`, h2 `#ebbcba`, h3 `#f6c177`, strong `#eb6f92`, table-head `#c4a7e7` on `#1f1d2e` | love / rose / gold / iris / surface |
| wasp | `#9a4e12` `#924e14` `#8f5514` | `#f8c537` `#e8d49a` `#d49335` | `--h1/2/3-color` |
| baseline, flexoki, material-flat, minimal, origami | — | — | no default body colours (Minimal and Origami have coloured headings only as an opt-in setting) |

\* adjusted for contrast. Things' `#2e80f2` is 3.83:1 on light and 4.23:1 on
dark, nudged to 4.5:1. Underwater light's rose `#d7827e` (2.74:1) and gold
`#ea9d34` (2.16:1) are darkened in their own hue to 3:1 (h2) and 4.5:1 (h3).
A ported value has to pass the same contrast bar as everything else, which
the real implementation's `bin/test` can hold to.

## Findings

- Contrast in every mode: nothing new fails. `em` and links below 4.5:1 in
  Baseline, Flexoki, Origami, Retroma, Shimmering Focus and Things is a
  **pre-existing** property of those Themes' `--accent`/`--primary`, the
  same in `today`.
- **github dark** in b: the source's default heading colour resolves to
  green `#7ee787`, which is loud and not how GitHub reads. It's probably a
  leftover default, so it's a candidate to drop.
- **underwater** in b: the solid iris table head is the one "extrovert"
  element, faithful to the source but louder than the rest of the
  proposal. A candidate to tone down to the derived tint.
- (a) alone already gives every Theme a recognisable colour in the body.
  (b) mostly matters for Reverie, Wasp, Retroma and Underwater, whose
  sources colour their headings.

## Verdict

Mode A at 200%, plus the code-block tint (`--t-codebar`, `--t-code`) added afterwards on the maintainer's word; B dropped. See issue 01.
