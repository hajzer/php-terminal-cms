# 0.2.0 — diagrams, markdown in by paste, the raw face, twelve Themes, and a site that needs no PHP

Status: done

## Problem Statement

**A diagram has to be drawn somewhere else.** A writer who wants a flowchart
renders an SVG with some other tool, copies it into `media/`, and places it with
an Image Line — which is what `docs/media/architecture.svg` is. The source of
the picture lives outside the Document, so changing one box means going back to
that other tool. GitLab and GitHub draw a ```` ```mermaid ```` fence in place;
this software imports one as a Code Run in an unknown Dialect and prints it as
text, with no highlighting, and `Tab` cannot reach it.

**Prepared markdown cannot come in except as a file.** A paste while editing a
Line is taken as text: its first line lands at the caret and every other line
becomes a Line of the same Type. Pasting a finished article therefore gives a
column of Paragraphs whose text begins `## ` and `- `. A paste with the cursor
on a Line and nothing open does nothing at all. The only way to bring markdown
in as typed Lines is to save it to a file and use *Open .md*, which replaces the
Document rather than adding to it.

**The markdown is only visible at the end.** What the Editor will emit is shown
by `E`, in an overlay, as a snapshot. There is no way to watch the markdown
change while writing, which is exactly when a writer wants to see what a
keystroke did to the file.

**Export has a key and no button.** *Open .md*, *New .md* and *Clear* sit in
the top bar. Export, the one thing the Editor exists to produce, is `E` or
`:export` — invisible to anyone who has not read `?`, and out of reach on a
touch screen.

**The public site needs PHP.** ADR-0002 renders every page at request time,
which is the right answer for an Instance with a PHP host. GitLab Pages and
GitHub Pages serve files and run nothing, and an author who already keeps their
content in a repository there has no way to publish it through them. Every
address the site writes also starts at the domain root, so even a folder of
rendered pages would break when served from `/project/`.

**The page has one look.** The reader sheet is terminal.css recoloured for
reading, light and dark, monospace throughout, and the one thing an Instance
can change about it is `accent`: six hex digits pasted over both modes, which
clash with one of them. An operator who wants their site to read like Things
or Flexoki edits `shared/theme.css` and runs `bin/build`, which is editing the
software. An author can say nothing about how a Document should look, and a
reader's one control, the light-or-dark toggle, is called the "theme" by the
code, the Legend and the docs, so the word is taken before the feature exists.

## Solution

**A `mermaid` Code Dialect, drawn as a Diagram** (ADR-0016). `mermaid` joins
`shared/langs.json` as the fifty-ninth Code Dialect, with light highlighting of
its own keywords. A Code Run in it is a **Diagram**: the Lines stay its source,
the file stays a standard ```` ```mermaid ```` fence, and the Renderer and the
Editor emit it exactly as any code block. A reader's browser then draws it in
place — in the Editor's read pane and on the public page — with Mermaid,
vendored and pinned in the repository, loaded only by a page that has a
Diagram, running with `securityLevel: 'strict'`. The Content-Security-Policy is
not widened: the page draws through `mermaid.render()` and places the SVG
itself, the stylesheet into a `<style>` carrying the page's nonce and each
`style` attribute into the element's CSSOM. With the script blocked, the reader
has the source as an ordinary code block.

**Markdown in by paste.** With the cursor on a Line and nothing open for
editing, `^V` reads the clipboard as markdown — through the same parser as
*Open .md* — and puts the Lines it describes below the cursor, as one undo
entry. Pasted frontmatter merges into the Document's Meta by key, the paste's
value winning. `:paste` and a `paste` entry in the Legend do the same through
the Clipboard API, so a touch screen can reach it. A paste into a Line open for
editing is untouched: it is text, because a pasted shell script's `# comment`
is not a heading.

**The raw face of the reading pane.** The reading pane gets a second face,
**raw**: the exact bytes Export would produce, live, read-only, monospace.
`w`, `^B 4`, `:raw` and a `raw` tab reach it. Split shows write beside whichever
face was chosen last, so writing with the markdown beside it needs no fifth
mode, and the choice is remembered per browser like the swap and the zoom.

**Export .md in the top bar**, beside *New .md*. It opens the export overlay
exactly as `E` does, so the path the file belongs at is shown as ADR-0009
intends.

