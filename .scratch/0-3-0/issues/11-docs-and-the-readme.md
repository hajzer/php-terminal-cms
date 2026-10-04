# 11 — The words: README, docs, CHANGELOG

Status: done
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

- [x] CHANGELOG `## 0.3.0` with the upgrade through `site/migrate`
- [x] Every doc listed read through for 0.3.0

## Comments

**Done (2026-10-04).** The README has no feature list as such, so it gains a
section, *On the site*, before *Languages*: Sub-categories, Published, a
Document's own Media, Bundles, Full View and the Themes. Its tree, its
`site.php` sentence and its commands table name what 0.3.0 adds, with
`site/migrate` among the commands.

The architecture diagram does not name the media layout. Its Routing box said
"the second segment" is compared with real filenames, which three segments
made wrong; it says "the Document's name". Nothing else in it changed.

What the pass found that the tickets had missed:

- `docs/line-types.md` still counted five Meta keys and printed `published`.
- `docs/security.md` had no word on Sub-categories in the router, on
  Published, on the Bundle or on `site/migrate`, and counted an entry point
  "under eighty lines" and 2,300 lines of `site/src`; they are 88 and about
  3,200 with it. It gains *Published*, *The Bundle* and *The one program that
  writes*.
- `docs/deploy.md` did not say who runs `--apply`, or what the `site.php` step
  says about `accent`, `theme` and `bundle`.
- `docs/themes.md` needed nothing.
- In the example content, `install-in-five-minutes` still set `accent`, and
  `writing-in-the-editor` still counted three buttons — both stale since
  0.2.0. Six pages changed, so their pinned hashes in `bin/test` are
  re-recorded.

For the sixth review (12), found while checking `docs/security.md` against
the code: `Bundle` refuses a symbolic link and a dot file where it walks
Media and `site/editor/`, but a Document's `.md` comes from the Listing,
which has no such check. The doc claims only what the code does.

Not done here, by design: `VERSION` is still 0.2.0 (13), and the CHANGELOG
has no line for the sixth review (12 adds its own). The probe was not run:
nothing under `editor/` changed. `bin/test` 1077/1077.
