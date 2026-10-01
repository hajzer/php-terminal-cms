# 14 — The sheet becomes tokens, and Baseline is the first Theme

Status: done
Spec: ../spec.md

## What

`shared/theme.css` stops carrying any colour, typeface or shape of its own and
reads them all as tokens; the token contract is written once at the top of
that file; and the first Theme, Baseline, exists as `shared/themes/baseline.json`
with `bin/build` writing its stylesheet into both halves. After this issue the
Editor and the page look as they did, drawn through one Theme instead of
through `:root`.

## Scope

- **The contract**, in a comment at the top of `shared/theme.css` that
  `bin/test` parses: the eleven colours and six syntax colours per Palette,
  and `--font-body`, `--font-heading`, `--mono`, `--radius`,
  `--heading-weight` once. Add a token only if the Baseline port cannot do
  without it, and say which and why in the commit.
- **The structural rules** reach type and shape through those names only:
  `body.reader` and the Editor's `body` through `--font-body`, headings
  through `--font-heading` and `--heading-weight`, code and the CLI prompt
  through `--mono`, every rounded corner through `--radius`. The metrics
  (`--global-font-size`, line height, space, measure, `--doc-scale`) and the
  controls block stay where they are, the latter still in terms of the
  tokens.
- **`data-palette`** replaces `data-theme` as the light-or-dark attribute,
  with `light` for what was `normal`; `data-theme` is freed for the name. The
  Editor's `ui.js` stores `tcms-palette`, its `T`, `:theme` command (renamed
  `:palette`), status line and `?` row say `light ⇄ dark`, and it applies no
  `data-palette` until the writer chooses, so a fresh Editor follows the
  browser. The page's enhancement script does the same with `tcms-palette`.
  An old stored `tcms-theme` of `dark` or `normal` is ignored.
- **`shared/themes/baseline.json`**: today's two blocks of values, read off
  the sheet, as `light` and `dark`, the current mono stack as `--mono` and as
  `--font-body` and `--font-heading` (Baseline's port proper is 15's; here it
  is the sheet as it stands), `--radius: 0`, `--heading-weight: 600`, and a
  `source` block naming svnaxis/obsidian-baseline, its author, MIT and the
  copyright line — or, if the values are still today's and not yet
  Baseline's, a `source` naming this repository, to be replaced in 15.
- **`bin/build`** writes `editor/themes/<name>.css`,
  `site/public/themes/<name>.css` and `editor/themes.js` for every JSON in
  the directory, in the shape the spec gives; the probe repathing already
  covers a relative `href`. `editor/index.html` links `themes/baseline.css`
  after `theme.css`; `Page::html()` links `themes/baseline.css` the same way,
  through the Base Path, as a fixed name for now — 16 makes it chosen — and
  writes `data-theme="baseline"` on `<html>`. The accent `<style>` block stays
  until 16.
- **`bin/test`**: the contract checks in spec §6's first four bullets, and
  the drift check extended to the generated Theme files and `themes.js`.
  The pinned shell hashes change here (the `<html>` attribute and the link)
  and are re-pinned with a comment saying what moved; `Page.php`'s own shell
  does not change again until 16.
- Mermaid's `themeVariables` read the same tokens they read now; nothing to
  do but check the `darkMode` flag reads `data-palette`.

## Out

A second Theme. Reading `theme:` or `palette:` from anywhere. The select, the
`:theme` command, the Legend rows for them. Removing `accent`.

## Acceptance

- [x] `bin/test`: `shared/theme.css` holds no hex colour and no face name
  outside the contract comment
- [x] `bin/test`: `baseline.json` defines exactly the contract, both Palettes
- [x] `bin/test`: the generated files in both halves and `themes.js` match
  `bin/build`'s output; `editor/index.html` links every Theme file and no
  other
- [x] `bin/test`: a rendered page carries `data-theme="baseline"`, links
  `theme.css`, `themes/baseline.css`, `site.css` in that order, each through
  the Base Path in a build, and carries no `data-palette`
- [x] `tests/editor-probe.html`: `T` flips `data-palette` between `light`
  and `dark`, the value survives a reload, and a fresh profile has none
- [x] by hand: the Editor and a page, light and dark, are what they were
  before this issue, to the eye
- [x] `php bin/test` green, `php bin/build` run, no generated file edited

## Notes

- Probe: 255 of 255 in headless Chromium and Firefox, with the browser
  preferring light and preferring dark, fresh and after a reload; an old
  `tcms-theme` of `dark` leaves no `data-palette` on either surface.
- The by-hand box, measured headlessly: screenshots of `/`,
  `/about/everything-is-a-line`, `/guides/writing-in-the-editor`,
  `/guides/install-in-five-minutes` and the Editor, in both Palettes and
  both browser preferences, are byte-identical to HEAD's. The maintainer
  has looked and confirmed it.
- No token was added to the contract.
