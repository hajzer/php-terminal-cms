# 04 — The raw face, and Export .md in the top bar

Status: ready-for-agent
Spec: ../spec.md

## What

Two pieces of Editor chrome that show what already exists.

**Raw** is the reading pane's second face: `toMarkdown(doc.lines)` live,
read-only, in a `<pre>`. **Export .md** is a button for what `E` already does.

## Scope

### Raw

- A second element in the reading pane holding a `<pre>` of the Export bytes,
  redrawn by `render()` whenever the read pane is. It is selectable and
  copyable, and not editable.
- The layout mode is `write`, `read`, `raw` or `split`. Split shows write beside
  whichever reading face was chosen last; `B` swaps as today.
- Keys `v` read, `w` raw, `^B 2` read, `^B 4` raw. Commands `:read`, `:raw`.
  Tabs `write · read · raw · split`, and the status bar's window list to match.
- The reading face split uses is remembered in `localStorage` beside swap and
  zoom, read and written in `try`/`catch` as they are.
- The `?` overlay's key table gains `w` and `^B 4`.
- A paste while raw is showing inserts at the cursor as usual and changes no
  face (spec, *Paste*); 03's listener already does, and this checks it.

### Export .md

- A button `Export .md` in `.acts`, after `New .md`, calling what `E` calls. It
  opens the overlay; it does not download directly. Its title names `E`.
- `?` lists it beside *Open .md* and *New .md*.

## Out

Editing in raw. Highlighting the markdown. A raw view of anything but the
Export bytes.

## Acceptance

`tests/editor-probe.js`, run in a browser, covers and passes:

- [ ] `w` shows raw, and its text is exactly `toMarkdown` of the Document
- [ ] an edit committed in write changes raw
- [ ] split after `w` shows write and raw; split after `v` shows write and read
- [ ] raw is not editable — typing in it changes no Line
- [ ] `^B 4` and `:raw` reach raw
- [ ] the *Export .md* button opens the export overlay
- [ ] a `^V` paste with raw showing adds at the cursor, raw follows it, and the
  face stays raw — 03's probe covers the read face only, because raw did not
  exist yet

Then:

- [ ] `php bin/build` run, `tests/editor-probe.html` regenerated, not edited
- [ ] `php bin/test` green
- [ ] the probe green in a browser, with its count noted in the comments
