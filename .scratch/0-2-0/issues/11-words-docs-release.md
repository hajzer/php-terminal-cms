# 11 — Words, docs and the version

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10

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

- [ ] `php bin/test` green, including the version and derived-files checks
- [ ] no generated file edited by hand
- [ ] every acceptance box in 01–10 ticked, and each issue `done`
- [ ] **Stop here.** `bin/package` is not run and nothing is pushed until the
  maintainer has opened `tests/editor-probe.html` in a browser and reviewed a
  request-time page and a Page Build with a Diagram themselves.