**A Page Build** (ADR-0017). `php bin/page-build --output=<dir>
--base-url=<url>` renders every page of the Instance to files with the same
Router, Page shell and Renderer that answer a request: `index.html`,
`<category>/index.html`, `<category>/<slug>/index.html` for each Document and
each of its Languages, and `404.html`, beside the public assets. Links are
written `/<category>/<slug>/`, which the request-time Router answers too. The
**Base Path** — the path part of `--base-url` — goes in front of every local
address, a writer's root-relative Href and Image src included. Each page names
its own policy in a `<meta>` element with one random nonce per build. The build
refuses to run without `site/site.php`, renders into a fresh directory and swaps
it into place only when every page has rendered, and replaces only an output
that is absent, empty or marked as an earlier Page Build. `docs/deploy.md`
gains GitLab and GitHub pipelines that run it.

**Twelve Themes, each in two Palettes** (ADR-0018, ADR-0019). A **Theme** is a
named look — Minimal, Wasp, GitHub, Things, Shimmering Focus, Baseline,
Flexoki, Reverie, Retroma, Underwater, Origami, Material Flat — each derived
from the MIT-licensed Obsidian theme of that name, and a **Palette** is its
light or its dark half. A Theme is values for the tokens of the one structural
sheet, nothing more: colours, system font stacks, a radius and a heading
weight, kept as one JSON file per Theme under `shared/themes/`, from which
`bin/build` writes a stylesheet into both halves. No font is shipped and the
policy gains no origin.

The Theme a page is drawn in is the Document's `theme:` Meta, else Site
Config's `theme`, else Baseline; the reader has no Theme control. The Palette is
the reader's stored toggle, else the Document's `palette:`, else Site Config's
`palette`, else the browser's preference. A name that is none of the twelve, or
a word that is neither `light` nor `dark`, is not a choice and the next party
decides. `theme:` prints under the title like any Meta; `palette:` does not,
because the reader can flip it. `accent` is retired, and the one inline style
block on the page with it; the nonce stays for the Diagram's placed stylesheet.
The light Palette is called `light` everywhere, where the code said `normal`.

In the Editor a Theme menu joins the top bar and `T` flips the Palette, with
`:theme <name>` and `:palette light|dark` for the keyboard. They are the
writer's preference, remembered per browser; the read pane is drawn in the
Document's `theme:` where it names one, so the preview is the page. `Tab` on a
`theme:` or `palette:` Meta Line cycles the valid values. A fresh Editor opens
in Baseline and the browser's Palette, as the page does.

## User Stories

### The Diagram

