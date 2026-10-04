# Changelog

## 0.3.0

A Category divides into Sub-categories, a Sub-category can be a Series that
is listed as one row, a Document can sit on the server before it is read, each
Document keeps its own pictures, a reader can take a Document away as a ZIP
and open it offline, every picture opens in a Full View, and the body of a
page takes its Theme's colour. It is the first release that needs an
instance's own files in a new shape, and the first that carries the tool to
put them there — so the upgrade comes first.

Upgrading an instance:

- **Run `site/migrate` before the new code is copied over.** From the unpacked
  release, `php php-terminal-cms-0.3.0/site/migrate <the instance's site/>`
  is a report and changes nothing: read it. The same command with `--apply`
  does what the report listed. Then copy the code, as always without
  `site.php`. `docs/deploy.md` has the commands under *Upgrading*, with a
  recipe for a host that has no shell and one for an instance kept in a
  repository. What the tool adds, 0.2.0 never reads, so the site goes on
  working at every step and no reader meets a broken picture in between.
- **A bare file name in an Image Line now names the Document's own picture.**
  This is the one breaking change. Until 0.3.0 `![x](shot.png)` — or
  `./shot.png`, or any other src that is not an absolute path — named
  `site/public/media/shot.png`. It now names `shot.png` in the Document's own
  Media, `site/public/media/<the Document's path under content/>/`, and the
  site does not look in the old place. The 0.3.0 Migration copies each such
  picture into the directory of every Document that shows it, a picture two
  Documents name into each. The flat originals stay; the report names the
  ones nothing addresses as `/media/<name>` any more, and they are yours to
  delete. A picture that was already missing is named with its Document and
  line. An Image Line that writes an absolute path, `/media/shot.png`, is
  unchanged and needs nothing.
- **`site.php` is told what it lacks and what is no longer read.** Each key
  this release reads and the file does not have is inserted before its
  closing `];` with its documentation, every line commented out, so no value
  the site runs on changes and the file stays as it was written. For a
  file copied from 0.2.0's example that is `bundle` alone. A key the release
  does not read is named and left alone.
- **`accent` is one of those, and `theme` is what replaces it.** 0.2.0
  retired `accent` and has drawn every page in Baseline since, unless
  `theme` named another Theme. The report now says so: it names `accent` as
  not read, and inserts `theme` and `palette`, commented out, into a file
  that has neither. Set `theme`, and delete the `accent` line.
- **Bundles are on unless `site.php` says otherwise.** Once the code is
  copied, every Document and Category page offers `↓ bundle`. `'bundle' =>
  false` turns them off; see below.
- `site/` gains `migrate`, `migrations/` and `editor/`, all above the document
  root, where no address reaches them. Copying the whole of `site/`, as
  `docs/deploy.md` does, brings them.
- An instance published by a Page Build migrates in its checkout and commits
  the result. `bin/page-build` runs the report first and prints `site/migrate
  has N step(s) to do` when an instance has not been migrated; it builds
  anyway, so read the pipeline's log.

What is new:

- **Migrations.** `php site/migrate [--apply] [<site-dir>]` brings an
  instance's own files into the shape a release reads them in. It runs every
  Migration the code carries, in version order, and then a standing step over
  `site.php`. Each looks at what the instance holds rather than at a version
  it was told, so a second run finds nothing left to do. There are three
  actions and no others: `copy` a file to a path that does not exist, `insert`
  a commented-out block into `site.php`, and `note` something for the operator
  to decide. Nothing is removed and nothing is overwritten. A report with
  steps to do exits 2, a run with only notes exits 0, and `--apply` stops at
  the first write that fails. It runs from the command line and refuses any
  other way of being run. A released Migration is never edited, and `bin/test`
  pins its hash and runs the whole chain over a 0.2.0 instance kept as a
  fixture (`docs/adr/0027-a-migration-adds-and-never-removes.md`).
- **Sub-categories.** A category declared in `site.php` may carry
  `categories` of its own, one level down, each a directory inside its
  parent's. `content/guides/php/intro.md` says `category: guides/php` and is
  read at `/guides/php/intro`; `/guides/php` is the Sub-category's page. A
  parent keeps Documents of its own: its page prints its `index.md`, names its
  Sub-categories, and lists its own directory. The homepage lists from every
  level, and the navigation names the top level only. There is one level, and
  a directory that is not declared is a 404 as it always was. A Sub-category
  with the name of a Document in its parent hides that Document, and
  `bin/test` warns of it. The example content gains `guides/hosting`
  (`docs/adr/0022-a-sub-category-is-declared-one-level-down.md`).
