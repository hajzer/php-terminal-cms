# 09 — The write pane has the read pane's measure

Status: done
Spec: ../spec.md
Commit: 6 of 8 — "editor: the write pane has the read pane's measure"

## What

Write mode is narrower than read mode, and there is no reason for it to be.

| pane | cap today | at its own font size |
| --- | --- | --- |
| write, alone | `80ch` at 14px mono | about 670px |
| read | `--page-width`, `62em` at 15px | about 930px |
| write, in split | none — fills its half | — |

Switching between write and read re-flows the document and moves every line the
eye was resting on, for a difference nobody chose: **split mode already uncaps
the write sheet**, so the narrow measure only applies in the one mode where
there is the most room for it.

## Scope

- In write mode the write surface takes the same measure the read pane takes,
  from the same token, so that one value governs both and they cannot drift.
- The two panes have different font bases — the sheet is 14px, the reader page
  is `--global-font-size` — so a token in `em` resolves to a different number in
  each. Getting them to the **same computed width** is the point; pick the unit
  or the basis that achieves it rather than copying the declaration and calling
  it done.
- It stays centred, as both already are.
- Split mode is unchanged: each pane fills its half, which is already right.
- Read mode is unchanged.
- The cap still exists. This is the read pane's measure, not no measure —
  an ultrawide window should not produce a line of text a metre long.
- `--doc-scale` still applies. The measure moves with the content size the way
  each pane's already does, so `+` and `-` behave as they do now.

## Out

Making either pane full-bleed or uncapped. Changing `--page-width` itself, which
is the published page's measure as well and is not this issue's to move. A
per-pane width setting, a draggable divider, or anything the writer configures.
Any change to the gutter, the line grid, the legend or the status line. The
padding, which is already tuned per mode and is not the complaint.

## Acceptance

`tests/editor-probe.js`, run in a browser, covers and passes:

- [x] in write mode the write surface's computed width equals the read pane's,
  within a pixel
- [x] switching write → read → write leaves the measure the same in both
- [x] split mode is unchanged: both panes fill their halves
- [x] `+` and `-` still scale the content, and the measure follows as it does
  today in each mode
- [x] the surface is still centred in the pane
- [x] the write surface is still capped — a very wide window does not produce an
  uncapped line length

Then:

- [x] `php bin/test` green
- [x] the probe green in a browser, with its count noted in the comments
- [x] looked at on a wide window and a narrow one, in both themes

## Comments

Landed in `shared/theme.css` (and the two generated copies) and
`editor/editor.css`.

The measure is now a number rather than a declaration: `--page-measure: 62`,
with both forms of it derived beside each other. `--page-width` is
`calc(var(--page-measure) * 1em)` — the same 62em the published page has always
had, so nothing on the site moves — and `--page-width-px` is the same 62
against `--global-font-size`. The sheet cannot take `--page-width` itself,
because `em` in a `max-width` resolves against the element's own font size and
the sheet's is 14px; it takes the px form and scales it,
`calc(var(--page-width-px) * var(--doc-scale))`, which is the read pane's
number on any content size. Split mode's
`.panes[data-mode="split"] .sheet { max-width: none }` is more specific and
still wins, so that mode is untouched.

Eight assertions in `tests/editor-probe.js`, all of which were red against the
old `80ch` (674.667px against the read pane's 930) before the token landed.
The cap is asserted as a cap that binds — on a window with room to spare the
surface has to stop short of the pane — rather than merely as a number, and
the two assertions that need room for the cap stand down on a window too
narrow to give it, so the probe is green at any width.

`php bin/test`: 526 passed, 0 failed. `tests/editor-probe.html` opened from
`file://` in Firefox: 0 failed of 170, on a 1400px window and on a 760px one.
Looked at at 1600px and at 700px in both themes: capped and centred on the
wide window, filling the narrow one as it always did.