1. As a writer, I want to write a ```` ```mermaid ```` fence and see a diagram
   in the read pane, so that the picture's source lives in the Document.
2. As a writer, I want `Tab` on a Code Line to reach `mermaid`, so that a
   Diagram is made the way every other Dialect is chosen.
3. As a writer, I want Mermaid's keywords coloured in the write pane, so that
   the source reads as source.
4. As a writer, I want Mermaid's error under a Diagram that does not parse, in
   the read pane, so that I can fix it where I am looking.
5. As a reader, I want the Diagram drawn on the published page, in the site's
   theme and accent, so that it looks like part of the page.
6. As a reader, I want the Diagram redrawn when I toggle the theme, so that a
   light diagram never sits on a dark page.
7. As a reader, I want the copy button on a Diagram to copy its source, so that
   I can reuse it.
8. As a reader with scripts blocked, I want the source as an ordinary code
   block, so that the page is still complete.
9. As a reader of a Diagram whose source does not parse, I want the source and
   no error message, so that the page does not print a stack trace at me.
10. As an operator, I want a page without a Diagram to be exactly what it was,
    so that the exception costs nothing where it is not used.
11. As an operator, I want Mermaid served from my own origin, never a CDN, so
    that no reader's browser asks a third party for anything.
12. As an operator, I want the Content-Security-Policy no wider than it was, so
    that ADR-0013's second boundary still holds on a page with a Diagram.

### Paste

13. As a writer, I want `^V` with the cursor on a Line to add the markdown I
    copied as typed Lines below it, so that a prepared article comes in as
    headings, lists, tables and code.
14. As a writer, I want the cursor on the last pasted Line, so that I carry on
    from the end of what I brought in.
15. As a writer, I want one `^Z` to take the whole paste back, so that a wrong
    paste is one keystroke to undo.
16. As a writer, I want pasted frontmatter to set my Document's `title`,
    `category` and `date`, so that pasting a whole article gives me its header.
17. As a writer, I want pasted Meta with a key my Document lacks added after my
    existing Meta, so that no Meta Line lands in the prose.
18. As a writer who has not named the file, I want the Name to follow the
    pasted title, so that the paste behaves like typing the title.
19. As a writer editing a Code or CLI Line, I want a multi-line paste to stay
    Lines of that Type, as today, so that a pasted script is not read as
    markdown.
20. As a writer on a touch screen, I want a `paste` entry in the Legend, so
    that markdown paste is not keyboard-only.
21. As a writer whose browser refuses the clipboard, I want to be told so and
    pointed at `^V`, so that nothing silently fails.

### Raw

22. As a writer, I want a raw view of the exact markdown Export would produce,
    so that I can see what a keystroke did to the file.
23. As a writer, I want raw beside the write pane in split, so that I watch the
    markdown change as I write.
24. As a writer, I want raw to be read-only, so that there is one way to edit a
    Document and one undo.
25. As a writer, I want the Editor to remember whether split shows read or raw,
    so that it opens the way I left it.

### Export .md

26. As a writer, I want an *Export .md* button beside *New .md*, so that the
    Editor's one output is visible without knowing a key.

### Page Build

27. As an author on GitLab or GitHub, I want my Instance published through
    Pages, so that I need no PHP host.
28. As an author on a project page under `/project/`, I want every link, asset
    and image to work, so that the site is usable from a subpath.
29. As an author, I want my own `[x](/guides/y)` Links to keep working on a
    project page, so that I write addresses from my site's root and never think
    about where it is hosted.
30. As an author, I want a built page to be the same page the PHP site serves,
    so that the two ways to publish never disagree.
31. As an author, I want an address shared from one way to publish to work on
    the other, so that moving between them breaks no link.
32. As an author, I want a mistyped address to get the site's 404 page, so that
    a static host looks like the site.
33. As an author, I want the build to refuse without my `site.php`, so that the
    example's title and footer are never published as mine.
34. As an author, I want a failed build to leave the previous one intact, so
    that a broken commit does not empty my site.
35. As an author, I want the build to refuse an output directory it did not
    make, so that a typo in `--output` cannot delete my Instance.
36. As an author, I want a GitLab pipeline and a GitHub workflow I can copy, so
    that setting it up is one file.
37. As a reader of a built page, I want the same policy boundary the PHP site
    has, so that a static host is not a weaker page.

### Themes

38. As an operator, I want to name a Theme and a Palette in `site.php`, so
    that my Instance opens in the look I chose.
39. As an operator, I want twelve Themes to choose from, each derived from an
    Obsidian theme I may already know, so that I pick a look rather than
    design one.
40. As an operator, I want a Theme to look like its namesake with the fonts
    my readers already have, so that nothing is downloaded for it.
41. As an operator, I want each Theme to carry its source's licence, so that
    the MIT terms are kept.
42. As an author, I want `theme: things` in my Document's Meta to draw that
    page in Things, so that one piece can look different from the site.
43. As an author, I want `palette: dark` to open my Document dark for a
    reader who has never chosen, so that a piece designed dark is first seen
    dark.
44. As an author, I want a misspelled Theme to fall back to the site's, so
    that a typo never breaks a page.
45. As a reader, I want the one button to flip light and dark on every page,
    remembered in my browser whatever the Document says, so that my eyes
    decide.
46. As a reader, I want `theme: flexoki` under the title and never
    `palette:`, so that the page tells me what it is, not what I am not doing.
47. As a reader, I want a Diagram drawn in the Theme's colours and redrawn
    when I flip the Palette, so that the picture belongs to the page.
48. As a reader of a built site, I want the same Theme the PHP site would
    give me, so that the two ways to publish agree.
49. As a writer, I want a Theme menu in the Editor's top bar and `T` for the
    Palette, so that I write in the look I like.
50. As a writer, I want the read pane drawn in my Document's `theme:` when it
    has one, so that the preview is the page.
51. As a writer, I want `Tab` on a `theme:` or `palette:` Meta Line to cycle
    the valid values, so that I never guess a name.
52. As a writer, I want `:theme <name>` and `:palette light|dark`, listed in
    the Legend, so that the switchers have a keyboard.
53. As a writer, I want a fresh Editor to open in Baseline and my browser's
    Palette, so that it looks the way the page would.

## Implementation Decisions

### The Dialect

- `mermaid` is an entry in `shared/langs.json` and in `editor/editor.js`'s
  `TYPES` Code Dialects. Comment `%%`; keywords are the diagram kinds
  (`graph`, `flowchart`, `sequenceDiagram`, `classDiagram`, `stateDiagram`,
  `stateDiagram-v2`, `erDiagram`, `gantt`, `pie`, `journey`, `gitGraph`,
  `mindmap`, `timeline`) and the structural words (`subgraph`, `end`,
  `participant`, `actor`, `note`, `loop`, `alt`, `else`, `opt`, `par`,
  `direction`, `class`, `style`, `classDef`, `linkStyle`, `click`). `bin/test`'s
  existing table and dialect checks then cover it in all three implementations.
- The importers already turn ```` ```mermaid ```` into Code Lines with
  Dialect `mermaid`, and the exporter already writes it back. No parser
  changes.
