# 06 — One control treatment, both themes

Status: ready-for-agent
Spec: ../spec.md
Commit: 4 of 5 — "controls: one treatment, both themes"

## What

Detailing, not a redesign. A visible resting state instead of bare text, a clear
hover, and a real `:focus-visible` ring — the same treatment in three places.

**Nothing moves and nothing changes size.**

## Scope

Express the treatment as a small set of custom properties in
`shared/theme.css`, defined in terms of the existing theme tokens so both themes
follow automatically and the site and the Editor cannot drift. Then apply it:

- **`site/public/site.css`** — the reader's `A−`, `A+` and `theme` buttons.
  These are the only controls a reader ever sees, and today they are bare text
  that many visitors never notice.
- **`editor/editor.css`** — the Editor's top bar buttons (Open, New, Clear,
  undo, redo, `A−`, `A+`) and the Legend strip along the bottom, which is the
  whole interface on a touch screen and wants its buttons clearly separated.
- **`shared/theme.css`** — the fold affordance on an Output Run and the copy
  button on a Code block, which the page and the Editor's read pane share.

## Constraints

- `shared/theme.css` is the single source. `php bin/build` regenerates
  `editor/theme.css` and `site/public/theme.css`; **never edit a generated
  file**, and `bin/test` checks they are current.
- The accent stays the one colour an Instance controls. Do not introduce a
  second configurable colour.
- No layout, spacing or sizing changes.

## Acceptance

- [ ] `php bin/build` run, and `php bin/test` green (it fails if a generated file is
  stale)
- [ ] Reader page and Editor checked by eye in **both** themes
- [ ] Keyboard focus visible on every control in both halves
- [ ] A diff that contains no layout, spacing or sizing changes
