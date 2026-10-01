# 15 — The twelve ports

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 14

## What

Eleven more Theme files beside Baseline, each read off its Obsidian source,
plus Baseline itself ported properly, and `shared/themes/LICENSE` with the
twelve notices. After this issue `bin/build` writes twelve stylesheets into
each half and `THEMES` lists twelve names.

## Scope

- One `shared/themes/<name>.json` for each of `minimal`, `wasp`, `github`,
  `things`, `shimmering-focus`, `baseline`, `flexoki`, `reverie`, `retroma`,
  `underwater`, `origami`, `material-flat`, in the shape 14 fixed. `label` is
  the source's own name as the registry spells it.
- **Reading a source.** Clone or fetch each repository named in the spec's
  Further Notes at its current release and read its `theme.css` (Minimal and
  Flexoki keep their values in `src/`; take the built sheet). Map, for
  `.theme-light` and `.theme-dark`: `--background-primary` → `--bg`,
  `--background-secondary` → `--block-bg`, `--code-background` or
  `--background-primary-alt` → `--code-bg`, `--text-normal` → `--fg`,
  `--text-normal` strengthened or `--h1-color` → `--fg-strong`,
  `--text-muted` → `--secondary`, `--text-faint` → `--faint`,
  `--background-modifier-border` → `--border`, `--link-color` or
  `--text-accent` → `--primary`, `--interactive-accent` or `--text-accent`
  → `--accent`, and `--text-on-accent` → `--invert-fg`. Record the mapping
  you actually used, per Theme, in a comment under this issue, because the
  sources name things differently and the next port needs to know.
- **Syntax colours** from the source's `--code-keyword`, `--code-string`,
  `--code-value`/`--code-number`, `--code-comment`, `--code-function`,
  `--code-property` where they exist, else today's six adjusted to the
  Theme's inks so each reads on `--code-bg` in both Palettes.
- **Type and shape.** `--font-body` starts with the face the source names
  (`Inter`, `-apple-system`, a pixel face for Retroma) and ends
  `system-ui, sans-serif`; `--font-heading` the same or the source's heading
  face; `--mono` today's stack unless the source names a mono face, which
  then goes first. `--radius` and `--heading-weight` from the source's
  `--radius-m` and `--h1-weight` or their nearest kin. Nothing is downloaded
  and no `@font-face` is written anywhere.
- **Where a source has sub-schemes** (Minimal's colour schemes), its default
  is the port. Where a source's two modes share an accent, so do ours. Where
  a source has only one mode worth the name, say so in the comment and derive
  the other from it by hand, keeping it readable.
- **`shared/themes/LICENSE`**: the twelve MIT notices, verbatim, under the
  source's repository name, the way `shared/mermaid.LICENSE` carries
  Mermaid's. `source.license` in every JSON says `MIT`; `bin/test` checks
  the file names every Theme.
- `editor/index.html` links all twelve, after `theme.css`.
- A `docs/themes.md`: the twelve, each with its source, author and one
  sentence on what it looks like; `README.md`'s layout section lists
  `shared/themes/`.

## Out

Choosing a Theme anywhere. The menu. Anything from a source beyond its
colours, type and shape.

## Acceptance

- [ ] `bin/test`: twelve JSON files, every one exactly the contract, every
  colour six hex digits, every `source` complete and `MIT`,
  `shared/themes/LICENSE` naming all twelve
- [ ] `bin/test`: generated files and `themes.js` match, `editor/index.html`
  links all twelve and no other
- [ ] by hand (spec §8): every Theme in both Palettes, in the Editor and on a
  page holding a Diagram, a table, a note, a CLI block and a Link, looked at
  and readable; the Diagram's fill follows the Theme; no console report but
  the Diagram's known `style-src` ones. A short note per Theme under Comments
  saying what was checked and what was adjusted by hand
- [ ] a comment under this issue records the token mapping used for each
  source
- [ ] `php bin/test` green, `php bin/build` run, no generated file edited