- **Series.** A category that says `'series' => true` in `site.php` makes
  each of its Sub-categories a Series, and each Document in one a Part. A
  Series is one row in a listing, in place of its Parts: its `index.md`'s
  title, date and languages, leading to the Series' page and naming
  `<category>/<sub-category>`. The homepage takes that row and no Part; the
  parent's page lists its Series as rows among its own Documents, by date,
  and no longer names them above; the Series' page lists its Parts by name,
  ascending, whatever their dates. A Series with no Published `index.md` has
  no row anywhere while its page and Parts still answer, and `bin/test` warns
  of it. Only exactly `true` makes Series, the parent says it for all of its
  Sub-categories, and nothing else about one differs — addresses, Media,
  Bundles and `published` are a Sub-category's. No Migration brings an
  instance here: a category without the key is listed as before
  (`docs/adr/0028-a-series-is-one-row.md`).
- **Published.** `published: false` in a Document's Meta, or `'published' =>
  false` on a category or a Sub-category in `site.php`, keeps it off the site
  while it sits on the server: a 404 at its address, in no listing, not in the
  navigation, not linked by the language indicator, in no Bundle and in no
  Page Build. A category takes everything under it. Only no `published` at
  all, or exactly `true`, publishes — `flase` hides, because a typo in a draft
  should keep it a draft. It is the one setting that fails closed. Each
  language is its own file, so a translation can be held back alone. Not
  Published is not secret: the file is on the server and in the repository.
  The line is not printed under the title, and the editor has no draft mark
  (`docs/adr/0023-published-fails-closed.md`).
- A file's Meta is read to the end of its frontmatter, whatever its line
  endings. It was read for fifty lines and split on `\n` alone, which was
  enough for a title and a date and is not enough for a line that hides a
  page.
- **A Document's own Media.** A Document's pictures are in
  `site/public/media/<path>/`, its path under `content/` without the language
  and the `.md`, so every language of it shares one directory and two
  Documents can each have a `shot.png`. Every src that is not an absolute
  path is reduced to its file name and looked for there; an absolute path
  names that path, for a picture that belongs to no one Document, as the logo
  does. There is no fallback to the flat directory
  (`docs/adr/0024-a-document-owns-its-media.md`).
- The editor's read pane shows an Image Line's picture from the same place,
  `../site/public/media/<category>/<name>/` beside its own page, which is
  where a checkout and an unzipped Bundle keep it. It does not know the
  site's languages, so a picture that does not load is looked for once more
  with a trailing two-letter suffix taken off the name. It reduces a src
  exactly as the site does: an `https://` src used to be fetched from where it
  pointed, which the page never did, and is now a file name in the Media like
  any other. `bin/test` renders the same Image Lines through both halves and
  compares them.
