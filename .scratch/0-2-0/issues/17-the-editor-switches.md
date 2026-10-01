# 17 — The Editor switches, and the read pane follows the Document

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 14, 15

## What

A Theme menu in the top bar and `:theme <name>` beside `T` and `:palette`,
as the writer's own preference; the read pane drawn in the Document's
`theme:` where it names one; `Tab` on a `theme:` or `palette:` Meta Line
cycling the valid values; and `metaBar()` leaving `palette` out.

## Scope

- **Model half, `editor/editor.js`.** It reads `window.THEMES` the way it
  reads `LANGS`, and `tests/js-model.js` loads `editor/themes.js` before it.
  A `Doc` method returns the Document's pinned Theme: the value of its
  `theme:` Meta when `THEMES` has it, else null. `Tab` on a Meta Line whose
  key is `theme` cycles `THEMES` in order and wraps, `palette` cycles
  `light`, `dark`; any other Meta Line is untouched. `metaBar()` leaves
  `palette` out beside `title`; the agreement test's sample gains
  `palette:` if 16 left it out.
- **UI half, `editor/ui.js`.** `tcms-theme` stores a name, applied on load
  only if `THEMES` has it, else `baseline`. A `<select id="theme">` in
  `.acts`, after *Clear*, filled from `THEMES` with `label`s, set to the
  current name; choosing sets `data-theme` on `<html>`, stores it, says so
  on the status line. `:theme <name>` does the same and refuses an unknown
  name with the list on the status line; `:theme` alone says the current.
  `:palette light|dark` sets; `:palette` alone flips as `T` does. All four
  are in the `?` overlay's generated command table, and the key table's `T`
  row reads `palette, light ⇄ dark`.
- **The read pane.** `render()` puts the Document's pinned Theme on the
  reading pane's root as `data-theme` with a copy of `<html>`'s
  `data-palette`, and removes both when there is no pin, so the pane follows
  the chrome again. The raw face is unaffected.
- **Diagrams.** The drawings cache is keyed by Theme, Palette and source;
  a Theme change, from the menu or from a `theme:` Meta edit, redraws as a
  Palette flip does, in the Theme the pane is in.
- **The top bar.** The select is one more control in the bar 13 is about.
  Put it where *Clear* is and leave 13's layout to 13; say under 13 that it
  has one more control to place.
- **`docs/keymap.md`**: `T`, `:theme`, `:palette`, the menu; the `theme`
  command row becomes `palette`. `README.md`'s cheat sheet row for `T` and
  its topbar sentence.

## Out

Writing a Meta Line from the menu. Any Editor knowledge of Site Config.

## Acceptance

- [ ] `tests/js-model.js`: the pinned-Theme method and the three `Tab`
  cases in spec §6's last bullet
- [ ] `bin/test`: `metaBar()` and `Renderer::meta()` agree on a sample with
  `theme:` and `palette:` — `theme` printed, `palette` not
- [ ] `bin/test`: `tcms-theme` is applied only through `THEMES`, and the
  `?` overlay's command table lists `theme` and `palette`
- [ ] `tests/editor-probe.html`: spec §7 in full — the menu sets
  `data-theme`, `T` flips `data-palette`, both survive a reload, the pane
  carries a pin while `<html>` keeps the writer's, removing the pin or
  misspelling it puts the pane back, a Diagram is redrawn in the new Theme's
  fill
- [ ] by hand, in a browser: the menu on a phone-width window is reachable,
  and a note under 13 says it exists
- [ ] `docs/keymap.md` and `README.md` say what this issue made true
- [ ] `php bin/test` green, `php bin/build` run, no generated file edited
