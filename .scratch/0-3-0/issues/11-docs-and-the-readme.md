# 11 — The words: README, docs, CHANGELOG

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 02, 03, 04, 05, 06, 08, 09, 10, 14

## What

Everything a reader of the docs meets says what 0.3.0 does, and the
CHANGELOG carries the migration.

## Scope

- `README.md`: Sub-categories, Published, Bundles, Full View in the feature
  list; the architecture diagram if it names the media layout.
- `CHANGELOG.md` `## 0.3.0`: the upgrade first — `php site/migrate`, read
  the report, `--apply`, then the code, as `docs/deploy.md` says — with the
  Media move as what it does this time, the one breaking change; `site.php`'s
  retired `accent`, which the report names, and the `theme` setting.
- A pass over `docs/config.md`, `docs/format.md`, `docs/deploy.md`,
  `docs/security.md`, `docs/themes.md`, `docs/line-types.md` for anything the
  tickets missed.
- The about/guides content in `site/content/` mentions what is new where it
  already describes the system.

## Acceptance

- [ ] CHANGELOG `## 0.3.0` with the upgrade through `site/migrate`
- [ ] Every doc listed read through for 0.3.0

## Comments
