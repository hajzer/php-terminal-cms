# Changelog

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
  the example content has carried.
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
