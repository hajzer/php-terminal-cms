# 0.3.0 — Sub-categories, Published, a Document's own Media, Bundles, Full View, and a body that takes the Theme's colour

Status: ready-for-agent

## Problem Statement

**A Category is one flat directory.** `guides` that holds PHP, shell and
deployment pieces prints them as one run of rows, and the only place for the
next level is the Name. The router serves two segments and no more.

**Everything under `content/` is a page.** An author who wants a Document on
the server before it should be read — to check it on the real host, or to
have it ready — has to keep it off the server instead. A Category being built
up has the same problem at a larger size.

**Nothing records which picture belongs to which Document.** Every image lives
flat in `site/public/media/`; two Documents cannot each have a `shot.png`, and
taking one Document anywhere means knowing which files are its. The Editor,
opened from `file://`, has never shown an image written `/media/…`.

**A reader can keep nothing but the page.** The markdown is above the document
root, the pictures are scattered in `media/`, and the Editor that could open
the file is not on the server at all. There is no way to take a Document, or a
Category of them, and read or edit it offline.

**A picture is as small as the column.** A screenshot or a wide Diagram is
shrunk to the text width with no way to see it whole, and a Diagram cannot be
saved at all — it exists only as the drawing in the page.

**Links outside the article are drawn by four rules that disagree.** The site
footer's links inherit the article's underline and filled hover and then
override only the colour: on hover the text is `--accent` on a `--primary`
fill, which in Baseline is the same `#8666ee` — the text vanishes. The
doc-foot and the Language indicator each disagree in a smaller way.

**Every Theme reads alike in the body.** A Theme gives seventeen colour
tokens and the body spends almost none of them: every heading is
`--fg-strong`, a table head is `--block-bg`, a quote is `--secondary` with a
`--border` bar, and a Note is the one place `--accent` appears. Five Themes'
light Palettes are white with near-black text, so switching between them moves
the links and little else.

## Solution

**Sub-categories** (ADR-0022). A Category declared in Site Config may declare
Categories of its own, one level down, each a directory inside the parent's.
`/<category>/<sub-category>/<slug>` is served by the same comparisons as
today's two segments. A Document says `category: guides/php`. A parent keeps
its own Documents; its page prints its `index.md`, names its Sub-categories,
and lists its own Documents. The homepage's recent Listing takes from every
Category and Sub-category. The navigation names top-level Categories.

**Published** (ADR-0023). `published` in a Document's Meta, or in a Category's
or Sub-category's Site Config declaration. Absent or `true` publishes; any
other word hides. Not Published is a 404, absent from every Listing, the
navigation and the Language indicator, left out of a Bundle and a Page Build;
a hidden Category takes everything under it. The Meta is not printed under
the title.

**A Document's own Media** (ADR-0024). `site/public/media/<path>/` — the
Document's path under `content/`, repeated — shared by its Languages. A bare
file name in an Image Line names a file there, on the page and in the Editor's
preview alike; an absolute path names that path. No fallback to the flat
directory: an Instance with bare names moves its files once.

**Bundles** (ADR-0025). A Document page offers `<address>.zip`, the Document in
every Published Language with its Media; a Category page offers the Category,
its `index.md` and its Sub-categories' Documents. Each is a slice of the
repository — `editor/`, `site/content/…`, `site/public/media/…`, `README.txt`
— so unzipping it and opening `editor/index.html` reads and edits the Document
offline, pictures included. PHP writes the ZIP at request time and a Page
Build writes it ahead, through one stored-ZIP writer of the site's own;
`bin/build` keeps a generated copy of the Editor in `site/editor/`. Offered
unless the Document's `bundle` Meta, else Site Config's `bundle`, says `false`.

**Full View.** Every Image and Diagram on a public page carries a visible
magnifying glass. It opens the picture alone over the page, fitted to the
screen, one tap from its own size with scrolling; Esc, × or the backdrop close
it. From there an Image saves as its file and a Diagram as the SVG being looked
at or as its `.mmd` source. The page's script adds all of it: the Renderer's
markup and the policy are unchanged, and with scripting off the reader has the
picture as it was. The Editor's preview has none.

**One link rule.** The article's link is the page's link: the same underline
and the same hover everywhere. The site footer, the doc-foot and the Language
indicator rest in `--secondary`; the top navigation is the one exception, a
menu, with no fill.

**The body takes the Theme's colour** (ADR-0026). The structural sheet tints
the body from each Theme's own `--accent` and `--primary`: the Note, the table
head and its rows, the quote's bar, the headings, bold, the rule — and every
Code and CLI block, bar and body, the way Material Flat's PHP block already
looks, whatever its Dialect. No Theme file changes. Chosen on the prototype:
derived tints only, at twice the prototype's starting strength.

