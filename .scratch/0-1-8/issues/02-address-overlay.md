# 02 — The address overlay, and the Image preview

Status: done
Spec: ../spec.md
Blocked by: 01
Commit: 1 of 5 — "editor: link and image overlay"

## What

The `a` key — *address* — and the overlay behind it. DOM, keys and focus only;
all text manipulation comes from issue 01. `editor/ui.js` and `editor/editor.css`
plus the overlay markup in `editor/index.html`.

## Scope

**The overlay, two states.**

- Picker: the links already in the Line, numbered, plus *new link*. Choose with
  a digit or `j`/`k` and `Enter`.
- Form: two fields. `wording`/`href` on a text Line, `src`/`caption` on an Image
  Line. `Tab` between them, `Enter` commits, `Esc` cancels and leaves the Line
  untouched.

**Shortcuts through the picker.** No links → straight to an empty form. Exactly
one link → straight to a filled form.

**Which Lines.** Heading, Paragraph, List, Quote, Note, Table → the link
overlay. Image → the src/caption overlay. Code, CLI, Output, Rule, Meta → a
message, and nothing changes.

**Commit rules.** Empty href unlinks, keeping the wording. Empty wording is
refused with a message. An href the allowlist rejects is marked with what will happen to
it — "not a link the page will make; it will print as text" — and `Enter` still
commits.

**Commands.** `:link` and `:img` open the same overlay. They appear in the `?`
overlay automatically, since it is generated from the command list.

**History.** One committed overlay is one `^Z`. Commit, then `render()`.

**The Image preview.** `editor/editor.js`'s renderer emits a real `<img>` for an
Image Line with an `onerror` restoring today's box containing the src as text.
The caption stays the `<figcaption>` and becomes the `alt`.

## Acceptance

`tests/editor-probe.js` gains, and a browser run is green:

- [x] `a` on a Paragraph with two links opens the picker; picking the second fills
  the form with the second link
- [x] one link → form directly; no links → empty form directly
- [x] `Tab` between fields; `Enter` changes the Line's text; `Esc` does not
- [x] empty href unlinks and keeps the wording; empty wording is refused with a
  message
- [x] a rejected href warns and still commits
- [x] `a` on a Code Line says so and changes nothing
- [x] `a` on an Image Line offers src and caption; a committed caption reaches the
  export
- [x] one committed overlay is one `^Z`

- [x] `php bin/test` green

## Note

This makes the Editor page issue its first outbound request. The wording change
that follows from it is issue 07, not this one.

## Comments

Done. `editor/ui.js` gains the overlay, `editor/editor.js` the Image preview,
`editor/index.html` the markup and the three key rows, `editor/editor.css` the
styling; `tests/editor-probe.js` gains 21 cases.

| Piece | Where |
| --- | --- |
| `a`, `:link`, `:img` | `ui.js` keymap and the `COMMANDS` table |
| picker → form, or straight to the form | `openAddr`, `addrPicker`, `addrForm` |
| the commit rules | `commitAddr` — the only place a Line is written |
| the allowlist warning | `warnAddr`, live on every keystroke |
| the real `<img>` | `renderDoc`'s `img` case |

`node`: `php bin/test` 370 passed, 0 failed. Browser: `tests/editor-probe.html`
run headless in Firefox, 0 failed of 70.

Three things settled here:

- **The preview fetches the src as written**, not through `Renderer::mediaUrl()`.
  Both of those would be defensible, and they disagree: a bare `diagram.png`
  publishes as `/media/diagram.png` but previews relative to the Editor. The
  Note in this issue decides it — an outbound request only happens if the src is
  used as written, since `mediaUrl()` reduces every remote URL to a local path.
  Issue 07's security paragraph says the same thing from the other end. The
  box with the file name in it is what an src that does not load falls back to,
  so the bare-name case is no worse than it was.
- **Unlinking keeps the wording the field shows.** `unlink()` keeps the original
  byte for byte, which is right until the writer edits the wording *and* clears
  the href in the same visit — then their edit would vanish. So the untouched
  case still goes through `unlink()`, and an edited one through `setLink()` with
  no href, which writes the wording alone.
- **A digit beside a picker entry means a key that picks it**, so past the ninth
  there is none to show. `j`, `k` and `Enter` still reach them.

`docs/line-types.md` said the editor "shows a placeholder box, since it has no
server to fetch the image from" — false as of this commit, so it is corrected
here. The rest of the documentation, including `a` and the two commands in
`docs/keymap.md`, is issue 07's, along with the `ui.js` header comment.