- **Bundles.** A Document page carries `↓ bundle` in its foot and a category
  page under its Sub-categories: a plain link to the page's own address with
  `.zip` on it. The ZIP is a slice of the repository — the editor, the
  Document in every language it is Published in under `site/content/`, its
  pictures under `site/public/media/`, and a `README.txt` — so unzipping it
  and opening `editor/index.html` reads and edits the Document offline,
  pictures included, and an edited one goes back onto an instance with the
  `rsync` that deploys one. A category's Bundle holds its `index.md`, its
  Documents and its Sub-categories'. The homepage has none. `'bundle' =>
  false` in `site.php` turns them off and a Document's `bundle:` Meta beats
  it either way; a file that says `bundle: false` is in no Bundle at all. A
  Bundle carries nothing that is not Published
  (`docs/adr/0025-a-bundle-is-a-slice-of-the-repository.md`).
- The ZIP is written by the site's own writer, `site/src/Zip.php`: stored, not
  compressed, streamed to the response as it is read, with no PHP extension
  needed and nothing written to disk. `php bin/build` keeps a copy of the
  editor in `site/editor/` for a Bundle to carry, and `bin/test` fails if it
  differs from `editor/`. A Bundle is about 4 MB, most of it the editor's copy
  of Mermaid.
- A Page Build writes every offered Bundle beside the pages, at the same
  addresses and with the same bytes the request-time site answers, and leaves
  out everything that is not Published. The output grows by about 4 MB for
  each page that offers one.
- **Full View.** Every Image and Diagram on a published page carries a
  magnifying glass. It opens the picture alone over the page, fitted to the
  screen and one tap from its own size, with scrolling; `Esc`, × or a tap
  beside the picture closes it, and focus returns to the glass. From there an
  Image saves as its file, and a Diagram as the SVG being looked at or as its
  `.mmd` source. The page's script adds all of it: the Renderer's markup and
  the Content-Security-Policy are unchanged, a page with no picture is sent
  nothing new, and with scripts blocked a picture is as it was. The editor's
  preview has none.
- **One link rule.** A link in the site footer, under a Document and in the
  language indicator is the article's link, resting in a quieter colour: the
  same underline and the same hover. A footer link's text used to vanish on
  hover in Baseline, drawn in the colour of its own fill. The top navigation
  is a menu and keeps its own rule. `bin/test` fails a rule that sets a link's
  hover ink without its ground, or draws a link anywhere else.
- **The body takes the Theme's colour.** The structural sheet tints the body
  from each Theme's own `--accent` and `--primary`: headings and bold, a
  Note, a table's head and its rows, a quote's bar, the rule, and every code
  and CLI block. No Theme file changes, and a new Theme is tinted the moment
  it exists. Text on a tinted ground leans toward black or white as far as
  keeps it as readable as it was, and `bin/test` works out every piece of
  body text in every Theme and both Palettes and fails one that the tints
  take below 4.5:1. Every page looks different after the upgrade, and none
  needs anything done
  (`docs/adr/0026-the-body-takes-the-themes-colour.md`).
- The editor's export overlay names a Sub-category's directory:
  `category: guides/php` is `content/guides/php/`. It used to make one
  directory name of the two.
- `docs/deploy.md` has *Upgrading* rewritten around `site/migrate`, and *From
  a Bundle*: how an edited Bundle goes back onto an instance.
- CONTEXT.md gains **Sub-category**, **Published**, **Media**, **Bundle**,
  **Full View** and **Migration**.
- A sixth security review, of the surface this release adds: the third
  segment and the `.zip` address, what a Bundle reads, Published, Media in
  both halves, the Full View's saves and `site/migrate`. It found three
  things, all low, and fixed them before the release. A Document named as a
  directory beside it that is not Published or not declared took that directory's Documents'
  pictures into its Bundle; it now takes its own files alone. A symbolic link
  under `media/` led the Migration's copies out of the instance; a copy now
  stays inside `media/` with every link followed, or the run is refused
  before it writes. And a Diagram saved as SVG, opened as a file, asked other
  hosts for the pictures its source named, which the page's policy had
  refused; the saved file now holds nothing that runs or fetches. A Bundle
  also follows no link inside `content/` or `media/`, a `site.php` that is a
  link stays one, and an address with a NUL in it is a 404 on the built-in
  server. Series were read on their own afterwards, and nothing was found.
  `docs/security-audit.md` carries the scope, what was tried and what was
  left alone.

## 0.2.0

A diagram is written in the document and drawn where it is read, markdown comes
in by paste, the markdown can be watched while it is written, a page has
twelve looks to be read in, and a host that runs no PHP can serve the site.
What an instance has to know before upgrading is at the end.

- `mermaid` is the fifty-ninth Code Dialect, and a Code Run in it is a
  **Diagram**. The file holds a standard ```` ```mermaid ```` fence, the one
  GitLab and GitHub draw, and both renderers emit it as the code block it is;
  `Tab` reaches the dialect like any other and its keywords are coloured in
  the write pane. The picture is drawn over the block in the reader's browser,
  in the editor's read pane and on the published page, in the Theme's colours,
  and drawn again when the Palette flips. The copy button copies the source. A
  source that does not parse keeps its code block — the read pane prints
  Mermaid's message under it, the page prints nothing — and with scripts
  blocked a Diagram is the code block it always was.
- Mermaid is the one third-party script, and the first: 11.17.2, vendored as
  `shared/mermaid.min.js` with its licence beside it, served from the site's
  own origin and from beside the editor, never from a CDN, and loaded only by
  a page that has a Diagram. "Not one byte of third-party JavaScript" is now
  true of every page without one, and the README and `docs/security.md` say
  so. It runs with `securityLevel: 'strict'`, and the Content-Security-Policy
  is not widened for it: the script arrives carrying the page's nonce, and the
  page places the drawing itself — the stylesheet under the nonce, each
  `style` attribute through the CSSOM. A page without a Diagram is sent
  nothing new and `bin/test` holds its shell to a fixed hash. `bin/test`
  checks the vendored file against the hash its first line names and the
  version against the one `docs/security.md` names
  (`docs/adr/0016-diagrams-are-the-one-third-party-script.md`).
- `^V` with no line open reads the clipboard as markdown, the way **Open .md**
  reads a file, and adds it rather than replacing: the lines it describes land
  below the cursor with their types, the cursor ends on the last, and one `^Z`
  takes all of it back. Pasted frontmatter merges into the document's meta by
  key — the paste's value where the key exists, a new meta line after the last
  where it does not. `:paste` and a `paste` entry in the legend read the
  clipboard through the browser's Clipboard API, for a screen with no
  keyboard, and say so and point at `^V` where the browser refuses. Only the
  clipboard's plain text is read. A paste into a line that is open is what it
  was: text, each further line a line of the same type.
- The reading pane has a second face, **raw**: the bytes Export would write,
  live, read-only, in monospace. `w`, `^B 4`, `:raw` and a `raw` tab show it
  full width, as `v`, `^B 2` and `:read` show the page. Split shows the write
  pane beside whichever face was shown last, so the markdown can change beside
  the lines as they are written, and the choice is remembered per browser.
