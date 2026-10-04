# 10 — Full View

Status: ready-for-agent
Spec: ../spec.md

## What

Every Image and Diagram on a public page carries a visible magnifying glass
that opens it alone over the page, fitted or at its own size, and saves it: an
Image as its file, a Diagram as SVG or `.mmd`. Added by the page's script; no
markup or policy change.

## Scope

- `Page.php`'s script: a `button.full` with an inline SVG glass and an
  `aria-label` on each `figure > img` and each placed Diagram (after drawing,
  and after a redraw on a Palette flip). One overlay, `role="dialog"`, focus in
  and restored, Esc, ×, backdrop; a tap toggles fit and 1:1.
- Saves: `<a download>` on the Image's URL; the Diagram's live SVG serialised
  with its placed stylesheet inlined without a nonce; the Run's source as
  `<base>-<n>.mmd`. Blob URLs revoked after use.
- `site/public/site.css`: the button and the overlay in tokens only; a touch
  target of 44px.
- The policy and its `bin/test` pin unchanged; a check that the Renderer's
  output for an Image Line is byte-identical to before.
- `docs/security.md`: the downloads are Blob URLs made from the page's own
  content; no `img-src` change.

## Out

Pinch, wheel or panning. PNG. The Editor's preview.

## Acceptance

- [x] `bin/test`: Renderer markup and policy unchanged
- [ ] By hand in Firefox and Chromium, desktop and phone width: glass visible
  without hover; fit and 1:1; Esc and focus return; all three saves open
  correctly elsewhere (the SVG in its Theme's colours)
- [ ] No console report but the Diagram's known `style-src` ones
- [ ] With scripting off, the page is as before

## Comments

Done in d4e6340. The Full View part of the script goes only on a page with an
Image or a Diagram, so a page with neither keeps its pinned shell hash; `/`
and `/about/everything-is-a-line` were re-recorded. The Diagram is moved into
the `<dialog>` and back (an empty `<svg>` of its size holds its place), since a
copy could lose the styles placement set through the CSSOM. The drawing
announces each placed picture with a `tcms-drawn` event on its block. The
saves are buttons that click a detached `<a download>`: `bin/test` forbids
`site.css` drawing a link.

Checked headless (Playwright, Chromium and Firefox 155, 1280px and 390px with
touch), not ticked: everything in the by-hand line passes, the saved `.svg`
opens on its own in its Theme's colours, the Full View adds no console report
(Firefox's one other line is Mermaid's own parse warning on load), and with
scripting off `figure > img` is as before. The boxes above are still for a
human run.

Choices to look at:
- The saved name's `<base>` is the page address's last segment, so a
  Translation saves as `what-it-is-sk-1.mmd`, not the Media `base`.
- The saved SVG also gets `background-color` of the ground it is shown on, so
  a dark-Palette drawing stays legible in a white viewer.
- "The backdrop" is a tap on the stage beside the picture: the dialog covers
  the screen, so there is no `::backdrop` to tap; at 1:1 a large picture
  leaves only Esc and ×.
- A Blob URL is revoked right after the click, the Editor's export idiom.
  Fine in Chromium and Firefox; Safari, which can cancel such a download, was
  not tried.

