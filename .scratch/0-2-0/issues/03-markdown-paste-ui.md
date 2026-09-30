# 03 — Markdown in by paste: the keyboard, the command and the Legend

Status: ready-for-agent
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

- [ ] a synthetic `paste` event with nothing open adds typed Lines below the
  cursor
- [ ] one `^Z` removes the whole paste, Meta included
- [ ] a paste into an open Code Line still gives Code Lines of that Dialect,
  and a `# comment` in it is not a heading
- [ ] a paste with the command line open goes to the command line, not the
  Document
- [ ] the Legend's `paste` entry exists and is wired to `:paste`

Then:

- [ ] `php bin/test` green
- [ ] `:paste` tried by hand from `file://` and from `localhost`, and a refused
  permission seen to leave the Document alone — noted in the comments
- [ ] the probe green in a browser, with its count noted in the comments
