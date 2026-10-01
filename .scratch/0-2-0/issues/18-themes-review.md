# 18 — The Themes read through, before the release

Status: done
Spec: ../spec.md
Blocked by: 14, 15, 16, 17

## What

The two-axis review of 14–17 as one change, the way 10 read the diagram and
build work: standards against the repo's own rules, spec against ADR-0018,
ADR-0019 and the spec's Themes sections. Then the words in `CONTEXT.md` read
against what the code now does.

## Scope

- `/code-review` from the commit before 14, both axes, findings fixed or
  recorded under Comments with why not.
- **ADR-0018 against the code**: the structural sheet carries no colour or
  face; the contract comment is the list `bin/test` reads; a Theme file is
  data and nothing else; the Editor links twelve, the page one; no font file
  and no `font-src`.
- **ADR-0019 against the code**: the two chains in the order written, the
  fall-through silent at every step, `palette` unprinted in both renderers,
  no `accent` anywhere in `site/src/`, one `nonce=` on a page without a
  Diagram, the reader with no Theme control.
- **CONTEXT.md**: **Theme**, **Palette**, **Meta**, **Site Config** and
  **Editor** read against the code; corrected if they drifted, not rewritten.
- **Licensing**: `shared/themes/LICENSE` names every source's copyright line
  as its repository states it, and each generated stylesheet's first comment
  carries its own. `bin/manifest.php` ships `shared/themes/` — it ships
  `shared` whole, confirm nothing excludes it.
- **The suite's claims**: every `bin/test` comment added in 14–17 that names
  a count (twelve, one nonce, the contract's size) is read against the file
  it describes.
- The `.page-build` parity test run against a build holding every Theme's
  file, and `docs/deploy.md` read for any sentence the Theme files make
  false (the count of static files in the Editor, if it is named).

## Out

Any new behaviour. Issue 11's release work.

## Acceptance

- [x] the review is recorded under Comments: findings, what was fixed, what
  was left and why
- [x] every bullet under Scope has a line under Comments saying it was
  checked and what, if anything, moved
- [x] `php bin/test` green, no generated file edited
- [x] 14, 15, 16 and 17 are `done`, every box ticked

## Comments

- 2026-10-01, agent: `/code-review` from 6de83af (the commit before 14) to
  0de878e, both axes, issue 13's commit included. **Standards**: no hard
  breach — `bin/build` on a copy changes nothing, no source names an ADR,
  comments describe the system, `VERSION` agrees, `palette:` is dropped by
  both renderers and `tests/js-dump.js` compares the meta bar, Theme logic
  sits in `editor.js` (`Doc.theme()`, `cycleMeta`) with `ui.js` going
  through `render()`. Judgement calls, left: `'baseline'` and the two
  Palette words are written in both `ui.js`/`Page.php` and `Site.php`/
  `editor.js`, held together by `bin/test` rather than a shared source;
  `ui.js` reads `window.THEMES` for the menu's labels where `editor.js`
  exports only names; the Router's `meta?:` shape is repeated in five
  docblocks; `dressPane()` could be named for what it does. None is wrong,
  and each would be churn in a release review. One fixed: `Page.php`'s
  comment said the Editor draws Diagrams "with the same configuration",
  but the Editor reads its colours off the read pane — reworded.
  **Spec**: nothing asked for is missing. Two unasked: the Editor's own
  light/dark button (b458066), left — it mirrors the page's one control
  and its commit says why; and the Diagram label `fontSize` fix (74bd1c0),
  recorded under 15. One drift fixed: ADR-0018 said code keeps "the one
  monospace stack in every Theme", while five ports (material-flat,
  origami, reverie, wasp, things) put their source's code face first, as
  its own Consequences and the spec allow — the Decision line now says so.
  Left, by design and commented: a Diagram in a pinned pane takes
  `<body>`'s face, since Mermaid measures labels there.
- 2026-10-01, agent, **ADR-0018 against the code**: holds, nothing moved.
  `shared/theme.css` below its opening comment has no hex and no face (the
  suite checks both); the contract comment is the list `bin/test` parses,
  17 per Palette and 5 once; all twelve JSONs hold exactly `name`, `label`,
  `source`, the five once-tokens, `light` and `dark`; `editor/index.html`
  links twelve `themes/*.css`, the page one; no `.woff`/`.ttf`/`.otf` is
  tracked and no policy has `font-src`.
- 2026-10-01, agent, **ADR-0019 against the code**: holds, nothing moved.
  Page Theme: Meta, Site Config, Baseline (`Site::themeFor`); page Palette:
  the reader's stored choice, Meta, Site Config, the browser; Editor:
  `tcms-theme` else Baseline, the pane the Document's pin, Palette the
  writer's else the browser. Every fall-through returns null and the next
  chooser decides, with no message (the one message is `:theme nope`, an
  explicit command). `palette:` unprinted in `Renderer.php` and
  `metaBar()`. `accent` in `site/src/`: the only hit is `v('--accent')` in
  `Page.php`'s Diagram script, the contract's colour token, not the retired
  Site Config key — `Site::accent` and `ACCENT` are gone and the suite
  guards it. One `nonce=` on a page without a Diagram, asserted. The page's
  controls are A−, A+ and light/dark: no Theme control.
- 2026-10-01, agent, **CONTEXT.md**: **Theme**, **Palette**, **Meta**,
  **Site Config** and **Editor** read against the code and still true;
  nothing moved.
- 2026-10-01, agent, **Licensing**: each of the twelve repositories'
  licence file fetched through GitHub's API today; every copyright line in
  `shared/themes/LICENSE` is the one the repository states, word for word,
  and each generated stylesheet's opening comment carries its own (the
  editor and site copies are identical). `bin/manifest.php` ships `shared`
  whole and excludes only `site/site.php`, `dist`, `node_modules`: nothing
  excludes `shared/themes/`.
- 2026-10-01, agent, **the suite's claims**: the counts named in the
  comments and messages added in 14–17 — seventeen per Palette and five
  once, twelve Themes, the Editor linking every Theme and no other, one
  nonce on a page without a Diagram and one beside a drawing — each read
  against `shared/theme.css`, `shared/themes/`, `editor/index.html` and
  `Page.php`; all true.
- 2026-10-01, agent, **parity and `docs/deploy.md`**: the parity test's
  build copies `site/public/` whole, and a build of the sample by hand holds
  all twelve `themes/*.css`, byte-identical to `site/public/themes/`. The
  suite now says so: a new check that every Theme's stylesheet is in the
  build. `docs/deploy.md` said `editor/` "is nine static files"; it is ten
  and a `themes/` directory of twelve — corrected, and its "run
  `php bin/build`" sentence now names a Theme in `shared/themes/` too.
- 2026-10-01, agent: `php bin/test`: 830 passed, 0 failed. No generated
  file edited. The Editor's DOM half was not touched, so the probe was not
  re-run. 14, 15, 16 and 17 are `done` with every box ticked.
