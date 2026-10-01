# 11 — Words, docs and the version

Status: ready-for-human
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 12, 14, 15, 16, 17, 18

## CONTEXT.md

**Diagram**, **Page Build** and **Base Path** were written during the grilling,
and **Dialect**, **Editor** and **Renderer** amended. Read each against what the
code now does and correct any that drifted; do not write them again. Whether
the release produced any other word is a judgement to make here — the raw face
is a view and `:paste` a command, and neither is obviously a term.

## ADRs

ADR-0016 and ADR-0017 are accepted. If 05, 06 or 07 changed anything they
record, amend them; if not, leave them.

## docs/keymap.md

`^V` outside editing, `:paste`, `w`, `^B 4`, `:raw`, `:read`, the Legend's
`paste`, and the *Export .md* button. The `?` overlay's key table is
hand-written; its command table is generated.

## docs/line-types.md and docs/format.md

`mermaid` among the Code Dialects, what a Diagram is on the page and in the
Editor, and that the file is a standard ```` ```mermaid ```` fence.

## docs/security.md

The third-party claim corrected to its exception, the Mermaid version, the
Editor's fetch sentence, and the built site's policy (08 wrote it — confirm).

## README.md

- "not one byte of third-party JavaScript" becomes true of every page without
  a Diagram, and says so.
- The line-type table's Code row: 59 languages.
- The cheat sheet gains `w` and `^V`; its columns are aligned by hand.
- The topbar sentence names **Export .md**; the split-screen section names raw.
- The Commands table gains `php bin/page-build`; *Layout* lists it under `bin/`.
- A sentence on publishing to GitLab or GitHub Pages, pointing at
  `docs/deploy.md`.

## CHANGELOG.md and the version

The 0.2.0 entry. `VERSION` → `0.2.0` and the `<i class="ver">` in
`editor/index.html` with it; `php bin/build` regenerates the probe.

## Acceptance

- [x] `php bin/test` green, including the version and derived-files checks
- [x] no generated file edited by hand
- [x] every acceptance box in every issue under `Blocked by` ticked, and each of them `done`
- [ ] **Stop here.** `bin/package` is not run and nothing is pushed until the
  maintainer has opened `tests/editor-probe.html` in a browser and reviewed a
  request-time page and a Page Build with a Diagram themselves.

## Comments

- 2026-09-30, agent, from issue 10: two of the items above are done there and
  need only reading. `docs/security.md` names the Mermaid version — the
  sentence in *The one script on the page* that begins "The copy is Mermaid
  11.17.2" — and `bin/test` now fails if that version is not the one
  `shared/mermaid.min.js`'s first line names, so keep the words "Mermaid
  11.17.2" in that file whatever else moves. ADR-0016 has been amended with
  the nonced `<script src>` 06 asked for; ADR-0017 was read against the code
  and needs nothing. The "nothing with a CVE feed" sentence in *What does not
  exist* is corrected in 10, since the new paragraph would have contradicted
  it. Still for here: the README's "not one byte of third-party JavaScript",
  and in `docs/security.md` "It does make one request on the author's behalf"
  and "under two thousand lines in all" — the site's PHP is about 2,200 lines
  now. `docs/deploy.md` says nine
  static files for the Editor, corrected in 10. The fourth review is written;
  its `## Validation` counts 721 assertions and a 248-assertion probe, which
  the version bump does not change.
- 2026-10-01, agent, from the Themes grilling: this issue now waits for
  14–18 as well. What they add to the words here: `docs/themes.md` is new
  and the README's layout lists `shared/themes/`; the `T` row and the
  `theme` command row in `docs/keymap.md` and the README read `palette`;
  `docs/config.md` has `theme` and `palette` and no `accent`;
  `docs/format.md` lists `theme` and `palette` among the Meta the system
  reads; CONTEXT.md's **Theme**, **Palette**, **Meta**, **Site Config** and
  **Editor** were written or amended in the grilling and 18 reads them
  against the code, so here they need only a last look. The CHANGELOG entry
  names the retired `accent` as a breaking change, and that `normal` became
  `light`. ADR-0018 and ADR-0019 are accepted; ADR-0011 and ADR-0013 carry an
  "amended by" line.