## User Stories

### Sub-categories

1. As an operator, I want to declare `php` inside `guides` in Site Config, so
   that a grown Category divides without renaming anything.
2. As a reader, I want `/guides/php/intro` to open the Document and `/guides/php`
   to list the PHP guides, so that the group has an address I can be sent to.
3. As a reader on `/guides`, I want the Sub-categories named above the
   Listing, so that I can find what is one level down.
4. As a writer, I want to write `category: guides/php` and have the Editor's
   export overlay say `content/guides/php/<name>`, so that I know where the
   file goes.
5. As an operator, I want an undeclared directory under a Category to be a
   404, so that the routable surface is still exactly what Site Config says.

### Published

6. As an author, I want `published: false` to keep a Document unreachable
   while it sits on the server, so that I can Transfer it early.
7. As an operator, I want a Category declared `'published' => false` to hide
   its page, its Documents and its Sub-categories, so that a section can be
   built up in place.
8. As an author, I want `published: flase` to keep the draft hidden, so that a
   typo never releases anything.
9. As a reader, I want no Listing, navigation item or Language link to point at
   something that is not there, so that nothing on the site is a dead end.
10. As an operator using a Page Build, I want unpublished pages left out of the
    output, so that a static host never serves them.

### Media

11. As a writer, I want to write `shot.png` in an Image Line and have it mean
    this Document's picture, so that two Documents can both have a `shot.png`.
12. As a writer working offline, I want the Editor's preview to show that
    picture from a checkout or an unzipped Bundle, so that the preview is the
    page.
13. As an operator, I want the release notes to say exactly what to move, so
    that the switch is one evening's work.

### Bundles

14. As a reader, I want a download control on a Document page, so that I can
    take the Document, its Languages and its pictures with me.
15. As a reader, I want a Category page to offer the whole Category, so that I
    can take a section in one file.
16. As a reader, I want to unzip it and open `editor/index.html` and read and
    edit the Document offline with its pictures, so that nothing else is needed.
17. As an author, I want an edited Document to go back onto my Instance with
    the same `rsync` that deploys one, so that import is not a new mechanism.
18. As an operator, I want `'bundle' => false` in Site Config to turn Bundles
    off, and a Document's `bundle:` to override it, so that the default is
    mine and the exception the author's.
19. As an operator on a Page Build host, I want the same Bundles at the same
    addresses, so that the two ways to publish stay one site.

### Full View

20. As a reader, I want a visible magnifying glass on every picture and
    Diagram, so that I know it can be opened, on a touch screen too.
21. As a reader, I want it fitted to my screen and one tap from its real size,
    so that a large screenshot can be read.
22. As a reader, I want to save an Image as its file, and a Diagram as SVG or
    as its Mermaid source, so that I can reuse either.
23. As a reader with scripting off, I want the picture exactly as before, so
    that the page is still complete.

### Appearance

24. As a reader, I want a footer link to look and behave like an article
    link, quieter, so that the page reads as one design.
25. As a reader, I want the text of a link I hover to stay readable in every
    Theme and Palette.
26. As a reader, I want a Theme's character in the body — its Notes, tables,
    quotes, headings and code blocks — without it shouting, so that switching Themes is
    worth it and the page still reads well.

## Implementation Decisions

### Sub-categories

- **Site Config shape.** A Category declaration may carry `'categories' => [...]`
  in the same shape. `Site::categories()` returns each top-level Category with
  its validated Sub-categories; a Sub-category's own `categories` key is
  ignored. A Sub-category slug is spelled like a Category slug, or dropped.
- **Router.** `route()` accepts up to three segments. Two segments: the second
  is a declared Sub-category of the first → its page; else a Document in the
  first. Three: the second must be a declared Sub-category, the third a
  Document in it, else 404. Every path component still comes from Site Config
  or `scandir()`. `resolve()` takes the Category path (`guides` or
  `guides/php`).
- **Collision.** A Sub-category slug equal to a Document's base Name in its
  parent: the Sub-category answers, and `bin/test` reports the shadowed file
  as a warning in the suite's output.
- **Category page.** `index.md` (or the label as `<h1>`), then a list of the
  Sub-categories by label, then the Listing of its own directory if its
  `listing` is on.
- **Listing.** `Listing::recent()` walks every Category and Sub-category; an
  `Entry`'s category is the path, and `url()` writes it.
- **Navigation.** `Page` prints top-level Categories only; the active item is
  the top-level part of the path.
- **The Editor** treats `category:` as text, as it does today; the export
  overlay's path and the Media resolution read it with its slash. No validation.
