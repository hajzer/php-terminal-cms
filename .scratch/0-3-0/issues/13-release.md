# 13 — Release 0.3.0

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 15

## What

`VERSION` and `editor/index.html`'s `<i class="ver">` say `0.3.0`; the suite
and the probe are green; the archive is built.

## Acceptance

- [ ] `VERSION` and `<i class="ver">` both `0.3.0`; `bin/test` agrees
- [ ] `php bin/test` green; the probe green in Chromium and Firefox
- [ ] `bin/package` builds; the archive holds `site/editor/` and no `.scratch/`
- [ ] Spec `Status: done`

## Comments
