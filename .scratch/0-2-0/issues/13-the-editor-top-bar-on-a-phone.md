# 13 — The Editor's top bar does not fit a phone

Status: done
Spec: ../spec.md
Blocked by: —
Found by: the by-hand round of issue 10, measured in headless Chromium and Firefox

## What

The Editor's top bar is one flex row that never wraps, and `body` has
`overflow: hidden`, so on a screen narrower than the row the right-hand end
is cut off, not scrolled to. Measured at a 360px viewport, the row's right
edge is at:

| tree | right edge | what is cut off |
| --- | --- | --- |
| 0.1.9 | 484px | the zoom controls and the swap button, part of the tabs |
| 0.2.0 | 580px | the same, plus *Clear*, undo and redo |

The 96px this release added are the *Export .md* button and the *raw* tab,
both from issue 04. At 768px and wider nothing overflows in either tree.

The public page and a Page Build fit at 360, 768, 1280 and 1920px in both
browsers, a drawn Diagram included (338px wide at 360, its natural 485px
above that). The README says both halves are built for a touch screen; the
Editor's legend and tap-to-edit are, and the top bar is not.

Since issue 17 the bar holds one more control: the Theme menu, a
`<select id="theme">` after *Clear*. Measured at 360px with a touch pointer
it sits at 463–612px, past the edge with undo and redo, so a phone cannot
reach it either; on a keyboard `:theme` does the same. Whatever layout this
issue chooses has the menu to place as well.

## Why it waits

A choice, not a fix: let the row wrap onto a second line, collapse the
document actions into their icons below some width, move the tabs into the
status bar on a phone, or accept it and say so. Each changes what a phone
shows first, and the probe's measure tests and the by-hand touch check from
0.1.8 would want re-running under whichever is chosen.

## Chosen

The row wraps. The top bar and its document actions wrap onto as many rows as
the window needs, and the tabs already wrapped below 900px; `.app`'s one
column is the window's width, so a row that cannot fit no longer widens the
page. Nothing is hidden or moved, and above the width where it all fits the
bars are as before (30px and 26px, 44px each under a touch pointer).

Measured in headless Chromium and Firefox at 320, 360, 768 and 1280px, with
and without a touch pointer, no control in either bar is past the edge (768px
with touch clipped redo before). The probe gained the same check, and it
holds at any width. It fails on the old sheet at 360px. The by-hand touch
check from 0.1.8 on a real phone is still to do, and so is issue 17's
by-hand box for the Theme menu.

## Acceptance

- [x] at a 360px viewport the whole top bar is reachable, in Chromium and in
  Firefox — nothing is clipped by `overflow: hidden`
- [x] the probe is green, and the write pane's measure tests with it
- [x] the README's touch-screen paragraph is true of the top bar too