- "Fifty-eight languages" becomes fifty-nine wherever it is written.

### Drawing

- **One vendored copy.** `shared/mermaid.min.js`, pinned, with its MIT licence
  beside it as `shared/mermaid.LICENSE` and its version recorded in its first
  line's comment and in `docs/security.md`. `bin/build` copies it to
  `editor/mermaid.min.js` and `site/public/mermaid.min.js`; `bin/test`'s drift
  check covers both, and `tests/editor-probe.html`'s repathing resolves it.
  Upgrading Mermaid is replacing one file and running `bin/build`.
- **Loaded only when needed.** A page with no Diagram requests nothing new and
  carries nothing new. Where there is one, a `<script>` element is created by
  code that already runs — `ui.js` in the Editor, the enhancement script on the
  page — and on the page it carries the page's nonce (read from the running
  script's `nonce` property), so `script-src` gains nothing.
- **Configuration.** `startOnLoad: false`, `securityLevel: 'strict'`, the
  `base` theme with variables read from the page's CSS custom properties —
  foreground, background, accent — and the page's own font family.
- **Placement.** `mermaid.render()` returns the SVG as a string. It is parsed
  with `DOMParser`; each `<style>` element's text moves into one `<style>`
  created with the page's nonce, each `style` attribute moves into the
  element's `style` through the CSSOM, and the cleaned SVG replaces the code
  block's `<pre>`. The code block's copy button stays and copies the source.
  In the Editor, which sends no CSP of its own, the placement is the same code
  path, so the probe is testing what the page does.
- **Failure.** If `render()` throws, the code block stays. In the Editor's read
  pane Mermaid's message is printed under it; on the public page nothing is.
- **Theme.** Toggling the theme redraws every Diagram on the page from its
  source.
- **Where it runs.** Drawing is presentation, in the DOM half of each side:
  `editor/ui.js` for the read pane, `Page::enhancement()` for the page. The
  Renderer and `renderDoc` do not change — a Diagram's HTML is a code block's
  HTML, which is what keeps the page complete with the script blocked.
- **Stop condition.** If Mermaid turns out to need `'unsafe-eval'`, or its
  output cannot be placed without an inline `style` attribute surviving, the
  implementation stops and comes back to grilling. The fallback named in
  ADR-0016 is not taken silently.
- **The Editor's network claim.** `bin/test` scans the hand-written
  `editor/editor.js` and `editor/ui.js` for connection calls; the vendored
  library is third-party code and is not scanned. The claim in `ui.js`,
  CONTEXT.md and `docs/security.md` becomes: the Document is never sent
  anywhere; the page fetches an image a Line names and, once there is a
  Diagram, its own copy of Mermaid from beside itself.

### Paste

- **Model half, in `editor/editor.js`.** A `Doc` method takes a markdown string
  and the cursor, parses it with the existing `parse()`, and:
  - inserts every non-Meta Line below the cursor, in order, leaving the cursor
    on the last one;
  - for each pasted Meta Line, replaces the value of the Document's Meta Line
    with the same key in place, or appends the Line after the Document's last
    Meta Line — first Meta at the top when the Document has none;
  - leaves the Name rule alone: a Name still following `title` follows the new
    one;
  - reports how many Lines it added and how many Meta it changed, for the
    status line.
  An empty or whitespace-only paste changes nothing. A paste that is only
  frontmatter changes only Meta.
- **One undo entry.** The UI records the paste as one history step, the way a
  column operation is one.
- **UI half, in `editor/ui.js`.** A document-level `paste` listener acts when
  no Line is open for editing, the command line and overlays are closed, and
  focus is not in the Name. The in-edit handler at `ui.js:510` is unchanged.
- `:paste` calls `navigator.clipboard.readText()`. A refusal, a missing API or
  an insecure context puts one sentence on the status line pointing at `^V`,
  and changes nothing.