- **Export .md** is a button in the top bar, beside **New .md**, opening the
  overlay `E` opens. The top bar and the tabs wrap onto as many rows as a
  narrow screen needs rather than run past its edge, so every control in them
  can be reached on a phone.
- `php bin/page-build --output=<dir> [--base-url=<url>]` is a **Page Build**:
  every page of an instance rendered to files, by the same Router, Renderer
  and page shell that answer a request, so that a host which runs no PHP can
  serve the site. A second way to publish, not a replacement for the first.
  The **Base Path** — the path of `--base-url` — goes in front of every local
  address the site carries, a writer's own `[x](/guides/y)` and an image's src
  included, so a project page under `/project/` works. Links are written with
  a trailing slash, which the request-time site answers too, and `404.html` is
  the site's own. The build refuses to run without `site/site.php`, renders
  beside the output and swaps it in only when every page has rendered, and
  replaces only an output that is absent, empty or an earlier Page Build
  (`docs/adr/0017-a-page-build-is-a-second-way-to-publish.md`).
- A built page names its own policy, in a `<meta>` that is the first element
  of its `<head>`, with one nonce per build — the header's policy but for
  `frame-ancestors`, which a `<meta>` cannot carry. The policy is written
  once, in `site/src/Policy.php`, and `bin/test` builds the sample content
  and requires every built page to be the page the PHP site serves for the
  same address, but for the Base Path, the trailing slash and where the
  policy is named.
- `docs/deploy.md` has *Publishing as static pages*: a local preview, what an
  instance's repository has to change, and a pipeline each for GitLab Pages
  and GitHub Pages, written against their current syntax and not run by the
  suite.
- Twelve **Themes**, each in two **Palettes**. A Theme is a named look —
  Baseline, Flexoki, GitHub, Material Flat, Minimal, Origami, Retroma,
  Reverie, Shimmering Focus, Things, Underwater, Wasp — derived from the
  MIT-licensed Obsidian theme of that name, whose notices are in
  `shared/themes/LICENSE`; a Palette is its light or its dark. A Theme is
  values for the tokens of the one structural sheet and nothing more: colours,
  font stacks that name its source's face and end in the system's, a radius
  and a heading weight, one JSON file each under
  `shared/themes/`, written into a stylesheet for both halves by `bin/build`.
  No typeface is shipped and the policy names no new origin.
  `docs/themes.md` lists them
  (`docs/adr/0018-a-theme-is-values-for-the-one-sheet.md`).
- The Theme a page is drawn in is the document's `theme:` meta, else
  `site.php`'s `theme`, else Baseline; the reader has no Theme control. The
  Palette is the reader's own choice, else the document's `palette:`, else
  `site.php`'s `palette`, else the browser's preference. A name that is none
  of the twelve, or a word that is neither `light` nor `dark`, is not a choice
  and the next in line decides — a misspelling never breaks a page. `theme:`
  is printed under the title like any meta; `palette:` is not, because the
  reader may have flipped the page since
  (`docs/adr/0019-the-document-chooses-the-theme-and-the-reader-the-palette.md`).
- The editor has a Theme menu in the top bar and `:theme <name>`; `T`, the
  **light/dark** button and `:palette` flip the Palette. Both are the writer's
  own, remembered per browser, and a fresh editor opens in Baseline and the
  browser's Palette, as a page does. A document's `theme:` draws the read pane
  in that Theme, so the preview is the page, and `Tab` on a `theme:` or
  `palette:` meta line steps through the values that are valid. The page's
  button is labelled **light/dark** too: it never chose a Theme.
- The editor's page names a Content-Security-Policy of its own, in a `<meta>`:
  script and stylesheets from its own files only, nothing inline, no
  connection. It names no nonce, since a page opened from the filesystem has
  no request to make one for. `bin/test` fails if the policy is removed or
  loosened, and the browser probe runs under it and fails if it refused a
  script or a stylesheet
  (`docs/adr/0020-the-editor-names-a-policy-without-a-nonce.md`).
- A fourth security review, of the surface this release adds: Mermaid and its
  placement, the paste, the Base Path's reach into the Renderer, the Page
  Build's writes and a built page's policy. One finding, medium, in the
  editor, fixed: the status line named an Image Line by its caption without
  escaping it, so a caption carrying markup — in a file opened or, from this
  release, in markdown pasted — put an element on the page that ran. The
  caption is escaped, the probe pastes one and checks, and the policy above is
  the boundary that was missing behind it. Beside it, the build refuses a
  document whose file is named `.md` alone. `docs/security-audit.md` carries
  the scope, the finding, and what was looked at and left alone.
