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

- [ ] `bin/test`: Renderer markup and policy unchanged
- [ ] By hand in Firefox and Chromium, desktop and phone width: glass visible
  without hover; fit and 1:1; Esc and focus return; all three saves open
  correctly elsewhere (the SVG in its Theme's colours)
- [ ] No console report but the Diagram's known `style-src` ones
- [ ] With scripting off, the page is as before

## Comments
