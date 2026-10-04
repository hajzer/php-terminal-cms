# 13 — Release 0.3.0

Status: done
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 15, 16

## What

`VERSION` and `editor/index.html`'s `<i class="ver">` say `0.3.0`; the suite
and the probe are green; the archive is built.

## Acceptance

- [x] `VERSION` and `<i class="ver">` both `0.3.0`; `bin/test` agrees
- [x] `php bin/test` green; the probe green in Chromium and Firefox
- [x] `bin/package` builds; the archive holds `site/editor/` and no `.scratch/`
- [x] Spec `Status: done`

## Comments

Released, and not closed. `VERSION` and `editor/index.html` say `0.3.0`, and
`bin/build` carried it into `site/editor/` and the probe.

- `php bin/test`: 1115 passed, 0 failed, with the version check among them.
- The probe, headless: 0 failed of 301 in Chromium 153 and in Firefox 155.
- `php bin/package`: `dist/php-terminal-cms-0.3.0.tar.gz` and `.zip`. Each
  holds the 24 entries of `site/editor/` and nothing under `.scratch/`; the
  `VERSION` and the `<i class="ver">` inside read `0.3.0`.

Left for the maintainer: issue 08 is `done` with its two by-hand boxes open —
the unzipped Bundle in the Editor in Firefox and Chromium, and the `rsync`
into a scratch Instance. Both passed headless and were left for the
maintainer's own browser. The spec is not `done` over an open box, so it
stays as it was and this issue's last box with it; ticking 08's two closes
both.

Choices to look at:
- The probe was run headless, not in the maintainer's own browser.
- Nothing is tagged, merged or pushed, and `dist/` is not tracked.

Closed. The maintainer ran 08's two by-hand checks and both pass, so 08's
boxes are ticked and the spec is `done`. `docs/format.md` gained a paragraph
on the Editor needing `category:` to find a Document's pictures, so the
archives were built again from the final tree: 1115 of 1115.
