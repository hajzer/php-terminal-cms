# 03 — Markdown in by paste: the keyboard, the command and the Legend

Status: done
Spec: ../spec.md
Blocked by: 02

## What

The DOM half: getting clipboard text to 02's method from `^V`, from `:paste`,
and from a finger.

## Scope

- A document-level `paste` listener that acts only when no Line is open for
  editing, the command line and every overlay are closed, and focus is not in
  the Name. It reads `text/plain` and nothing else.
- The in-edit handler (`ui.js`, the `span` paste listener) is **unchanged**: a
  paste into an open Line is text, and further lines are Lines of that Type.
- The paste is one history entry — one `^Z` removes every Line it added and
  restores every Meta value it replaced.
- `:paste` calls `navigator.clipboard.readText()`. A refusal, a missing API or
  an insecure context puts one sentence on the status line pointing at `^V`,
  and changes nothing.
- The Legend's right-hand group gains `paste` beside `new`, running `:paste`.
- The status line reports what 02 returned: Lines added and Meta set.
- The `?` overlay's hand-written key table gains `^V`; the command table is
  generated and gains `:paste` for free.

## Out

A paste dialog. HTML from the clipboard. Any change to paste while editing.

## Acceptance

`tests/editor-probe.js`, run in a browser, covers and passes:

- [x] a synthetic `paste` event with nothing open adds typed Lines below the
  cursor
- [x] one `^Z` removes the whole paste, Meta included
- [x] a paste into an open Code Line still gives Code Lines of that Dialect,
  and a `# comment` in it is not a heading
- [x] a paste with the command line open goes to the command line, not the
  Document
- [x] the Legend's `paste` entry exists and is wired to `:paste`

Then:

- [x] `php bin/test` green
- [x] `:paste` tried by hand from `file://` and from `localhost`, and a refused
  permission seen to leave the Document alone — noted in the comments (driven
  by Playwright with real keypresses and real permission states, not by a
  person's hands; Chromium only)
- [x] the probe green in a browser, with its count noted in the comments

## Comments

- 2026-09-30, agent: the probe is green in headless Chromium (Playwright's
  chrome-headless-shell 1243), **195 of 195** — 23 of them new for paste; after the review
  fixes, **198 of 198**. `php bin/test`: 596 passed, 0 failed. Each guard on the document-level
  listener (open Line, command line, overlay, Name) was taken out in turn and
  the probe went red on its test.
- 2026-09-30, agent: `:paste` against the real Clipboard API, in headless
  Chromium, where no permission is granted — so a real refusal, not a stub:
  - `file://` — secure context, API present, read refused: status line says
    "the clipboard cannot be read from here — ^V pastes instead", Document
    unchanged.
  - `http://localhost` (`php -S`) — the same.
  - `http://<LAN address>` — not a secure context, no `navigator.clipboard`:
    the same sentence, Document unchanged.
- 2026-09-30, agent, after review: the "is text being typed" test is one
  predicate the keymap and the paste share; the Name counts when it holds the
  focus without being open (it has `tabindex`); a `:paste` whose clipboard
  answers after something was opened pastes nothing and says so; an empty
  paste still renders, so an edit it committed reaches the history. The raw
  face's paste check went to 04's acceptance, since raw does not exist yet.
- 2026-09-30, agent: the real thing, through Playwright (playwright-core
  1.63, Chromium 153 headless shell) — real keypresses, the system clipboard,
  permissions granted or not — from `file://` and from `http://localhost`,
  8 of 8 each:
  - `^V` with nothing open adds `meta`, `h2` and `list` Lines, the status
    line says "2 lines added · 1 meta set", and `^Z` takes all of it back;
  - `:paste` and the Legend's `paste`, permission granted, read the clipboard;
  - `^V` into an open Code Line gives Code Lines, `# comment` included;
  - `^V` with the command line open lands in the command line;
  - with no permission, `:paste` changes nothing and points at `^V`.
- Not tried: Firefox (Playwright's build of it is not installed here) and
  Safari, which has been known not to raise `paste` on a page with no
  editable target — if `^V` does nothing there, `:paste` and the Legend still
  do.