- The Legend's right-hand group gains `paste` beside `new`.
- A paste while the read or raw face is showing inserts at the cursor as
  usual and changes no face — the cursor exists in every one.

### Raw

- A second element inside the reading pane holds a `<pre>` of
  `toMarkdown(doc.lines)`, redrawn by `render()` like the read pane. The
  pane's mode is `read` or `raw`; the layout mode stays `write`, `read`, `raw`
  or `split`.
- Keys: `v` read, `w` raw, `^B 2` read, `^B 4` raw, `b` split as today. Tabs:
  `write · read · raw · split`, with the status bar's window list to match.
  Commands `:read` and `:raw`.
- The reading face split shows is stored in `localStorage` beside the swap and
  zoom, wrapped as they are.
- Read-only: the `<pre>` is not editable, selectable and copyable.

### Export .md

- A button `Export .md` in `.acts` after `New .md`, calling what `E` calls. Its
  title names the key. `?` lists it.

### Page Build

- **Entry point.** `bin/page-build`, PHP, flags `--output=<dir>` (required) and
  `--base-url=<url>` (optional; absent means the Base Path is empty). Only the
  path part of the URL is used, with any trailing `/` removed.
- **Reuse.** For each address it calls the same `Router::route()` and
  `Page::html()` the entry point calls. It has no page assembly of its own.
  The addresses are the homepage, each Category, each Document in each of its
  Languages as the Listing already enumerates them, and one address that is not
  a Category, whose 404 response becomes `404.html`.
