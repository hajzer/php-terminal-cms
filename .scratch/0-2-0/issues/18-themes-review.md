# 18 — The Themes read through, before the release

Status: ready-for-agent
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

- [ ] the review is recorded under Comments: findings, what was fixed, what
  was left and why
- [ ] every bullet under Scope has a line under Comments saying it was
  checked and what, if anything, moved
- [ ] `php bin/test` green, no generated file edited
- [ ] 14, 15, 16 and 17 are `done`, every box ticked