- **Page Build** writes `<category>/<sub>/index.html` and
  `<category>/<sub>/<slug>/index.html`.

### Published

- **One predicate per kind.** `Site` reads a declaration's `published` (absent
  or `true` → published); `Document::peekMeta()` already reads Meta without a
  render, and one function decides a file's published state from it. Every
  reader of `content/` asks these and nothing else: `Router::resolve()`,
  `Listing::variants()`/`group()`, the Category list as the navigation and the
  Sub-category names, `Language::addresses()`, the Bundle and the Page Build.
- **A hidden Category** behaves as an undeclared one for every reader, its
  Sub-categories included.
- **The Meta line.** `Renderer::meta()` and `editor.js`'s `metaBar()` leave
  `published` out beside `title` and `palette`; the agreement test's sample
  gains `published: true`.

### Media

- **The Renderer.** `Renderer::mediaUrl()` takes the Document's Media
  directory; a non-absolute src is reduced to its basename, as today, and
  placed there. The logo calls it with no Document and keeps `/media/<name>`.
  `Document::html()` passes its path through.
- **The path.** `<category path>/<base>` where `base` is the Name without its
  Language suffix and `.md`; `content/index.md` is `index`, a Category's
  `index.md` is `<category path>/index`.
- **The Editor.** `editor.js`'s image rendering resolves a non-absolute src to
  `../site/public/media/<category>/<base>/<file>` from the `category` Meta and
  the Name. The Editor knows no Language list, so for `what-it-is-sk.md` it
  cannot tell `-sk` from part of the Name: it looks in the directory named by
  the whole Name first and, when that picture fails to load, once more with a
  trailing `-<two letters>` taken off. The second look is the preview's alone;
  the site knows the Language list and resolves exactly. An absolute src is
  left as written, as today.
- **Agreement.** `bin/test` renders the same Image Lines through both halves
  and compares the Media-relative part of the src.
- **The repository's own content** keeps its absolute `/media/architecture.svg`
  and `/media/logo.png`; the starter Document in the Editor gains no picture.

### Bundles

- **Address.** A page's address plus `.zip`: `/<cat>[/<sub>]/<slug>.zip` for a
  Document, `/<cat>[/<sub>].zip` for a Category. The homepage has none. The
  Router recognises a trailing `.zip` on the last segment, strips it, resolves
  the rest exactly as the page, and answers 404 where the page would or where
  the Bundle is not offered.
- **`site/src/Zip.php`.** A stored (method 0) ZIP writer: local headers, CRC-32
  via `hash('crc32b')`, central directory, end record; UTF-8 flag on names;
  streams entries to output without holding the archive in memory. Fixed
  timestamps from each file's mtime so a Page Build is reproducible.
- **`site/src/Bundle.php`.** Given a Document or a Category, lists
  `(archive path, source file)` pairs: `editor/**` from `site/editor/`,
  `site/content/<path>.md` per Published Language, `site/public/media/<path>/**`
  per Document, and a generated `README.txt`. Top directory named after the
  Document's base or the Category path with `/` as `-`. A Category Bundle
  skips Documents with `bundle: false` and every one not Published.
- **The control.** The doc-foot gains `↓ bundle` beside `← category`; a
  Category page shows `↓ bundle` under its Sub-categories. Plain links: no
  script.
- **`bundle` precedence.** Document Meta, else Site Config `bundle`, else on;
  a word other than `true`/`false` falls through. `bundle` is printed under the
  title like any other Meta — it is what the page is doing.
- **`site/editor/`.** `bin/build` copies `editor/` there; `bin/test` checks the
  copy is byte-identical to its source. It sits above the document root, so it
  is not served. `bin/manifest.php` ships it inside `site/`.
- **Page Build** writes every offered Bundle beside the pages at the same
  addresses.
- **Headers.** `Content-Type: application/zip`,
  `Content-Disposition: attachment; filename="<top>.zip"`, the policy header
  as every response.

### Full View

- **In `Page.php`'s script**, after the Diagrams are drawn: every `figure > img`
  and every placed Diagram SVG gets a `<button class="full">` with an inline
  SVG magnifier and `aria-label`. The overlay is one element, built once, with
  `role="dialog"`, focus moved in and restored, Esc, ×, backdrop.
- **Fit / 1:1.** Fit: `max-width:100%; max-height:100%` of the overlay. 1:1:
  natural size, overlay scrolls. A Diagram's 1:1 is its `viewBox` size.
- **Save.** Image: `<a download>` on the image's own URL. Diagram SVG: the live
  SVG serialised with its placed stylesheet's text inlined as a plain `<style>`
  and no nonce, `xmlns` set, as a Blob download. `.mmd`: the Run's source text,
  as a Blob download. No `img-src` change; `bin/test`'s policy pin is unchanged.