- A fifth, of what landed after the fourth: the Themes and the editor's
  policy. No finding. What it changed is how the policy is checked: `bin/test`
  holds it to its place in `<head>` as well as to its words, and the probe
  asks it to refuse a handler written as markup — a policy moved into
  `<body>`, where a browser ignores it, had passed both. `bin/test` also fails
  if the editor's own scripts write a `style` attribute or make a `<style>`
  element, and if any stylesheet either half ships holds a `url()`, an
  `@import` or an `@font-face`.
- The editor's preview keeps the tab the document is in. A link clicked in
  the read pane — the page's own, or one a Diagram draws — opens in a new
  tab, where it used to take this one and the document with it; a link to a
  heading still scrolls the pane. What is dropped on the page is a `.md` to
  open or is refused, where a dropped URL used to be opened in place of the
  editor; text dropped into a box that is being typed in still lands there.
  The preview's markup is unchanged, and is still the page's byte for byte
  (`docs/adr/0021-the-preview-keeps-the-tab.md`).
- The editor reads a document's meta as the page does: the key is what stands
  before a line's first colon, trimmed, and a key written twice is read from
  the last line that has it. It read the first, and took `theme : things` for
  no key at all, so for such a file the preview's Theme, the file's name and
  its directory were not the page's. `bin/test` compares the two readers.
- CONTEXT.md gains **Diagram**, **Page Build**, **Base Path**, **Theme** and
  **Palette**.

Upgrading an instance:

- **`accent` is retired.** A Theme owns its colours in both Palettes, so
  `accent` in a `site.php` is ignored like any key the file does not list, and
  the page is drawn in Baseline until `theme` names another. Set `theme`, and
  `palette` if the site should open light or dark for a reader who has not
  chosen — `site.php.example` and `docs/config.md` have both.
- **`normal` is `light`.** The light half was `data-theme="normal"` on a page
  and is `data-palette="light"`; `data-theme` now holds the Theme's name.
  Anything of an instance's own in `site.css` that selected on the old
  attribute has to follow. A reader's stored light-or-dark choice, and a
  writer's in the editor, were kept under the old name and are not carried
  over: each opens in the default once and is remembered again from the next
  press.
- The site's document root gains `mermaid.min.js` and `themes/`, and the
  editor `mermaid.min.js`, `themes.js` and `themes/`. Copying the whole of
  `site/` and `editor/`, as `docs/deploy.md` does, brings them.

## 0.1.9

A link lands where the caret is, a table has columns you can point at, both
halves have a face, and everything added since the last review has been read
again.

- `^K` while editing a line opens the address overlay from inside the box and
  puts the link where the writer is. Text selected in the box arrives as the
  wording and the committed link replaces exactly that span; with nothing
  selected the form opens empty and the link lands at the caret. The caret is
  left after the link so typing carries on, one `^Z` takes the whole thing
  back, and `Esc` leaves the line byte for byte as it was. `a` on a line that
  is not open for editing appends, as it always has — there is no caret there
  to speak of.
- A table run in the write pane carries a strip above it, one entry per
  column, each its number and that column's heading cell — so the columns are
  something to look at rather than pipes to count. Clicking an entry selects
  that column; clicking a cell puts the cursor on that row and opens it with
  the caret already in that cell. The strip is drawn for the run the cursor is
  in and for no other, and the selection is gone the moment the cursor leaves
  the run, so there is never a selected column you cannot see. The read pane
  and the exported markdown know nothing about it.
- A selected column reveals `+` `×` `‹` `›` — add, remove, move left, move
  right — and `^←` and `^→` move it from the keyboard. Each is `:col` with the
  selected column's number, so a click and the command run the same operation,
  refuse for the same reasons in the same words, and are one undo step. There
  is still no table object and no grid: the strip is an affordance over lines,
  which is what `docs/adr/0015-tables-are-lines-not-a-grid.md` left room for.
- `favicon` in `site.php` names the icon in the reader's tab, read the way
  `logo`'s src is: an absolute path addresses the document root and stands as
  it is — so `/favicon.ico`, the file every browser asks for by habit, is
  served as a static file with no PHP in the path — and anything else is a
  file name under `/media/`. The link carries a `type` where the extension is
  one this software knows. Leave the key out and a page carries the icon the
  archive ships; name an empty string and it carries none.
- The archive ships a logo and an icon, and `site.php.example` names both
  rather than commenting one out, so an unpacked instance has a face before
  anything is configured — the first binary content an archive has carried.
  The mark is a terminal window with a document leaving it, drawn once and
  shipped at three sizes: the icon in the tab, the mark in the brand at the
  size the bar's line allows, and beside the wordmark as the banner the README
  opens with, in `docs/media/`. The editor's tab and top bar carry the same
  icon and the same mark, as files beside it named by relative path so they
  load from the filesystem. The editor gains no configuration: an instance
  has an identity of its own and the editor has none to have.
