# 09 — The write pane has the read pane's measure

Status: ready-for-agent
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

- [ ] in write mode the write surface's computed width equals the read pane's,
  within a pixel
- [ ] switching write → read → write leaves the measure the same in both
- [ ] split mode is unchanged: both panes fill their halves
- [ ] `+` and `-` still scale the content, and the measure follows as it does
  today in each mode
- [ ] the surface is still centred in the pane
- [ ] the write surface is still capped — a very wide window does not produce an
  uncapped line length

Then:

- [ ] `php bin/test` green
- [ ] the probe green in a browser, with its count noted in the comments
- [ ] looked at on a wide window and a narrow one, in both themes
