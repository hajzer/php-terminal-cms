# 07 — Words, docs and the version

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06
Commit: 5 of 5 — "0.1.9"

## CONTEXT.md

Cell and Column are already in the glossary, written in 0.1.8. Do not write them
again and do not drift from them.

The **Editor** entry says the Document is never sent anywhere and that the one
thing it fetches is an image a Line names. That is now checked by the suite
rather than asserted — the entry does not change, but confirm it still says what
is true before leaving it alone.

Whether anything new belongs here is a judgement to make at the end, not a task:
a selected Column is transient interface state and is deliberately not a domain
term, and `^K` is a key. If the release produced no new word, say so and add
nothing. A glossary that grows by habit stops being one.

## docs/keymap.md

- `^K` in the Writing table, with a line of prose: what the selection does, what
  happens with no selection, and that `a` outside editing still appends.
- The Table strip: clicking a Column, clicking a Cell, the four controls and
  `^←` / `^→`, near the `:col` prose that is already there.
- The `?` overlay's key table is hand-written and needs `^K` and the two arrows.
  Its command table is generated from the list that runs the commands and needs
  nothing.

## docs/security.md

The Editor paragraph gains the fact that the claim is now tested, and says where
— the way the renderer section already points at what `bin/test` asserts. Keep
it to what is true: the scan says the Editor initiates no request, and the
markup it writes is what causes the one that happens.

## README.md and CHANGELOG.md

The release. The cheat-sheet block in the README gains `^K`; mind the columns,
which are three and are aligned by hand.

## The version

`VERSION` → `0.1.9`, and the `<i class="ver">` in `editor/index.html` with it.
`bin/test` fails if the two disagree, and `php bin/build` regenerates
`tests/editor-probe.html` from `editor/index.html` — never edit that by hand.

`bin/manifest.php` needs no change: every file touched sits inside a directory
it already ships whole.

## Acceptance

- [ ] `php bin/test` green, including the version check and the derived-files
  check
- [ ] No generated file edited by hand
- [ ] Five local commits on `main`, nothing pushed
- [ ] Every acceptance box in issues 01–06 ticked, and each issue `done`
- [ ] **Stop here.** `bin/package` is not run and nothing reaches the public
  repository until the maintainer has opened `tests/editor-probe.html` in a
  browser and reviewed the pages themselves.
- [ ] 0.1.8 is released or re-tagged first, or deliberately held again — it is
  tagged locally and unpushed, and this release sits on top of it.
