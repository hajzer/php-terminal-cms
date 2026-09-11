# 06 — One control treatment, both themes

Status: done
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

- [x] `php bin/build` run, and `php bin/test` green (it fails if a generated file is
  stale)
- [x] Reader page and Editor checked by eye in **both** themes
- [x] Keyboard focus visible on every control in both halves — every control a
  tab can reach; the Legend's chips are not among them, see Comments
- [x] A diff that contains no layout, spacing or sizing changes

## Comments

Done in `487e01a` — "controls: one treatment, both themes". CSS only: no
markup, no JS, so `tests/editor-probe.html` needed no run.

`shared/theme.css` gains ten properties at the end of the token block, each
derived from the tokens above it, so both modes follow without restating any
of them and an Instance's accent flows through:

| Property | Is |
| --- | --- |
| `--ctl-fg` `--ctl-bg` | the resting ink and the resting box |
| `--ctl-line` | the edge's colour, for a control that has a border of its own |
| `--ctl-edge` | the same edge as an inset shadow, for one that has not |
| `--ctl-fg-hover` `--ctl-bg-hover` | the answer to a hover |
| `--ctl-line-hover` `--ctl-edge-hover` | the same edge, in the accent |
| `--ctl-ring` `--ctl-ring-offset` | the keyboard's mark, pulled inside the edge |

Applied in `site/public/site.css` to the reader's `A−` `A+` `theme`; in
`editor/editor.css` to the top bar, the zoom, the Legend, the run bar's copy
button and the fold row; and in `shared/theme.css` itself to the copy button
on a Code block and the fold on an Output Run, which the page and the read
pane share.

Nothing moves and nothing changes size: the edge is a shadow and the ring an
outline with a negative offset, so a control's box is the size it always was.
Every `padding`, `height` and `font-size` in the diff has a byte-identical
counterpart on the other side, re-typed only because a colour beside it
changed.

Four things settled here:

- **The Legend's chips stay a click and a finger, not a tab stop.** `drawLegend()`
  emits `<b>` elements with no `tabindex`, and every chip prints on its own face
  the key that already does the same thing — so tab stops would buy a keyboard
  user a slower second path to one keypress, and charge every keyboard user
  nineteen Tab presses for it. `Tab` also has a job as of issue 03. The real
  gap is semantic, not focus: a `<b>` with a click handler is not announced as a
  button, and `tabindex` would not fix that — it would be focusable, still
  unannounced, and still deaf to `Enter`. The fix is real `<button>` elements in
  `drawLegend()`, which is its own ticket, not a line of CSS. `docs/keymap.md`
  and `README.md` already describe the Legend as the mouse and touch affordance
  it is, so issue 07 has nothing to correct here. A rule that could never match
  was written and then removed rather than left in the file.
- **The arrow on a fold is not the affordance; the box is.** The first cut put
  the accent on the reader's `summary::before` and on `.foldrow .lbl i`. The
  second of those is the line count, not an arrow, and the write pane's arrow
  is a bare character inside `.lbl` that CSS cannot reach on its own — so one
  half would have gone accent and the other could not follow. Both are back to
  `--faint`, and the resting edge carries the affordance in both places.
- **A disabled button loses the box, not just the answer.** Undo and redo keep
  the box at first, which reads as pressable when it is not. They now drop the
  background and the edge and are bare faint text, and one selector list covers
  the resting and the hover state rather than restating the edge.
- **The ring is one rule per file, placed last.** Fourteen restatements became
  one grouped rule in each of the three files. In `editor.css` it has to sit
  after every rule that does `all: unset`, or that reset would wipe the
  treatment set earlier in the file, and it excludes the file name while it is
  being edited, whose accent box is the same mark said once.

Two things pulled back out, as beyond what this issue asked for: focus rings on
the site's chrome links, and a hover restyle on the address overlay's link list
and its input field.

`php bin/test`: 478 passed, 0 failed. `shared/theme.css` byte-identical to both
generated copies. Both themes checked by eye — the reader page and the Editor,
and a harness putting rest, hover and focus side by side for the copy button and
the fold, which confirms the ring draws inside the control and is not clipped.