- The write pane has the read pane's measure. Both take it from the one
  `--page-measure` in `shared/theme.css`, so switching between writing and
  reading no longer re-flows the document and the two cannot drift. Split
  screen is unchanged, and so are the content size keys.
- The README carries a diagram of the two halves and of where a request goes
  once it reaches PHP, with alt text that is the diagram rather than a label.
  It stands where the text sketch of the two halves stood, in the README and
  on the example site's home page, and the sketch is gone from both. It lives
  in `docs/media/`, which `bin/manifest.php` now names, so the copy in an
  unpacked archive is the copy that was written; the example site's copy under
  `site/public/media/` is written from it by `bin/build` and checked by
  `bin/test`, as the two copies of `theme.css` are, and is the first image
  the example content has carried. The picture has no ground of its own: the
  panels carry theirs, and what stands directly on the page is toned to read
  on white and on dark alike, sharpened for either where the viewer says
  which it prefers.
- The accent is the mark's green. `shared/theme.css` carries `#21e08a` on dark
  and `#137a3f` on light, the deeper one reading on white as the amber it
  replaces did; the default an instance gets when `site.php` names no accent,
  or names one that is not a colour, is the same green, and so is the one the
  example configuration and the diagram's labels wear.
- The editor's claim that it sends nothing is a test. `bin/test` scans
  `editor/editor.js` and `editor/ui.js` for every way a page opens a connection
  and fails naming the file and the call, the way it scans the site's PHP for
  the calls that reach the system. The one request the editor causes — the
  picture an image line names — is the browser acting on markup, which no scan
  can see, and `docs/security.md` says so. The editor's page names
  `no-referrer`, so that request carries the src and nothing about where the
  editor was opened from.
- A third security review, of everything added since the second one at 0.1.4:
  0.1.6, 0.1.7, 0.1.8 and this release. Two findings, both low, both fixed. A
  file whose name ends in the site's own language — `hello-en.md` on an `en`
  site — answered at `/hello-en` as well as at `/hello`; it answers at the bare
  address alone now. The address overlay judged the href as typed rather than
  the href it writes, so it could mark as refused a link the page would make; it
  judges what it will write now. `docs/security-audit.md` carries the scope, the
  table, and what was looked at and left alone.
- From the code read beside it, fixed where found: a relative media path that
  climbs — `../x.png` — is the file it names under `/media/`, as the
  documentation always said, and not `/x.png`; an image's src and caption
  written from the overlay are cut down to what `![caption](src)` can hold, as
  a link's two halves already were; a line break in an open edit box commits
  as one character, so the offset `^K` reads off the box is the offset the
  link lands at; and a `lang` or an `accent` that is not a string is its
  default, quietly, as a malformed category entry already was. One thing it
  found waits as its own issue: a link clicked in the read pane, or a URL
  dropped outside the edit box, can carry the tab away and lose the document
  without a word.
- `bin/build` repaths every relative `href` and `src` of the editor's page into
  the probe by shape rather than by a hand-written list, and `bin/test` checks
  that every asset the probe references exists — so an asset added to the page
  can no longer be one the probe silently asks for and does not get.

## 0.1.8

The two addressed things — a link and an image — are written from the keyboard
rather than counted out in brackets, a table has columns, and an instance has
three more things it can say about itself.

- `a` on the line under the cursor opens what that line addresses. On a line
  that carries links it lists them to pick between; one link opens straight for
  editing and none opens an empty form, so writing the first link in a line is
  also one key. The two fields are the **wording** and the **href**, `Tab`
  between them, `Enter` commits and `Esc` leaves the line as it was. `:link` is
  the same overlay.
- Clearing the href unlinks and leaves the wording as writing; clearing the
  wording is refused, because `[](…)` is not a link a page can make. An href
  the published page would refuse is marked in the overlay with what will happen
  to it — by the same allowlist the page itself uses, so the warning cannot be
  wrong in either direction. It does not stop you committing it.
- The same key on an image line offers `src` and `caption`, and `:img` opens
  the same overlay. An image's caption could not be written from the keyboard at
  all before this; it is the figure's caption and the image's alt text both, so
  a captioned figure is an accessible one.
- `link` joins the legend, so the address overlay is reachable on a touch
  screen — where the legend is the whole interface, and where `a`, `:link` and
  `:img` are all unreachable. It sits among the line types rather than with the
  writing loop, because what it changes is what the line says and not where the
  line is — and it sits next to `figure`, because a link and an image are the
  two addressed things. It is the seventh entry in the same table the other six
  come from, so the button and the key printed on it still cannot come to mean
  two different things.
- The editor's read pane shows the actual picture for an image line, so you can
  see whether you named the right file. One that does not load falls back,
  silently, to the box with the file name in it that was there before. That is
  the one request the editor makes on your behalf, and it is written down in
  `docs/security.md`: the document itself still goes nowhere.
