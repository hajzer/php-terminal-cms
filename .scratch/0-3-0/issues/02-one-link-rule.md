# 02 — One link rule for the whole page

Status: done
Spec: ../spec.md

## What

Every link on a public page is drawn as the article's link is: the same
underline and the same hover. The site footer, the doc-foot and the Language
indicator only rest in `--secondary`. The top navigation, a menu, keeps its
own rule. The footer link whose hover text vanishes in Baseline (`--accent`
text on a `--primary` fill, both `#8666ee`) is the bug this fixes.

## Scope

- `site/public/site.css`: `.site-foot a`, `.doc-foot a`, `.languages a` set
  `color: var(--secondary)` at rest and nothing else; their `:hover` rules go.
  `.topbar nav a:hover` sets both `color` and `background`.
- `shared/theme.css`'s `.reader a` / `.reader a:hover` stay the one rule.
- `bin/test`: in both sheets, no `a:hover` rule sets `color` without
  `background` or `background` without `color`.

## Out

The Editor's chrome, which has no footer. Any colour token change.

## Acceptance

- [x] `bin/test`: the hover pair check, failing on today's `site.css`
- [x] A footer, doc-foot and Language link hovered in every Theme, both
  Palettes: readable, and the same fill as an article link
- [x] The top navigation unchanged

## Comments

**Done (2026-10-04).** One deviation from Scope, and why. The regions do not
set `color: var(--secondary)` on their links: they set `--link`, and the
reader sheet's `.reader a` rests in `var(--link, var(--primary))`. A `color`
set on a link by `site.css` ties or outranks `.reader a:hover` — `.languages
a.on` and `.reader a:hover` are both (0,2,1), and `site.css` loads later — so
hovering the Language being read painted `--accent` on the `--primary` fill,
the footer's bug in another place, which the hover-pair check alone does not
see. `.languages a.on` still rests in `--accent`, as the one being read.

`bin/test`'s `link styles` section: a link's hover sets ink and ground together
in both sheets; no rule draws a link (colour, background, border, underline
colour, opacity, filter, `all`) but the reader sheet's own, the top bar's and a
Listing's rows; the regions that set `--link` are exactly the two footers and
the Language indicator. All of it fails on 10d2f60's `site.css`.

Checked in headless Chromium, every Theme in both Palettes: the site footer's,
the doc-foot's and both Language links rest underlined and hover with exactly
the article link's ink and fill. The top bar's rules are untouched. On a
coarse pointer a Language link's hover fill is its 44px tap box, not the
word's — there is rarely a hover there to see. The probe is 299 of 299 in
Chromium and Firefox.

