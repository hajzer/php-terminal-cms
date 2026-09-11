# 11 — Words, docs and the version

Status: ready-for-human
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10
Commit: 8 of 8 — "0.1.9"
Landed in 1 commit:
  ea918d2 0.1.9

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

The diagrams are issue 08 and land with their own commit. This issue does not
add references to them; if 08 was held for any reason, ship the README without
and say so in the comments below.

CONTEXT.md's **Site Config** entry lists what `site.php` holds, and it gains the
favicon. That is a list, not a new term.

## The version

`VERSION` → `0.1.9`, and the `<i class="ver">` in `editor/index.html` with it.
`bin/test` fails if the two disagree, and `php bin/build` regenerates
`tests/editor-probe.html` from `editor/index.html` — never edit that by hand.

`bin/manifest.php` gains `docs/media` in issue 08, which is new for this
release: the Editor's and the site's assets sit inside directories the manifest
copies whole, but `docs/` is listed file by file. Check it here regardless —
`bin/test` fails when a tracked file is not named by the manifest, and that
check is the one that will tell you.

## Acceptance

- [x] `php bin/test` green, including the version check and the derived-files
  check
- [x] No generated file edited by hand
- [x] Eight local commits on `main`, nothing pushed
- [x] Every acceptance box in issues 01–10 ticked, and each issue `done`
- [ ] **Stop here.** `bin/package` is not run and nothing reaches the public
  repository until the maintainer has opened `tests/editor-probe.html` in a
  browser and reviewed the pages themselves.
- [ ] 0.1.8 is released or re-tagged first, or deliberately held again — it is
  tagged locally and unpushed, and this release sits on top of it.

## Comments

**Most of this issue had already landed with the work it documents.**
`docs/config.md` — `favicon` in the key table, as a prose section, and the
example block matching `site/site.php.example` key for key — came with 06.
The Table strip prose in `docs/keymap.md` came with 03 and 04, and the `?`
overlay's `^K` and `^←` `^→` rows with 02 and 04. `docs/security.md`'s
renderer section already named `logo` and `favicon` as two more paths that
take the media reduction, from 06. The diagrams landed with 08, so the README
already referenced them; nothing was held. Each was verified in the tree
rather than assumed, and the diff here is what was still missing.

**What this commit adds.** `^K` and `^←` `^→` in the keymap's Writing table,
and a sentence beside the `:col` prose pointing at the strip. The Editor
paragraph in `docs/security.md` saying the claim is checked and where — the
`source` section of `bin/test`, the terms it scans for, what a failure names,
and that the picture which loads is markup the browser acts on, which no scan
sees. The README's cheat sheet, its address and table prose, and the list of
what `site.php` holds. CONTEXT.md's Site Config list. The CHANGELOG entry.
`VERSION` and the `<i class="ver">`, with the probe regenerated by `bin/build`.

**No new word.** Judged at the end, as the issue asked: the strip, an entry in
it and a selected Column are interface state drawn on screen for as long as
they exist, and `^K` is a key. Nothing was added. The Editor entry was read
against `docs/security.md` and the scan and left alone: it still says what the
code does.

**`^K` is in two keymap tables.** The issue asked for the Writing table; 02 had
already put it in the Blocks table beside `a`, where the overlay is explained.
The Writing row points at Blocks rather than repeating the prose. `Tab` already
sits in two tables the same way.

**Beyond the brief, in the README.** The issue asked only for `^K` in the
cheat sheet. `^←` `^→` share its row, so the row has three columns like the
others; the address paragraph gained two sentences on the caret and the table
paragraph gained the strip, because the README described tables as reachable
only through `:col` — the very problem the spec opens with; and the list of
what `site.php` holds gained the favicon, as CONTEXT.md's did. All accurate to
the code and mirroring `docs/keymap.md`.

**The commit count.** The box says eight; the release is 34 commits since
`v0.1.8`, of which 13 are tracker housekeeping. 05 landed in three, 10 in
eight, and the brand work in three. Nothing is missing and nothing is pushed —
the constraint the box exists for holds. The number was written before the
splits and is left as written, as 0.1.8's was.

**Reviewed before committing.** The two-axis review found no breach of a
documented standard and three loose sentences, fixed here before the commit:
the CHANGELOG had pinned "the first binary content an archive carries" to the
SVG diagram, which is text — it belongs to the logo and the icon, and now says
so; "since the second review" now says the second review was at 0.1.4, so a
reader of the CHANGELOG alone is not left counting; and "has scanned the PHP
since the 0.1.4 review" dated a scan the audit says predates that review, so
both the CHANGELOG and `docs/security.md` now say what it does rather than
since when. The review's suggestion of a glossary entry for the strip is
overridden by this issue's own instruction and by the spec.

**The two boxes left are the maintainer's.** The probe has not been run in a
browser by this session and cannot be; `docs/security-audit.md` says it stood
at 172 assertions at 0.1.9 after issue 10, and the only DOM change since is
the version digit in the top bar. `bin/package` is not run and nothing is
pushed. Whether 0.1.8 is released, re-tagged or held again is a decision, not
a task. Issue 12, the tab leaving the document behind, is open at
`needs-triage` and is not in this release.

**After the probe: the drawn brand, and the sketch retired.** The maintainer
ran the probe in a browser — 172 of 172 — and then handed over a drawn mark
and a wordmark in place of the placeholder 07 shipped. The mark is the same
drawing at three sizes: `favicon.ico` in both halves at 16, 32 and 48, the
160px `logo.png` in both top bars, and the banner with the wordmark as
`docs/media/logo.png`, which the README now opens with. The text sketch of
the two halves is gone from the README and from the example site's home page,
and the diagram from `docs/media/` stands in both places, so the README's
Layout section no longer carries it twice. The site's copy of the SVG is a
derived file: `bin/build` writes `site/public/media/architecture.svg` from
`docs/media/` and `bin/test` compares them, the way `theme.css` is kept — the
review asked for that guard, and for the audit's sentence about the icon,
which said two frames and now says three. The probe is regenerated by
`bin/build` and unchanged, and the CHANGELOG says what the mark is and where
the sketch went. The review also noted the README showed the name twice, in
the banner and in the heading beneath it; the maintainer dropped the heading,
and the banner is the title. The diagram then lost its dark ground, at the
maintainer's ask: the panels keep theirs, and the twelve texts that stand on
the page itself took a tone that reads on white and on dark, with a
colour-scheme query sharpening either — rendered four ways and looked at
before committing.

**The accent, in the mark's green.** Asked for after the brand landed. One
value in `shared/theme.css` per scheme — `#21e08a` on dark, close to the
logo's `#00f790` with the neon taken off, and `#137a3f` on light, chosen for
the contrast the amber had on white — and the same green as `Site::ACCENT`,
in `site.php.example`, the config guide, `docs/config.md` and the diagram's
labels and strokes, where the amber had been. `bin/test`'s accent table names
the new default. No colour that is not the accent moved.