- A table row is edited as a row. `Tab` and `⇧Tab` while editing walk the caret
  from cell to cell, and `Tab` past the last cell commits the row and opens the
  next one with the caret in its first cell — the writing loop, sideways. `o` on
  a table row opens a row as wide as the run it is in, instead of a row one cell
  wide.
- A table has columns: `:col add`, `:col del`, `:col left` and `:col right`,
  counted from 1 and applied across every row of the run at once. `Tab` offers
  the numbers with the heading row's words beside them. Rows shorter than the
  widest are padded first, so a ragged table comes out of its first column
  command square; the run's bounds are where it stops, and one column command is
  one undo step.
- There is still no table object and no grid. A column is the nth cell of every
  row, worked out when asked and never stored, which is why reordering a row is
  `J`/`K` like every other line and undo needed nothing new. See
  `docs/adr/0015-tables-are-lines-not-a-grid.md`.
- `listing_max` in `site.php` is how many documents the homepage lists — a whole
  number, or `0` for all of them. It was a hardcoded fifteen, which is still
  what a site that does not name it gets. A category page is never capped: it
  prints its whole category.
- `link_open => 'tab'` opens links that leave the site in a new tab. Only a
  target naming `http` or `https` qualifies — it is the scheme that is judged,
  not the host, so a local path, a fragment and a `mailto:` address stay where
  they are whatever the setting says. Leave it out and every link opens here,
  as before.
- `logo` puts a picture in the brand link, in front of the title. The src is
  read the way a document's image src is read, so it is always a file under
  `/media/`. `title` is unchanged and does everything it did, including being
  the logo's alt text — an instance is named whether or not the picture loads.
- Controls look like controls. The reader's `A−` `A+` and `theme`, the editor's
  top bar buttons and legend, and the fold arrow and copy button both halves
  share, all get one resting background, one hover and one focus ring —
  written once in `shared/theme.css` in terms of the theme's own tokens, so
  both themes follow and the two halves cannot drift. Nothing moved and nothing
  changed size: it is detailing, not a redesign.

## 0.1.7

A document can be written in more than one language, and both halves work under
a finger as well as under a keyboard.

- A document's language is the suffix on its file name: `what-it-is-sk.md` is
  the Slovak of `what-it-is`. `site.php` names the site's own language in
  `lang` and every other one a name may end in in `languages`; a suffix nobody
  declared is part of the name, because `what-it-is` ends in `-is`. See
  `docs/adr/0014-the-file-name-carries-the-language.md`.
- A listing prints one row per document whatever it is translated into — in the
  site's own language, with `(EN | SK | CZ)` beside it: the one being read
  marked, the others links. A document that exists in one language has no
  indicator. The same indicator sits in the document's own footer.
- The addresses follow the names. `/about/what-it-is` is the English,
  `/about/what-it-is-sk` the Slovak, and a language a document was not written
  in is a 404 rather than a second address for the one it was. A page declares
  the language of the document it is showing.
- Nothing moved and nothing was renamed: a file with no suffix is the site's own
  language and keeps the address it had. A site that declares no languages is
  the site it was.
- A category's `index.md` is its introduction in any language: `index-sk.md` is
  read on a Slovak site, and no `index` is ever listed.
- `site/content/about/what-it-is-sk.md` ships as the Slovak of a document that
  was already there, so a fresh installation shows the indicator working. An
  installation upgrading its code keeps its own `content/` and its own
  `site.php`: until that `site.php` names a language, nothing about it changes.
- Both halves size themselves for a finger by `pointer: coarse` rather than by
  width, so a tablet in landscape — 1024px, and no cursor to hover with — gets
  the same tap targets a phone does. Width still decides layout: below 700px a
  listing row puts the title on its own line and the tagline goes.
- The published page has room for a finger: navigation, listings, language links
  and the text-size and theme buttons.
- The editor's legend is the writing loop on a touch screen — `edit` `new`
  `remove` `↑` `↓` `fold` beside the line types, each doing exactly what the key
  printed on it does. Tapping a line puts the cursor on it; tapping it again
  opens it for writing. A click inside an open line no longer closes it.
- The editor's chrome reflows on a narrow screen, and the sheet uses the visible
  viewport height so an on-screen keyboard does not push the legend off the page.
- The six actions the legend offers and the six keys that do the same things are
  one table, so a button and the key printed on it cannot come to mean two
  different things.
- A title with diacritics keeps its letters when it becomes a file name: "Čo je
  to" is `co-je-to.md`, not `o-je-to.md`.

## 0.1.6

A document could lose a byte. `Markdown::parse()` split the file with PCRE's
`\R`, which without the `u` modifier matches the single byte `0x85` — the
continuation byte of every UTF-8 character whose code point ends in `0x05`. Such
a character was cut through the middle: the parser saw two lines, the byte
between them was dropped, and what came back was no longer valid UTF-8.

