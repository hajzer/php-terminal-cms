# 01 — The body-colour prototype, judged by eye

Status: done
Spec: ../spec.md

## What

`../prototype/body-colour.html` shows one article, rendered by the real
Renderer, in all twelve Themes and both Palettes, in three modes: today, A
(derived tints) and B (derived tints plus tokens ported from each Theme's
source). A slider scales every tint. `../prototype/notes.md` records where each
ported value came from and which were darkened for contrast.

This issue is the maintainer's verdict, which issue 03 builds.

## Scope

- Choose A or B, and the tint strength.
- For B, keep or drop each ported value. The prototype's own suggestions:
  drop GitHub's dark green headings (`#7ee787`, loud and not GitHub's look),
  and give Underwater's table head A's tint instead of its solid iris.
- Note anything else that reads loud, dull or unreadable.

## Acceptance

- [x] A or B chosen, and the strength written down here as the slider's value
- [x] Every ported value kept or dropped, listed here
- [x] Every Theme in both Palettes looked at

## Comments

**Verdict (maintainer, 2026-10-04).** **A: derived tints, at 200%.** No ported
token is kept: B and every value it ported are dropped, so a Theme's body
colour comes from its own `--accent` and `--primary` alone.

Added on the maintainer's word: **code blocks take a tint too**, the way
Material Flat's PHP block already looks — its bar and its body lavender from
its accent — and every Dialect the same way, Code and CLI alike. The prototype
now has it: `--t-codebar` (bar, CLI body, output) and `--t-code` (a Code
block's body), accent into `--bg`, calibrated so that at 200% Material Flat's
derived bar and body land on its own `--block-bg` and `--code-bg` (light:
`#e8e2fa` against `#e7e2f8`, `#f6f4fd` against `#f7f2fc`).

The strengths at 200%, which issue 03 writes into the sheet as they are:

| token | base | at 200% | what |
|---|---|---|---|
| `--t-wash` | 8% | 16% | Note background, accent into bg |
| `--t-head` | 12% | 24% | table head, primary into bg |
| `--t-zebra` | 4% | 8% | every other row, primary into bg |
| `--t-bar` | 70% | 100% (capped) | quote and Note bar, accent into border |
| `--t-ink` | 28% | 56% | h1/h2 text, accent into fg-strong |
| `--t-ink3` | 45% | 90% | h3 text, accent into secondary |
| `--t-bold` | 18% | 36% | bold, accent into fg-strong |
| `--t-rule` | 45% | 90% | the rule, accent into border |
| `--t-codebar` | 9% | 18% | Code/CLI bar, CLI body, output, accent into bg |
| `--t-code` | 3.5% | 7% | Code body, accent into bg |

Measured at 200% in Chromium: code and CLI text stay at or above 4.4:1 in
every Theme and Palette (Retroma light, which is 4.5–5.1 today). **The table
head's text falls below 4.5:1** where it was above it: Underwater light 3.8
(today 4.6), Underwater dark 3.2 (5.2), Wasp light 3.8 (4.6), Retroma light
4.0 (4.6). Issue 03 fixes that without lowering the tint for every Theme. The
block bar's `--faint` language label is about 2:1, as it is today.

