# 02 — The address overlay, and the Image preview

Status: ready-for-agent
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

- [ ] `a` on a Paragraph with two links opens the picker; picking the second fills
  the form with the second link
- [ ] one link → form directly; no links → empty form directly
- [ ] `Tab` between fields; `Enter` changes the Line's text; `Esc` does not
- [ ] empty href unlinks and keeps the wording; empty wording is refused with a
  message
- [ ] a rejected href warns and still commits
- [ ] `a` on a Code Line says so and changes nothing
- [ ] `a` on an Image Line offers src and caption; a committed caption reaches the
  export
- [ ] one committed overlay is one `^Z`

- [ ] `php bin/test` green

## Note

This makes the Editor page issue its first outbound request. The wording change
that follows from it is issue 07, not this one.
