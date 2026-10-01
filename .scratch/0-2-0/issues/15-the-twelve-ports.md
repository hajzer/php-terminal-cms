# 15 — The twelve ports

Status: done
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

- [x] `bin/test`: twelve JSON files, every one exactly the contract, every
  colour six hex digits, every `source` complete and `MIT`,
  `shared/themes/LICENSE` naming all twelve
- [x] `bin/test`: generated files and `themes.js` match, `editor/index.html`
  links all twelve and no other
- [x] by hand (spec §8): every Theme in both Palettes, in the Editor and on a
  page holding a Diagram, a table, a note, a CLI block and a Link, looked at
  and readable; the Diagram's fill follows the Theme; no console report but
  the Diagram's known `style-src` ones. A short note per Theme under Comments
  saying what was checked and what was adjusted by hand
- [x] a comment under this issue records the token mapping used for each
  source
- [x] `php bin/test` green, `php bin/build` run, no generated file edited

## Comments

### The token mapping, per source

Every source was cloned at its default branch on 2026-10-01 (the version is
its `manifest.json`'s, the hash the commit read) and its built `theme.css`
loaded into headless Chromium over a stub of Obsidian's own defaults, with
`<body class="theme-light">` and then `theme-dark`, so that each Obsidian
variable was read as Obsidian would compute it — through the source's
`--color-base-NN`, `hsl()` and `oklch()` indirection — and resolved to six
hex digits. A variable the source does not set therefore reads as Obsidian's
default; Flexoki, for one, sets only `--color-*` and is read entirely that
way.

**The default mapping**, used unless a Theme's entry below says otherwise:
`--background-primary` → `--bg`, `--background-secondary` → `--block-bg`,
`--code-background` → `--code-bg`, `--text-normal` → `--fg` and `--fg-strong`,
`--text-muted` → `--secondary`, `--text-faint` → `--faint`,
`--background-modifier-border` → `--border`, `--link-color` → `--primary`,
`--interactive-accent` → `--accent`, `--text-on-accent` → `--invert-fg`;
`--code-keyword` → `--tk-kw`, `--code-string` → `--tk-str`, `--code-value` →
`--tk-num`, `--code-comment` → `--tk-com`, `--code-function` → `--tk-bi`,
`--code-property` → `--tk-var`. "Strengthened" is `--text-normal` taken 45%
toward black or white. "Today's sheet" is the six syntax colours the sheet
had before 14.

**Fitting.** After the mapping, each colour that fails to read is moved in
lightness only, keeping its hue, until it reaches: `--fg` and `--secondary`
4.5:1 on `--bg` (and `--secondary` on `--block-bg`), `--fg-strong` 4.5:1 on
`--code-bg`, `--fg` and `--fg-strong` 4.5:1 on `--block-bg`, `--primary` and
`--accent` 4.5:1 on `--bg`, `--faint` 2:1 on
`--bg` and `--block-bg`, `--border` 1.25:1 on `--bg`, the syntax colours 4.5:1
on `--code-bg` (the comment 3:1). Where the source gives its link or accent
one colour in both modes, ours stays one colour: the source's hue at the
lightness that reads best on both pages at once, which for a mid-tone link
between a white and a near-black page tops out a little above 4:1 — those
are the links' and accents' only sub-4.5 values, and a link is underlined.
`--invert-fg` is the page, else the strong ink, else black or white, whichever
first reads 4.5:1 on `--primary`, chosen after any shared colour has moved;
its lines below give the final value. A link drawn on `--block-bg` (in a note)
reaches at least 3:1 everywhere. The JSON files hold the final values; the
lines below say what moved.

#### Baseline (`baseline`) — svnaxis/obsidian-baseline 3.2.12 @ 8c56e83

- Mapping: the default; except `--fg-strong` ← --text-normal strengthened; `--primary` ← --text-accent; `--accent` ← --text-accent.
- Type: body `Inter, system-ui, sans-serif`; heading `"Instrument Serif", Inter, system-ui, sans-serif`; mono `today's stack`; radius 12px; heading weight 700.
- Fitted: light --primary #8b6cef → #7e5ced (4.5:1 on --bg); light --accent #8b6cef → #7e5ced (4.5:1 on --bg); light --tk-kw #e45749 → #da3120 (4.5:1 on --code-bg); light --tk-str #0d97b3 → #0b7d94 (4.5:1 on --code-bg); light --tk-com #b6b9c5 → #8b90a3 (3.0:1 on --code-bg); light --tk-bi #b76b02 → #a86202 (4.5:1 on --code-bg); light --tk-var #62afef → #1476c7 (4.5:1 on --code-bg); dark --primary #8b6cef → #8f71f0 (4.5:1 on --bg); dark --accent #8b6cef → #8f71f0 (4.5:1 on --bg); dark --tk-com #5c6370 → #666e7d (3.0:1 on --code-bg); shared --primary: #7e5ced / #8f71f0 → #8666ee in both (4.08 / 4.09); shared --accent: #7e5ced / #8f71f0 → #8666ee in both (4.08 / 4.09); light --invert-fg #ffffff → #131313 (final, on --primary); dark --invert-fg #1e1e1e → #000000 (final, on --primary).

#### Flexoki (`flexoki`) — kepano/flexoki-obsidian 1.1.0 @ 527685b

- Mapping: the default; except `--fg-strong` ← --text-normal strengthened.
- Type: body `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`; heading `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`; mono `today's stack`; radius 8px; heading weight 700.
- Fitted: light --faint #b7b5ac → #b6b4ab (2.0:1 on --bg); light --faint #b6b4ab → #aeaba1 (2.0:1 on --block-bg); light --secondary #6f6e69 → #6e6d68 (4.5:1 on --block-bg); light --primary #24847c → #238078 (4.5:1 on --bg); light --accent #24847c → #238078 (4.5:1 on --bg); light --border #e6e4d9 → #e5e3d7 (1.25:1 on --bg); light --tk-str #66800b → #5d740a (4.5:1 on --code-bg); light --tk-com #b7b5ac → #8e8a7c (3.0:1 on --code-bg); light --tk-bi #ad8301 → #8a6801 (4.5:1 on --code-bg); light --tk-var #24837b → #217972 (4.5:1 on --code-bg); dark --primary #24847c → #268a82 (4.5:1 on --bg); dark --accent #24847c → #268a82 (4.5:1 on --bg); dark --tk-com #575653 → #686763 (3.0:1 on --code-bg); shared --primary: #238078 / #268a82 → #24857d in both (4.32 / 4.31); shared --accent: #238078 / #268a82 → #24857d in both (4.32 / 4.31); light --invert-fg #ffffff → #090808 (final, on --primary); dark --invert-fg #ffffff → #000000 (final, on --primary).

#### GitHub Theme (`github`) — krios2146/obsidian-theme-github 1.1.7 @ 0ec83a8

- Mapping: the default; except `--fg-strong` ← --text-normal strengthened.
- Type: body `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`; heading `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`; mono `today's stack`; radius 8px; heading weight 700.
- Fitted: light --tk-str #2db7b5 → #1f7e7c (4.5:1 on --code-bg); light --tk-num #876be0 → #795adc (4.5:1 on --code-bg); light --tk-bi #d96c00 → #b35900 (4.5:1 on --code-bg); dark --invert-fg #ffffff → #0d1117 (final, on --primary).

#### Material Flat (`material-flat`) — threethan/obsidian-material-flat-theme 1.4.4 @ bb6671a

- Mapping: the default; except `--block-bg` ← light --background-secondary, dark --background-secondary taken 50% toward the page; `--fg-strong` ← --text-normal strengthened; `--faint` ← light --text-muted taken 60% toward the page, dark --text-faint; `--border` ← light --background-secondary, dark --background-modifier-border; `--primary` ← light --text-accent, dark --interactive-accent; `--tk-kw` ← today's sheet; `--tk-str` ← today's sheet; `--tk-num` ← today's sheet; `--tk-com` ← today's sheet; `--tk-bi` ← light --text-accent, dark --interactive-accent; `--tk-var` ← today's sheet.
- Type: body `Inter, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`; heading `Inter, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`; mono `"Roboto Mono", ui-monospace, SFMono-Regular, "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace`; radius 8px; heading weight 700.
- Fitted: light --faint #aba9b2 → #a3a1ab (2.0:1 on --block-bg); light --accent #a18bea → #7e60e2 (4.5:1 on --bg); light --tk-com #9a9386 → #938c7e (3.0:1 on --code-bg); dark --border #252329 → #302e35 (1.25:1 on --bg); light --invert-fg #2c273f → #ffffff (final, on --primary).

#### Minimal (`minimal`) — kepano/obsidian-minimal 9.1.0 @ c4704fb

- Mapping: the default; except `--fg-strong` ← --text-normal strengthened.
- Type: body `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Ubuntu, system-ui, sans-serif`; heading `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Ubuntu, system-ui, sans-serif`; mono `today's stack`; radius 8px; heading weight 600.
- Fitted: light --faint #b5b5b5 → #afafaf (2.0:1 on --block-bg); light --secondary #757575 → #707070 (4.5:1 on --block-bg); light --primary #6a8695 → #607a88 (4.5:1 on --bg); light --accent #7c95a2 → #617a88 (4.5:1 on --bg); light --border #e6e6e6 → #e5e5e5 (1.25:1 on --bg); light --tk-kw #b05279 → #af5078 (4.5:1 on --code-bg); light --tk-str #a8c373 → #607733 (4.5:1 on --code-bg); light --tk-num #9e86c8 → #7f5fb6 (4.5:1 on --code-bg); light --tk-com #b5b5b5 → #8d8d8d (3.0:1 on --code-bg); light --tk-bi #e5b567 → #97671a (4.5:1 on --code-bg); light --tk-var #73bbb2 → #3c7b73 (4.5:1 on --code-bg); dark --tk-kw #b05279 → #be7090 (4.5:1 on --code-bg); dark --tk-com #595959 → #6b6b6b (3.0:1 on --code-bg); dark --invert-fg #ffffff → #262626 (final, on --primary).

#### Origami (`origami`) — 7368697661/Origami 2.0.0.5 @ 8779deb

- Mapping: the default; except `--block-bg` ← light --background-secondary, dark --background-secondary taken 75% toward the page; `--fg-strong` ← --h1-color.
- Type: body `"IAWriter", system-ui, sans-serif`; heading `"Fraunces", system-ui, sans-serif`; mono `"Monaspace", ui-monospace, SFMono-Regular, "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace`; radius 8px; heading weight 900.
- Fitted: light --faint #b3b3b3 → #afafaf (2.0:1 on --bg); light --faint #afafaf → #a6a6a6 (2.0:1 on --block-bg); light --secondary #6b6b6b → #686868 (4.5:1 on --block-bg); light --primary #8a5cf5 → #7e4bf4 (4.5:1 on --bg); light --accent #a68af9 → #784df6 (4.5:1 on --bg); light --tk-kw #f9a7e8 → #b80d95 (4.5:1 on --code-bg); light --tk-str #689c2b → #496e1e (4.5:1 on --code-bg); light --tk-com #b3b3b3 → #808080 (3.0:1 on --code-bg); light --tk-bi #fcdc37 → #756202 (4.5:1 on --code-bg); light --tk-var #42a3ad → #2c6d74 (4.5:1 on --code-bg); dark --primary #8a5cf5 → #966df6 (4.5:1 on --bg); dark --tk-kw #fb5ed8 → #fc88e2 (4.5:1 on --code-bg); dark --tk-num #aa45f7 → #d19bfb (4.5:1 on --code-bg); dark --tk-com #707070 → #8f8f8f (3.0:1 on --code-bg); shared --primary: #7e4bf4 / #966df6 → #8b5df5 in both (3.88 / 3.87); shared --accent: #784df6 / #a68af9 → #855ff7 in both (3.89 / 3.86); dark --invert-fg #dadada → #000000 (final, on --primary).

#### Retroma (`retroma`) — emarpiee/Retroma 3.1.1 @ cf9c544

- Mapping: the default; except `--block-bg` ← light --background-secondary taken 50% toward the page, dark --background-secondary; `--code-bg` ← --background-primary-alt; `--fg-strong` ← --h1-color; `--tk-kw` ← today's sheet; `--tk-str` ← today's sheet; `--tk-num` ← today's sheet; `--tk-com` ← today's sheet; `--tk-bi` ← --link-color; `--tk-var` ← today's sheet.
- Type: body `"VT323", "Press Start 2P", system-ui, sans-serif`; heading `"VT323", "Press Start 2P", system-ui, sans-serif`; mono `today's stack`; radius 10px; heading weight 700.
- Fitted: light --fg #635b8b → #5b5480 (4.5:1 on --block-bg); light --fg-strong #944a44 → #8a453f (4.5:1 on --block-bg); light --faint #9e97ca → #938bc4 (2.0:1 on --block-bg); light --accent #8b6cef → #6c45eb (4.5:1 on --bg); light --tk-kw #7d4f9e → #7a4d9b (4.5:1 on --code-bg); light --tk-str #4a7a3c → #416b34 (4.5:1 on --code-bg); light --tk-num #96601f → #85551c (4.5:1 on --code-bg); light --tk-com #9a9386 → #847c6e (3.0:1 on --code-bg); light --tk-var #a34a3c → #9d473a (4.5:1 on --code-bg); shared --accent: #6c45eb / #8b6cef → #7651ec in both (4.00 / 3.96); dark --invert-fg #c4ffff → #000720 (final, on --primary).

#### Reverie (`reverie`) — santiyounger/Reverie-Obsidian-Theme 1.0.7 @ 10104b4

- Mapping: the default; except `--fg-strong` ← --h1-color; `--secondary` ← --text-faint; `--faint` ← --text-faint taken 45% toward the page; `--tk-kw` ← today's sheet; `--tk-str` ← today's sheet; `--tk-num` ← today's sheet; `--tk-com` ← today's sheet; `--tk-bi` ← --link-color; `--tk-var` ← today's sheet.
- Type: body `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`; heading `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`; mono `"Source Code Pro", ui-monospace, SFMono-Regular, "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace`; radius 8px; heading weight 500.
- Fitted: light --tk-kw #7d4f9e → #623e7c (4.5:1 on --code-bg); light --tk-str #4a7a3c → #34562a (4.5:1 on --code-bg); light --tk-num #96601f → #6c4516 (4.5:1 on --code-bg); light --tk-com #9a9386 → #6e675c (3.0:1 on --code-bg); light --tk-var #a34a3c → #7c382e (4.5:1 on --code-bg); dark --accent #0b797d → #0e969b (4.5:1 on --bg); dark --tk-com #6d7679 → #6f797c (3.0:1 on --code-bg); dark --invert-fg #ffffff → #1a2023 (final, on --primary).

#### Shimmering Focus (`shimmering-focus`) — chrisgrieser/shimmering-focus 5.88.0 @ 06a5b07

- Mapping: the default; except `--fg-strong` ← --text-normal strengthened; `--tk-kw` ← --bold-color; `--tk-str` ← today's sheet; `--tk-num` ← today's sheet; `--tk-com` ← today's sheet; `--tk-bi` ← --link-color; `--tk-var` ← today's sheet.
- Type: body `"iA Writer Quattro S", system-ui, sans-serif`; heading `Optima, "Recursive S", system-ui, sans-serif`; mono `today's stack`; radius 8px; heading weight 700.
- Fitted: light --primary #1396a0 → #108189 (4.5:1 on --bg); light --tk-kw #dc388f → #ca247c (4.5:1 on --code-bg); light --tk-str #4a7a3c → #49783b (4.5:1 on --code-bg); light --tk-com #9a9386 → #928a7c (3.0:1 on --code-bg); light --tk-bi #1396a0 → #0f7880 (4.5:1 on --code-bg); dark --accent #108189 → #12929b (4.5:1 on --bg); shared --accent: #108189 / #12929b → #118991 in both (4.08 / 4.06); dark --invert-fg #ffffff → #1a1c23 (final, on --primary).

#### Things (`things`) — colineckert/obsidian-things 2.2.4 @ 9b8bef9

- Mapping: the default; except `--fg-strong` ← --text-normal strengthened; `--tk-kw` ← light --code-keyword, dark today's sheet; `--tk-str` ← light --code-string, dark today's sheet; `--tk-num` ← light --code-value, dark today's sheet; `--tk-com` ← light --code-comment, dark today's sheet; `--tk-bi` ← light --code-function, dark --text-accent; `--tk-var` ← light --code-property, dark today's sheet.
- Type: body `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Ubuntu, system-ui, sans-serif`; heading `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Ubuntu, system-ui, sans-serif`; mono `"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`; radius 8px; heading weight 700.
- Fitted: light --primary #4d8ce6 → #2773e1 (4.5:1 on --bg); light --accent #4d8ce6 → #2773e1 (4.5:1 on --bg); light --border #ebedf0 → #e2e5e9 (1.25:1 on --bg); light --tk-str #0cb54f → #098339 (4.5:1 on --code-bg); light --tk-num #876be0 → #795adc (4.5:1 on --code-bg); light --tk-com #a2aab3 → #86909c (3.0:1 on --code-bg); light --tk-bi #bd8e37 → #8e6a29 (4.5:1 on --code-bg); light --tk-var #2db7b5 → #1f7e7c (4.5:1 on --code-bg); shared --accent: #2773e1 / #4d8ce6 → #367de3 in both (4.04 / 4.01); dark --invert-fg #ffffff → #1c2127 (final, on --primary).

#### Underwater (`underwater`) — seniblue/Underwater 1.6.62 @ 8e1c742

- Mapping: the default; except `--block-bg` ← --background-primary-alt; `--fg-strong` ← --h1-color.
- Type: body `Lexend, Inter, system-ui, sans-serif`; heading `Lexend, Inter, system-ui, sans-serif`; mono `today's stack`; radius 8px; heading weight 700.
- Fitted: light --fg-strong #b4637a → #ad546d (4.5:1 on --code-bg); light --fg-strong #ad546d → #a34e66 (4.5:1 on --block-bg); light --secondary #9893a5 → #767086 (4.5:1 on --bg); light --secondary #767086 → #6c677b (4.5:1 on --block-bg); light --primary #d7827e → #c54b46 (4.5:1 on --bg); light --accent #d7827e → #c54b46 (4.5:1 on --bg); light --border #ece7e3 → #e7e0db (1.25:1 on --bg); light --tk-kw #d7827e → #c3443e (4.5:1 on --code-bg); light --tk-str #ea9d34 → #9e6210 (4.5:1 on --code-bg); light --tk-num #907aa9 → #7e649b (4.5:1 on --code-bg); light --tk-com #9893a5 → #908b9e (3.0:1 on --code-bg); light --tk-bi #56949f → #467881 (4.5:1 on --code-bg); dark --secondary #6e6a86 → #87839d (4.5:1 on --bg); dark --secondary #87839d → #8d89a2 (4.5:1 on --block-bg); dark --tk-var #31748f → #3a8aaa (4.5:1 on --code-bg).

#### Wasp (`wasp`) — santiyounger/Wasp-Obsidian-Theme 1.0.9 @ 72b4307

- Mapping: the default; except `--code-bg` ← --background-primary-alt; `--fg-strong` ← --h1-color; `--faint` ← light --text-faint, dark --text-faint taken 45% toward the page; `--primary` ← --text-accent; `--tk-kw` ← today's sheet; `--tk-str` ← today's sheet; `--tk-num` ← today's sheet; `--tk-com` ← today's sheet; `--tk-bi` ← --text-accent; `--tk-var` ← today's sheet.
- Type: body `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`; heading `ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`; mono `"Source Code Pro", ui-monospace, SFMono-Regular, "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace`; radius 8px; heading weight 700.
- Fitted: light --accent #d4922a → #96671e (4.5:1 on --bg); light --tk-com #9a9386 → #999285 (3.0:1 on --code-bg); light --invert-fg #1f1a14 → #faf6f0 (final, on --primary).

### By hand: what was checked, per Theme

Checked headlessly, in Chromium through Playwright: each Theme in each
Palette (with the browser preferring the same one), on a page served by
`php -S` holding a heading, bold, emphasis, inline code, a Link, a table, a
note, a quote, a PHP block, a CLI block with output and a Mermaid Diagram, and
the Editor on its welcome Document. The page's Theme link and `data-theme` were
swapped in the response, since choosing one is 16's, and the Site Config
`accent` `<style>` block (removed in 16) was dropped from it, because its
`:root` rule outranks a Theme's light Palette. Every one of the 48 views:
no console report but the Diagram's known `style-src` ones, and the Diagram
drawn with its node fill the Theme's `--bg`. Screenshots looked at in sheets,
light beside dark.

- **Baseline** — reads in both; Instrument Serif and Inter fall back to the
  system faces here. Nothing adjusted beyond the fit.
- **Flexoki** — reads in both; the shared teal is a touch quiet on the dark
  page, as in the source. Nothing adjusted beyond the fit.
- **GitHub Theme** — reads in both. `--fg-strong` is strengthened text rather
  than the source's dark `--h1-color`, a green, because the token also draws
  bold, code and table heads.
- **Material Flat** — by hand: the light border is the source's
  `--background-secondary`, since its own border is the page's white; the
  light `--faint` is `--text-muted` taken toward the page, since the source's
  is the muted colour itself; the dark `--block-bg` is the source's
  `#45434c` taken halfway toward the page, because the block-bar labels
  vanished on it; the dark link is `--interactive-accent`, because the
  source's `--text-accent` is nearly the text colour. Syntax from today's
  sheet, the source setting none.
- **Minimal** — reads in both; the default colour scheme. Nothing adjusted
  beyond the fit.
- **Origami** — by hand: the dark `--block-bg` is the source's `#555555`
  taken three quarters of the way toward the page, because on it
  `--secondary` had to be brighter than the body text to read, and the shared
  violet link fell under 3:1 inside a note. The light syntax colours (a pale pink
  and a yellow on grey) were the fit's largest moves.
- **Retroma** — by hand: the light `--block-bg` is the source's lavender
  `--background-secondary` taken halfway toward the page, because on the full
  lavender neither the body text nor the table heads read. The source's
  `--text-muted` is darker than its `--text-normal`, and the port keeps that
  order. The source's default face is `system-ui`; the
  issue asks for its pixel face, so `VT323` and `Press Start 2P` come first.
  `--code-bg` is `--background-primary-alt`, since the source's code
  background is the page. Syntax from today's sheet.
- **Reverie** — reads in both. The source has no `--text-muted`, so
  `--secondary` is its `--text-faint` and `--faint` is that taken toward the
  page; the light code background is the source's heavy grey, kept. Syntax
  from today's sheet.
- **Shimmering Focus** — reads in both; the keyword is the source's pink
  `--bold-color` and the built-in its link colour, the rest from today's
  sheet.
- **Things** — reads in both; the accent is the source's own blue, one
  colour in both modes as in the source, balanced to read on both pages. Dark
  syntax from today's
  sheet, the source setting only the light Palette's colours.
- **Underwater** — reads in both; `--block-bg` is `--background-primary-alt`,
  since the source's secondary background is the page.
- **Wasp** — reads in both; the orange and yellow borders are the source's
  and kept. Dark `--faint` is `--text-faint` taken toward the page, since the
  source's equals its muted colour. Syntax from today's sheet.

The by-hand box stays open for the maintainer's own look in a browser.

The probe pinned Baseline's paper as the sheet's old values; it now pins the
ported Baseline's `--bg` (`#ffffff`, `#1e1e1e`). Probe: 256 of 256 in headless
Chromium and Firefox, with the browser preferring light and preferring dark.

### By hand: the maintainer's look

The maintainer looked at the Editor and the page in every Theme and found
them fine, but for a Diagram's labels, which were cut off at the right. The
cause was older than the Themes: Mermaid measures each label in a scratch
element under `<body>`, where the policy refuses its styles, so it measured
at `<body>`'s 15px and then drew at its own 16px. Both halves now hand
Mermaid `<body>`'s font size as `fontSize`, and every label box is the width
of its text, in Chromium and Firefox, on the page and in the read pane.

With the labels drawn whole, the maintainer confirmed the fix; the by-hand box
is ticked.