- `site/src/Markdown.php` splits on `\r\n|\r|\n` and nothing else, which is
  the set `editor/editor.js` has always split on. The two halves now agree on
  every input, not merely on the ones without such a character.
- The characters this reached are ordinary: `★` (U+2605), Cyrillic `х`
  (U+0445), `Ņ` (U+0145), `ą` (U+0105). A document containing one was corrupted
  by `bin/fmt`, and lost the character on every render, since a page is parsed
  from its file on each request.
- `bin/test` asserts that the three line-break forms are each one break, and
  that a character with an `0x85` continuation byte survives the parser and
  round trips byte for byte. The suite fails on the old parser.

## 0.1.5

Documentation, comments and test names describe the current behaviour. Rationale
lives in `docs/adr/` and release history lives here; neither is narrated in the
reference documents any more.

- Rewrote the passages in `README.md`, `docs/security.md`, `docs/config.md`,
  `docs/keymap.md`, `docs/line-types.md`, `docs/adr/0002`, `docs/adr/0004`,
  `docs/adr/0010`, `docs/adr/0013`, `bin/test` and the comments in `site/src/`
  that described the system by comparison with an earlier version of itself.
  They describe it directly instead. No behaviour changed.
- `docs/adr/0002` no longer states a line count that had gone stale.
- `docs/adr/0004` records the rejected shape rule on a document slug under
  Rejected, with the file name that fails it, rather than as a postmortem.
- `README.md`'s layout block and its summary of `bin/test` match the tree and
  the suite.
- No security statement was softened or removed: `docs/security.md` still says a
  reviewed surface is not a guaranteed one and lists the deployment
  requirements, and `docs/security-audit.md` still carries both reviews in full.

## 0.1.4

Security review of the 0.1.3 hardening and of everything it touched. Two defects
in that release, one missed by it. Full record in
[docs/security-audit.md](docs/security-audit.md).

- The enhancement script is a nowdoc again. Interpolating the nonce had made it
  a heredoc, so PHP read the JavaScript: `$` starts a variable and `\` an
  escape. The script contained neither, so no output was wrong — the next
  regular expression added to it would have been. The nonce is concatenated onto
  the opening tag. Rationale in [ADR-0013](docs/adr/0013-the-page-names-a-nonce.md).
- A document is reachable whatever its file is called. The shape rule 0.1.3 put
  on a request slug was narrower than a file name, so `Release-1.2.md` was listed
  on its category page and then 404ed. Comparing the slug with the real file
  names is the boundary; the shape rule stays on the category, which is the part
  that becomes a directory name.
- `editor/editor.js` uses the same link allowlist as the site. 0.1.3 hardened
  the PHP renderer only, so the editor previewed `//evil.example` as a link.
  Both halves now refuse protocol-relative targets, traversal, backslashes and
  control characters, and both decode the entities in a target before judging
  it. `bin/test` compares them character for character through
  `tests/js-inline.js`.
- Site Config is read in one place, `TerminalCms\Site` — the categories, the
  listing switches and the accent.
- A media path containing a backslash reduces to the file it names.
- A fragment target is `#name`; a `mailto:` target needs an address.
- `bin/test` scans `site/public/index.php` for the calls already forbidden in
  `site/src/`, and covers the link allowlist, the agreement between both halves
  of it, the nonce on both inline points, the accent fallback, malformed
  category entries, unusual file names and the release manifest. 248 assertions.
- `bin/manifest.php` is the one list of what a release archive contains, and
  `bin/test` fails if a tracked file is missing from it. `AGENTS.md`,
  `.gitignore` and `docs/agents/` are in it, so unpacking an archive seeds a
  working repository.
- Removed `docs/visual/`: design prototypes superseded by the editor itself.
- Release notes are `CHANGELOG.md`; the review record is
  `docs/security-audit.md`.

## 0.1.3

Security hardening.

- Per-request CSP nonces in place of `script-src 'unsafe-inline'`, on the
  enhancement script and on the accent style block.
- A `Permissions-Policy` header: no camera, microphone, geolocation or payment.
- Link targets: protocol-relative URLs, traversal, backslashes and control
  characters are refused.
- Image paths: the same, collapsing to `/media/<file>`.
- The configured accent must be a six-digit hex colour.
- Malformed category entries in `site.php` are ignored rather than routed.

## 0.1.2

- An index page lists the documents below it unless `listing` says otherwise —
  one switch for the homepage, one per category.
- A document's own meta is printed under its title, not only indexed.
- The tagline is read in the top bar as well as being the page description.

## 0.1.1

- The footer is Site Config: the lines you write and nothing else.
- The editor names the file, and the name follows the title until you set one.
- Open, new, clear and undo; 58 dialects; a `:` command line.

## 0.1.0

First release under the name php-terminal-cms — renderer, editor, docs, tests
and the packaging script.