- **The Base Path and the trailing slash** reach every place an address is
  written — `Page` (nav, brand, stylesheets, favicon, logo), `Router` (the 404
  body, a Document's back link, Listing rows), `Listing::url()`,
  `Language::addresses()`, and the Renderer's Href and Image src for values
  beginning with `/`. They reach them as one value the request-time entry
  point sets to `''` and no trailing slash, so request-time output is byte for
  byte what it was. Where this value lives — a Site Config key the entry
  points set, or a parameter — is the implementer's call, provided a writer
  cannot set it in `site.php`.
- **Assets.** Everything in `site/public/` except `index.php` and `.htaccess`
  is copied as it is — the public directory is already public, so copying it
  exposes nothing the PHP site does not.
- **Policy.** One nonce from `random_bytes(16)` per build. Every page carries a
  `<meta http-equiv="Content-Security-Policy">` as the first element of its
  `<head>`, with the entry point's policy minus `frame-ancestors`, which a
  `<meta>` cannot carry. The policy string is defined once and read by both the
  entry point and the build.
- **Output safety.** Render into a fresh sibling directory; on success, remove
  the old output and rename the new one into place; on failure, remove the new
  one and exit non-zero. An existing output is replaced only if it is empty or
  holds the marker `.page-build` in its root; anything else is refused with its
  path named. An output that is or contains `site/`, `content/` or the
  repository root is refused regardless.
- **Site Config.** No `site/site.php`, no build: exit non-zero naming the file
  to copy, as the entry point already says.
- **The Router's trailing slash.** Already trimmed, so request-time answers
  `/guides/install/` today. `bin/test` asserts it rather than assuming it.

### CI docs

- `docs/deploy.md` gains **Publishing as static pages**: what a Page Build is,
  the local preview (`php -S localhost:8080 -t dist/pages`), the change an
  Instance repository needs (drop `site/site.php` from `.gitignore`, commit it —
  it holds nothing secret), and two pipelines:
  - GitLab: `php:8.3-cli`, `php bin/page-build --output=public
    --base-url="$CI_PAGES_URL"`, `test -s public/index.html`,
    `pages: publish: public`, default branch only.
  - GitHub: `actions/configure-pages` with its `base_url` output passed to
    `--base-url`, `actions/upload-pages-artifact`, `actions/deploy-pages`.
- Neither runs `bin/build`: the generated files are shipped, and `bin/test` is
  what keeps them true.
- Both are marked as written against current GitLab and GitHub syntax and not
  run by the suite.

### Themes

- **The token contract.** `shared/theme.css` keeps the structural rules and
  the metrics — font size, line height, space, measure, `--doc-scale`, the
  controls block written in terms of the tokens — and loses every colour and
  typeface. What a Theme must define, in both Palettes: the eleven colours
  (`--bg`, `--block-bg`, `--code-bg`, `--fg`, `--fg-strong`, `--secondary`,
  `--faint`, `--border`, `--primary`, `--accent`, `--invert-fg`) and the six
  syntax colours (`--tk-kw`, `--tk-str`, `--tk-num`, `--tk-com`, `--tk-bi`,
  `--tk-var`). What it defines once, for both: `--font-body`,
  `--font-heading`, `--mono`, `--radius`, `--heading-weight`. Nothing else.
  The list is written once, at the top of `shared/theme.css` in a comment
  `bin/test` parses, and the structural rules reach type and shape only
  through those names. 14 may add a token the port genuinely needs and must
  say which in its comments; it may not add one Theme uses and the others
  leave unset.
- **Names.** `minimal`, `wasp`, `github`, `things`, `shimmering-focus`,
  `baseline`, `flexoki`, `reverie`, `retroma`, `underwater`, `origami`,
  `material-flat`. Spelled like a Category slug. Dune is not among them: its
  source is GPL-2.0.
- **One JSON file per Theme**, `shared/themes/<name>.json`: `name`, `label`
  (what the menu prints), `source` (`repo`, `author`, `license`, the copyright
  line verbatim), the once-only tokens, and `light` and `dark` maps. The
  directory is the list of Themes, and nothing writes the names down a second
  time by hand.
- **`bin/build`** writes, for each file, `editor/themes/<name>.css` and
  `site/public/themes/<name>.css` — the notice in the first comment, the
  once-only tokens and the light map under `[data-theme="<name>"]`, the dark
  map under `[data-theme="<name>"][data-palette="dark"]` and again under
  `@media (prefers-color-scheme: dark)` for
  `[data-theme="<name>"]:not([data-palette="light"])` — and `editor/themes.js`,
  `window.THEMES = [{name, label}, …]`, in file order. `shared/themes/LICENSE`
  holds the twelve notices verbatim, the way `shared/mermaid.LICENSE` holds
  Mermaid's. `bin/manifest.php` already ships `shared`, `editor` and `site`.
- **The attribute pair.** `data-theme` holds the name and `data-palette`
  `light` or `dark`; a missing `data-palette` is the browser's preference.
  Both sit on `<html>`. In the Editor the read pane's root carries both as
  well when the Document pins a Theme: its own `data-theme` and a copy of the
  page's `data-palette`, because the dark selector names both attributes on
  one element.
- **The page.** `Page::html()` writes `data-theme` always and `data-palette`
  when Meta or Site Config decided it; links `theme.css`, then
  `themes/<name>.css`, then `site.css`, every one through the Base Path; and
  writes no `<style>`. `Site::theme()` and `Site::palette()` validate against
  the files in `site/public/themes/` and the two words; the Document's Meta is
  read the same way, and the chain is resolved in one place, with a unit test
  each for its order. The 404 page and a Category with no `index.md` have no
  Document and take Site Config's. `Site::accent()` and `Site::ACCENT` are
  deleted; `accent` in `site.php` is an unknown key like any other.
- **The Meta line.** `Renderer::meta()` and `editor.js`'s `metaBar()` leave
  `palette` out beside `title`. The agreement test's sample gains both keys.
- **The Editor.** `ui.js` stores `tcms-theme` (a name) and `tcms-palette`;
  on load it applies a stored name only if `THEMES` has it, so the old
  `dark`/`normal` values are ignored, and applies no `data-palette` until the
  writer chooses. A `<select id="theme">` in `.acts`, filled from `THEMES`,
  with `label`s. `T` and `:palette` flip `data-palette`; `:theme <name>`
  sets it; both say what they did on the status line and are in the Legend's
  tables. `editor.js` gains the Document's pinned Theme as a method — the
  value of its `theme:` Meta if `THEMES` has it, else null — which `render()`
  puts on the read pane's root; `editor.js` reads `THEMES` the way it reads
  `LANGS`, and the node tests load `editor/themes.js` before it. `Tab` on a
  Meta Line whose key is `theme` cycles `THEMES` and whose key is `palette`
  cycles `light`, `dark`; on any other Meta Line it does what it does today.
  The drawings cache in `ui.js` is keyed by Theme, Palette and source, and a
  Theme change redraws as a Palette flip does. `editor/index.html` links
  every `themes/<name>.css` after `theme.css`; `bin/build`'s probe repathing
  covers them by shape.
- **Issue 13.** The select is one more control in the top bar 13 is about.
  17 adds it in the top bar as it stands and leaves 13's layout to 13.
- **The rename.** `normal` → `light` in the attribute, `ui.js`, the `?`
  overlay's row, `docs/keymap.md`, `docs/config.md`, README. The page's
  enhancement script reads `data-palette` where it read `data-theme` and
  stores `tcms-palette`; `bin/test`'s pinned shell hashes are re-pinned in
  16 and the comment there says why.
- **The policy** does not change a directive. A page without a Diagram now
  carries one `nonce=` attribute, on the script; `bin/test`'s count moves
  from two to one and `docs/security.md` loses the accent paragraph.
- **Page Build** copies `site/public/themes/` as it copies every asset; the
  parity test needs nothing new.
- **The ports.** Each JSON is read off the source theme's own custom
  properties for its light and its dark mode — `--background-primary`,
  `--text-normal`, `--text-accent` and their kin — mapped to the contract;
  the font stack starts with the face the source names and ends in
  `system-ui, sans-serif`; the mono stack stays today's unless the source has
  a stronger opinion. Where a source has sub-schemes (Minimal), its default
  is the port. Where a source's dark and light accents are the same colour,
  so are ours. The six syntax colours come from the source where it defines
  them and from today's sheet, adjusted to the Theme's inks, where it does
  not. Each file's `source.repo` is the one in the Obsidian registry.

## Testing Decisions

### 1. `editor/editor.js` under node, via `tests/js-model.js`

- The paste method: Lines land below the cursor in order; the cursor ends on
  the last; Meta with an existing key replaces in place; a new key appends
  after the last Meta; a Document with no Meta gets them at the top; an empty
  paste and a whitespace paste change nothing; a frontmatter-only paste touches
  only Meta; a paste of a fence, a table and a note produces the Types *Open
  .md* would; the Name follows a pasted title only when it was following the
  title before.
- `toMarkdown` of the raw face is `toMarkdown` — no second serialiser to test.
- `mermaid` is in `TYPES`' Code Dialects and `Tab` reaches it.

### 2. `php bin/test` — tables, dialects, round trip

- The existing checks that every offered Dialect has tables, that the JS and
  PHP tokenizers agree, and that `export(import(x)) === x` run over a sample
  containing a Diagram.

### 3. `php bin/test` — the Page Build

- Build the shipped sample content into a scratch directory with Base Path
  `/proj`. For every address, the built file equals `Page::html()` of the
  routed request after normalising exactly three things: the Base Path on local
  addresses, the trailing slash on links, and the policy's carrier and nonce.
- No `.php` and no `.htaccess` in the output; `404.html`, `.page-build` and
  every copied asset present; every local `href` and `src` in every page
  resolves to a file in the output.
- A root-relative Href and Image src in a Document carry the Base Path; a
  fragment, `https:` and `mailto:` do not.
- Refusals: no `site.php`; a non-empty unmarked output; an output that is or
  contains `site/` or `content/`. Each leaves the filesystem as it found it.
- A build that fails part-way leaves a previous build in place.
- Request-time output is byte-identical to 0.1.9's for the sample content —
  the Base Path's arrival changed nothing at the root.
- The Router answers `/<category>/<slug>/` with the same page as without the
  slash.

### 4. `tests/editor-probe.html` in a browser

- A Diagram in the read pane is drawn: an `<svg>` replaces the `<pre>`, and a
  shape in it has a computed fill that came from the placed stylesheet — the
  test that fails if an upgrade breaks placement.
- An invalid Diagram keeps its code block and shows an error under it.
- The raw face shows `toMarkdown` of the Document and follows an edit.
- Split with raw chosen shows write and raw.
- `^V` with nothing open, driven by a synthetic `paste` event, adds Lines below
  the cursor; `^Z` removes them all; a paste into an open Code Line still
  produces Code Lines.
- *Export .md* opens the export overlay.

### 5. The published page, by hand

- The PHP site and a Page Build served by `php -S`, each with the sample
  Diagram, in a browser with the policy enforced: drawn, styled, redrawn on
  theme toggle, no CSP violation in the console. Recorded in the review issue.

### 6. `php bin/test` — Themes

- Every `shared/themes/*.json` defines exactly the contract tokens — every
  colour in both Palettes, every once-only token, nothing more, nothing
  missing; every colour is six hex digits; `name` equals the file name and is
  slug-shaped; `source.repo`, `source.license` and the copyright line are
  present and the licence is `MIT`.
- The generated `themes/<name>.css` in both halves and `editor/themes.js`
  match what `bin/build` would write (the existing drift check, extended);
  `shared/themes/LICENSE` names every Theme.
- `shared/theme.css` contains no hex colour and no `font-family` or `font:`
  with a face in it outside the contract comment — colour and type reach the
  structure only as `var(--…)`.
- `editor/index.html` links every Theme's stylesheet and no other.
- The page: a Document with `theme: things` gets `data-theme="things"` and a
  link to `themes/things.css`; with none, Site Config's; with neither,
  `baseline`; with an unknown name in Meta, Site Config's, and with an
  unknown name in both, `baseline`. `palette: dark` gives
  `data-palette="dark"`; `palette: tuesday` and no Site Config `palette` give
  no attribute. `accent` in `site.php` changes no byte. No `<style` in the
  shell. The 404 page carries Site Config's Theme. A Page Build with Base Path
  `/proj` prefixes the Theme link, and `/proj/themes/things.css` exists.
- The agreement test, over a sample whose Meta holds `theme:` and `palette:`:
  both renderers print `theme` and neither prints `palette`.
- `tests/js-model.js`: the pinned-Theme method returns the name for a valid
  pin and null for an unknown one or none; `Tab` on `theme:` walks `THEMES`
  and wraps, on `palette:` walks `light`, `dark` and wraps, and on `date:`
  does what it did.

### 7. `tests/editor-probe.html` in a browser — Themes

- Choosing a Theme in the menu sets `data-theme` on `<html>`; `T` flips
  `data-palette`; both survive a reload.
- With `theme: wasp` in the Document and `things` chosen in the menu, the
  read pane's root carries `wasp` and `<html>` keeps `things`; removing the
  Meta Line puts the pane back in `things`; `theme: nope` leaves it there.
- A Diagram is redrawn when the Theme changes, in a fill from the new Theme.

### 8. The twelve, by hand

- Every Theme in both Palettes, in the Editor and on a page with a Diagram, a
  table, a note, a CLI block and a Link, looked at for readability; no
  console report but the Diagram's known `style-src` ones. Recorded in 15.

## Out of Scope

- Editing in the raw face, and any second editing model.
- Drawing a Diagram at build time, or anywhere but the reader's browser.
- Mermaid features that load anything — icon packs, external fonts, `click`
  callbacks, which `strict` already disables.
- A Mermaid-specific Type, key, overlay or preview in the write pane.
- A build-time config file, a sitemap, a `robots.txt`, or anything a PHP
  Instance does not also serve.
- Running the CI pipelines from the suite.
- Changing the request-time URL scheme.
- A paste dialog, or pasting HTML — the clipboard's `text/plain` is what is
  read.
- A Theme switcher for the reader; a Theme per Category; a Theme with more
  than two Palettes, Minimal's sub-schemes included.
- Shipping or loading a typeface.
- A Theme editor, a thirteenth Theme in this release, or a source theme's
  structural ideas — callouts, layouts, icons — beyond its colours, type and
  shape.
- Any change to a Theme's markup: every Theme draws the one markup the two
  renderers emit.

## Further Notes

- ADR-0016 and ADR-0017 are written and accepted. CONTEXT.md has **Diagram**,
  **Page Build** and **Base Path**, and amended **Dialect**, **Editor** and
  **Renderer**.
- The README's "not one byte of third-party JavaScript" becomes true of every
  page without a Diagram and says so; `docs/security.md` gets the same
  correction and a section on the built site's policy.
- The fourth review (issue 10) covers this release's new surface: Mermaid and
  its placement, the paste path, the Base Path's reach into the Renderer, and
  the build's filesystem writes — the first time the code that renders the
  site writes a file rather than a response.
- ADR-0018 and ADR-0019 are written and accepted; ADR-0011 and ADR-0013 are
  marked amended. CONTEXT.md has **Theme** and **Palette**, and amended
  **Meta**, **Site Config** and **Editor**.
- Dune was on the first list and is not on this one: its repository is
  GPL-2.0, and only MIT sources are used.
- The source repositories, from the Obsidian registry: kepano/obsidian-minimal,
  santiyounger/Wasp-Obsidian-Theme, krios2146/obsidian-theme-github,
  colineckert/obsidian-things, chrisgrieser/shimmering-focus,
  svnaxis/obsidian-baseline, kepano/flexoki-obsidian,
  santiyounger/Reverie-Obsidian-Theme, emarpiee/Retroma, seniblue/Underwater,
  7368697661/Origami, threethan/obsidian-material-flat-theme. All twelve
  declare MIT and ship both modes.
- Issue 11, the release, now waits for 14–18 as well.