- **Styles** in `site.css`, using tokens only.

### One link rule

- `shared/theme.css` keeps the one link rule; `site.css`'s `.site-foot a`,
  `.doc-foot a` and `.languages a` set only the resting `color: var(--secondary)`
  and nothing on hover. `.topbar nav a` keeps its own rule and sets both `color`
  and `background` on hover.
- **`bin/test`**: no rule in either sheet sets a link's `:hover` `color`
  without its `background`, or the reverse.

### The body takes colour

- Chosen on the prototype (`.scratch/0-3-0/prototype/`, issue 01): mode A at
  200%, the strengths in issue 01's table. Derived tints via `color-mix()` in
  `shared/theme.css`, strengths as tokens at the top. No optional per-Theme
  token: no Theme's JSON changes, and the Theme contract is as it was.
- Code blocks: the bar, a CLI body and the Output section take
  `--t-codebar` of the accent into `--bg`; a Code body `--t-code`. Calibrated
  on Material Flat, whose own `--block-bg`/`--code-bg` the derivation
  reproduces.
- The table head's ink is held to 4.5:1 where 200% would put it below.
  ADR-0026 records it and amends ADR-0018.

## Testing Decisions

### 1. `php bin/test` — routing

- Three segments resolve; an undeclared Sub-category, a fourth segment, and a
  third segment under a Document are 404; a Sub-category shadowing a Document
  answers as the Sub-category and the suite warns.
- `Site::categories()` drops a malformed Sub-category and ignores a second level.
- A Category page names its Sub-categories and lists only its own Documents;
  the homepage Listing includes a Sub-category Document with its path.

### 2. `php bin/test` — Published

- One hidden fixture of each kind (Document, Language variant, Category,
  Sub-category), asserted absent from: its address, every Listing, the
  navigation, the Language indicator, a Bundle, a Page Build. `flase`, `no`,
  `0` and `False` hide; absent and `true` publish.
- `published` is not printed by either half.

### 3. `php bin/test` and `tests/js-model.js` — Media

- `Renderer::mediaUrl()` for bare, `./`, `../`, backslash and absolute srcs,
  with and without a Document; the logo unchanged.
- The Editor's resolution under node for the same table; the agreement test
  compares the two.

### 4. `php bin/test` — Bundles

- `Zip` output is read back by PHP's `ZipArchive` where the extension exists,
  and by `unzip -l` otherwise; CRCs check; names are exact.
- A Document Bundle and a Category Bundle list exactly the expected paths;
  `bundle: false` in Meta and Site Config, and the precedence between them.
- `site/editor/` equals `editor/`.
- The Page Build writes the same bytes the request-time route answers.

### 5. `tests/editor-probe.html` — the Editor

- A bare-name Image Line in a Document with `category: about` resolves to
  `../site/public/media/about/<base>/` in the read pane.

### 6. By hand, in Firefox and Chromium

- An unzipped Bundle: open `editor/index.html`, Open .md, the picture shows.
- Full View on an Image and a Diagram, fit and 1:1, all three saves, Esc and
  focus return, on a phone width; no new console report.
- The footer, doc-foot and Language links in every Theme and both Palettes.
- The body colours in every Theme and both Palettes, against the prototype.

## Out of Scope

- A Sub-category inside a Sub-category.
- An unlisted state: reachable but not listed.
- A draft mark, a `published` keystroke or any Published UI in the Editor.
- A fallback from a Document's Media to the flat `media/`.
- A Bundle of the whole Instance; a Bundle from the Editor; the Editor opening
  a `.zip`; any upload or import route on the site.
- Deflate compression in the ZIP writer.
- Pinch or wheel zoom and panning in Full View; Full View in the Editor's
  preview; saving a Diagram as PNG.
- A Theme switcher for the reader.

## Further Notes

- ADR-0022 to ADR-0025 are written and accepted; ADR-0004 gains an "amended by
  ADR-0022" line. ADR-0026 is written with issue 03. CONTEXT.md has
  **Sub-category**, **Published**, **Media**, **Bundle** and **Full View**, and
  amended **Meta**, **Listing**, **Export** and **Editor**.
- The release notes carry the Media migration: for each Document with a bare
  src, `mkdir -p site/public/media/<path>/<base>` and move the file there.
- The operator's `site/site.php` still carries `accent` and no `theme`; 0.2.0
  already ignores `accent`. The release notes say to set `theme`.
- The sixth review (issue 12) covers the new surface: three-segment routing,
  the `.zip` route and its file reads, the Published predicate's reach, the
  Media resolution in both halves, the Full View's Blob downloads, and
  `site/editor/` sitting inside an Instance.
