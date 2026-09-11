# 11 — Words, docs and the version

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10
Commit: 8 of 8 — "0.1.9"

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

## docs/config.md

`favicon` in the key table and as a prose section, and the example block at the
top grown to match `site/site.php.example` — which now names `logo` rather than
commenting it out. Say what the media-path reduction means for an icon: a local
absolute path stands, so `/favicon.ico` at the root is expressible, and anything
else is the file it names under `/media/`.

## docs/security.md

The Editor paragraph gains the fact that the claim is now tested, and says where
— the way the renderer section already points at what `bin/test` asserts. Keep
it to what is true: the scan says the Editor initiates no request, and the
markup it writes is what causes the one that happens.

## README.md and CHANGELOG.md

The release. The cheat-sheet block in the README gains `^K`; mind the columns,
which are three and are aligned by hand.

The diagrams are issue 08 and may not have landed. If they have not, this issue
does not wait for them and does not reference them — say so in the comments
below and ship the README without.

CONTEXT.md's **Site Config** entry lists what `site.php` holds, and it gains the
favicon. That is a list, not a new term.

## The version

`VERSION` → `0.1.9`, and the `<i class="ver">` in `editor/index.html` with it.
`bin/test` fails if the two disagree, and `php bin/build` regenerates
`tests/editor-probe.html` from `editor/index.html` — never edit that by hand.

`bin/manifest.php` **may** need a change, which is new for this release: the
Editor's and the site's assets sit inside directories the manifest copies whole,
but `docs/` is listed file by file, so `docs/media/` is named there by issue 08.
If issue 08 was held, check the manifest anyway — `bin/test` fails when a
tracked file has fallen off it, and that check is the one that will tell you.

## Acceptance

- [ ] `php bin/test` green, including the version check and the derived-files
  check
- [ ] No generated file edited by hand
- [ ] Eight local commits on `main`, nothing pushed
- [ ] Every acceptance box in issues 01–10 ticked, and each issue `done`
- [ ] **Stop here.** `bin/package` is not run and nothing reaches the public
  repository until the maintainer has opened `tests/editor-probe.html` in a
  browser and reviewed the pages themselves.
- [ ] 0.1.8 is released or re-tagged first, or deliberately held again — it is
  tagged locally and unpushed, and this release sits on top of it.
