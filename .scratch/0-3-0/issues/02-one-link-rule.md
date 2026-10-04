# 02 — One link rule for the whole page

Status: ready-for-agent
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

- [ ] `bin/test`: the hover pair check, failing on today's `site.css`
- [ ] A footer, doc-foot and Language link hovered in every Theme, both
  Palettes: readable, and the same fill as an article link
- [ ] The top navigation unchanged

## Comments