- 2026-10-01, agent, the agent's half is done and the last box is the
  maintainer's. `php bin/test` is 835 of 835 at `0.2.0`; the probe is 292 of
  292 in headless Chromium and headless Firefox, which does not tick the last
  box — the maintainer's own browser does. `bin/package` was not run and
  nothing was pushed or tagged. Status is `ready-for-human` for that reason.

  **Read and left alone.** CONTEXT.md: **Diagram**, **Page Build**, **Base
  Path**, **Dialect**, **Editor**, **Renderer**, and the Themes' **Theme**,
  **Palette**, **Meta** and **Site Config** each still say what the code
  does — fifty-nine Code Dialects counted in `editor/editor.js`, the Editor's
  two fetches as `ui.js` makes them. ADR-0016 as 10 left it. The built site's
  policy in `docs/security.md` against `site/src/Policy.php`: directive for
  directive, `frame-ancestors` the header's alone. The `?` overlay's
  hand-written key table already had `^V`, **Export .md**, `w` and `^B 4`,
  from 03 and 04. `docs/keymap.md` already had `^V`, `:paste` and the
  Legend's `paste`; the README already had the fifty-nine, **Export .md** in
  the topbar sentence, and `bin/page-build` in *Commands* and *Layout*.

  **No new word.** The raw face is one of two things the reading pane shows
  and `:paste` is a command; neither is something the model holds, and the
  docs call them a face and a command without needing a definition.

  **Written.** `docs/keymap.md`: `w`, `^B 4`, `:raw` beside `:read`, the two
  faces under *Split screen*, **Export .md** in the table and four buttons
  where it said three, and `:w` told apart from the key `w`. `docs/line-types.md`
  and `docs/format.md`: what a Diagram is in the file, on the page and in the
  Editor. `docs/security.md`: the origin's "none of it is somebody else's"
  with its exception, about 2,300 lines, an entry point of under eighty, the
  Editor's fetches as two, the scan's paragraph saying the vendored file is
  not read, and Mermaid under *What to keep patched*. The README: the
  third-party sentence and its exception, the Diagram, `^V` and `w` in the
  cheat sheet, paste and raw in prose, the Pages sentence after *Quick
  start*, `paste` in the phone's legend, the probe's two scripts in *Layout*.
  The CHANGELOG entry, with the retired `accent` and `normal` → `light` under
  *Upgrading an instance*. `VERSION` and the `<i class="ver">`; `bin/build`
  regenerated the probe.

  **Beyond the list, and why.**
  - ADR-0017's *Policy* bullet still put the build's nonce on "the accent
    style block", which 16 removed. The clause is gone, the ADR says
    "amended by ADR-0019" and ADR-0019 names it. That is 16's drift, not
    05–07's, but it was an ADR saying something the code does not do.
  - The example content made the README's claim in its own words:
    `site/content/index.md` ("not one byte of third-party JavaScript") and
    `about/what-it-is.md` with its Slovak ("It does not run third-party
    code"). Both are corrected to the exception, since the demo site would
    otherwise publish the sentence this issue exists to correct. Three pinned
    page hashes in `bin/test` are re-recorded for it — `/`,
    `/about/what-it-is`, `/about/what-it-is-sk` — as that table's comment
    says a deliberate content change does. The Slovak sentence is the
    agent's and wants a native reader's eye.
  - `docs/security-audit.md`'s `## Validation` said 721 assertions and a
    248-assertion probe at 0.2.0. Both were true when 10 wrote them and the
    Themes and 12 have added to each since; it now says 835 and 292 and keeps
    the review's own numbers beside them.
