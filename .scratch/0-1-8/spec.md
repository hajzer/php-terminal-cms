# 0.1.8 — addressed things, table columns, and three viewer settings

Status: done

## Problem Statement

**Writing a link is fiddly, and an Image's caption cannot be written at all.**
A writer who wants a link types `[text](href)` by hand into the raw text of a
Line, counts brackets, and finds out whether the Renderer accepted the target
only after publishing — the allowlist rejects it silently, printing the text
flat. An Image is worse: it is a Line whose `text` is the file and whose `sub`
is the caption, and nothing on the keyboard reaches `sub` for an Image. A
caption can only arrive by opening a markdown file that already had one. The
read pane never shows the picture either — only the file name in a box — so
there is no way to tell in the Editor whether the Image is the right one.

**A Table is only editable one whole row at a time.** A Table Run is
consecutive Table Lines, each holding its Cells as one pipe-separated string.
`o` on a Table Line opens a row with one Cell in it, not the row's width. There
is no way to add, remove or move a Column: the writer retypes every Line in the
Run by hand and counts pipes to keep them aligned. Walking from one Cell to the
next means moving the caret through the pipes character by character.

**Three things an Instance cannot say.** The number of documents in the
homepage Listing is a hardcoded `15` in a default parameter. An Instance whose
links mostly leave the site cannot ask for them to open in a new tab. An
Instance with a logo has nowhere to put it — `title` is read in four places
(`<title>`, the brand link, the homepage `<h1>`, and the comparison that
decides whether a page title takes the ` · site` suffix), so markup written
into it leaks into `<title>` as literal text and breaks that comparison.

**Controls are hard to see.** The reader's `A−` `A+` `theme` are bare text in
the top bar and most visitors never notice them. The fold arrow on an Output
Run and the copy button on a Code block are equally quiet, in both the page and
the Editor's read pane.

## Solution

**One key for the addressed thing on a Line.** `a` — *address* — opens a small
overlay. On a text Line it lists the links already in the Line; pick one, or
choose *new link*, and edit `wording` and `href` as two fields. On an Image Line
the same overlay offers `src` and `caption`, which is the first time an Image's
caption is reachable from the keyboard. An href the Renderer's allowlist will
reject is marked, and still committed — the Editor has never refused to let
somebody write something, and the writer now finds out at the moment they type
it rather than after Transfer. Clearing the href unlinks, keeping the wording.
The
read pane shows the real picture for an Image Line, falling back to today's box
when it does not load.

**Cells and Columns from the keyboard.** `o` on a Table Line opens a row
already the width of its Run. `Tab` and `Shift-Tab` while editing a Table Line
walk the caret from Cell to Cell, and `Tab` past the last Cell commits and
opens the next row — the writing loop, sideways. `:col add [n]`, `:col del n`,
`:col left n` and `:col right n` rewrite every Line in the Run at once, naming
a Column by its number, with Tab-completion offering the heading Cells against
those numbers.

**Three new keys in Site Config.** `listing_max` is the number of documents in
the homepage Listing. `link_open` chooses whether a link that leaves the site
opens in a new tab. `logo` puts an image in the brand link beside the title,
leaving `title` a plain string doing its four jobs.

**One control treatment.** A visible resting state, a clear hover and a real
focus ring on the reader's buttons, the Editor's top bar and Legend, and the
fold and copy affordances — the same treatment in all three, verified in both
themes. Nothing moves and nothing changes size.

## User Stories

### The address overlay — links

1. As a writer, I want to press one key on the Line under the cursor and be
   shown the links already in it, so that I can change one without hunting for
   its brackets in raw text.
2. As a writer, I want to pick a link from that list by number or with `j`/`k`,
   so that a Line carrying several links is no harder than a Line carrying one.
3. As a writer, I want a Line with exactly one link to take me straight to
   editing it, so that the common case costs no extra keystroke.
4. As a writer, I want a Line with no links at all to take me straight to
   creating one, so that inserting a link is also one key.
5. As a writer, I want the overlay's two fields to be `wording` and `href` with
   `Tab` moving between them, so that both halves of a link are editable
   without the mouse.
6. As a writer, I want `Enter` to commit and `Esc` to cancel leaving the Line
   untouched, so that the overlay behaves like everything else in the Editor.
7. As a writer, I want a new link to be appended at the end of the Line's text,
   so that I always know where it landed and can move it by editing the Line.
8. As a writer, I want to clear the href and commit, and have the link become
   plain text with its wording intact, so that unlinking costs no separate
   command.
9. As a writer, I want to clear the wording and commit, and be told that a link
   needs wording, so that I cannot produce `[](…)` by accident.
10. As a writer, I want an href the published page will refuse to make a link
    of to be marked in the overlay with what will happen to it, so that I find
    out before I publish rather than after.
11. As a writer, I want that warning not to stop me committing, so that I can
    still write a target the Editor does not recognise and decide for myself.
12. As a writer, I want the same allowlist the published page uses to be the
    one that warns me, so that the warning is never wrong in either direction.
13. As a writer, I want the overlay to work on every Line whose text becomes
    inline markup — heading, Paragraph, List, Quote, Note and Table — so that a
    link is possible wherever the page would render one.
14. As a writer, I want a Line that carries no inline markup — Code, CLI,
    Output, Rule, Meta — to tell me so and change nothing, so that the key is
    safe to press anywhere.
15. As a writer, I want the overlay reachable as `:link` as well, so that the
    command line stays the complete path it claims to be.
16. As a writer, I want editing a link to be one undo step, so that `^Z` takes
    back the whole change and not half of it.

### The address overlay — Images

17. As a writer, I want the same key on an Image Line to offer `src` and
    `caption`, so that I do not have to remember a second key for the same idea.
18. As a writer, I want to write an Image's caption from the keyboard at all,
    so that I can caption a figure without hand-editing the exported markdown.
19. As a writer, I want the caption I write to be both the figure's caption and
    the image's alt text, so that a captioned figure is also an accessible one.
20. As a writer, I want an Image with no caption to stay an Image with no
    caption, so that clearing the field is how I remove one.
21. As a writer, I want `:img` to open the same overlay, for the same reason
    `:link` does.

### The Image preview

22. As a writer, I want the read pane to show the actual picture for an Image
    Line, so that I can see I named the right file.
23. As a writer, I want an image that does not load to fall back to the box
    with the file name in it, so that the Editor opened from a file on disk
    looks exactly as it does today.
24. As a writer, I want the fallback to happen silently, so that a broken
    preview is not an error I have to dismiss.
25. As a person who cares what my Editor talks to, I want it written down that
    previewing an Image fetches that image, so that I know what the page does
    on my behalf.

### Table Cells

26. As a writer, I want `o` on a Table Line to open a row with the Run's Column
    count already in it, so that a new row lines up with the rows above it.
27. As a writer, I want `Tab` while editing a Table Line to move the caret to
    the next Cell, so that filling a row is a rhythm rather than an exercise in
    counting pipes.
28. As a writer, I want `Shift-Tab` to move to the previous Cell, so that I can
    go back and fix the one I just passed.
29. As a writer, I want `Tab` on the last Cell of a row to commit the row and
    open the next one with the caret in its first Cell, so that filling a table
    is one unbroken run of typing.
30. As a writer, I want `Shift-Tab` on the first Cell to do nothing rather than
    leave the row, so that I cannot fall out of the table backwards by accident.
31. As a writer, I want `Tab` to keep cycling Dialects when I am *not* editing,
    so that nothing I already rely on changes.
32. As a writer, I want `Enter` while editing a Table Line to keep meaning
    "commit and open the next Line", so that the writing loop is unchanged.

### Table Columns

33. As a writer, I want `:col add` to append an empty Column to every Line in
    the Run, so that widening a table is one command instead of one edit per
    row.
34. As a writer, I want `:col add n` to insert the Column before Column `n`, so
    that I can widen a table in the middle.
35. As a writer, I want `:col del n` to remove that Column from every Line in
    the Run, so that narrowing a table is also one command.
36. As a writer, I want `:col left n` and `:col right n` to move a Column
    across every Line at once, so that reordering a table does not mean
    retyping it.
37. As a writer, I want Tab-completion on `:col` to show me the heading Cells
    against their numbers, so that I can name a Column without counting.
38. As a writer, I want a Column number that is not in the table to be refused
    with a message, so that a typo does not quietly mangle the Run.
39. As a writer, I want `:col` on a Line that is not a Table Line to say so and
    change nothing, so that the command is safe anywhere.
40. As a writer, I want `:col del` on a one-Column table to be refused, so that
    I cannot reduce a Table Run to empty Lines.
41. As a writer, I want a Column operation to be one undo step, so that `^Z`
    puts the whole table back.
42. As a writer, I want rows that were short to be padded to the Run's width
    when a Column operation touches them, so that the table leaves the
    operation rectangular.
43. As a writer, I want the operation to stop at the edges of the Run, so that
    a second table further down the document is untouched.

### `listing_max`

44. As an Instance owner, I want to say how many documents the homepage Listing
    prints, so that the number is mine rather than the software's.
45. As an Instance owner who writes nothing in `site.php` about it, I want the
    fifteen I have today, so that upgrading changes no page.
46. As an Instance owner, I want `0` to mean every document, so that a small
    site can list everything without inventing a large number.
47. As an Instance owner, I want a value that is not a count — a negative
    number, a word, a fraction — to fall back to fifteen rather than break the
    page, the way a colour that is not a colour already does.
48. As an Instance owner, I want Category pages to stay uncapped, so that the
    place I go to see everything in a Category still shows everything.
49. As an Instance owner, I want `listing_max` to have no effect when `listing`
    is off, so that the two settings do not have to be reasoned about together.

### `link_open`

50. As an Instance owner, I want to say that links leaving my site open in a new
    tab, so that a reader following a reference does not lose their place.
51. As an Instance owner who says nothing, I want every link to open where it
    does today.
52. As an Instance owner, I want local paths and fragments to stay in the tab
    whatever I set, so that my own site never spawns tabs at a reader.
53. As an Instance owner, I want the setting to reach footer links too, so that
    the footer behaves like the writing above it.
54. As an Instance owner, I want an unrecognised value to behave as `here`, so
    that a typo cannot make the site behave unexpectedly.
55. As a reader, I want a link that opens a new tab to carry the protections
    that already accompany external links, so that the target page cannot reach
    back into mine.
56. As a writer, I want the Editor's read pane to keep showing links as they
    render without the setting, so that the Editor stays a view of the Document
    rather than of one Instance.

### `logo`

57. As an Instance owner, I want to put an image in the brand at the top of
    every page, so that my site looks like mine.
58. As an Instance owner, I want the title text to stay beside the logo, so
    that a reader on a slow connection still sees whose site this is.
59. As an Instance owner, I want the logo to be inside the link home, so that
    clicking it does what clicking a brand does everywhere.
60. As an Instance owner, I want the title to be the logo's alt text, so that a
    reader who does not see images still reads the name.
61. As an Instance owner, I want the logo's height capped to the top bar, so
    that a file of the wrong size cannot break the layout of every page.
62. As an Instance owner, I want a `logo` that is not a usable path to be
    reduced to a file under the media directory the same way an Image Line's
    src is, so that Site Config cannot address something the site does not
    serve.
63. As an Instance owner who names no logo, I want exactly the page I have
    today, down to the markup.
64. As an Instance owner, I want `title` to remain a plain string in
    `<title>`, the homepage heading and the page-title suffix, so that adding a
    logo changes nothing about the words.

### Controls

65. As a reader, I want the text-size and theme buttons to look like buttons, so
    that I notice a site has them at all.
66. As a reader using the keyboard, I want a clear focus ring on every control,
    so that I can see where I am.
67. As a reader in either theme, I want the controls legible in both, so that
    the dark theme is not the one where they disappear.
68. As a writer, I want the Editor's top bar and Legend to carry the same
    treatment as the reader's controls, so that the two halves look like one
    piece of software.
69. As a writer on a touch screen, I want the Legend's buttons clearly
    separated, since they are the whole interface there.
70. As a reader, I want the fold arrow on an Output Run to be visible enough to
    find, so that I know there is something folded to open.
71. As a reader, I want the copy button on a Code block to be visible without
    hovering to discover it.
72. As anyone who knows this software, I want nothing to move or change size,
    so that the release is detailing and not a redesign.

### Release

73. As a maintainer, I want each part of this work in its own local commit with
    the suite green, so that a part that turns out badly can be dropped without
    the rest.
74. As a maintainer, I want nothing pushed and nothing packaged until I have
    opened the browser probe and looked at the pages myself.
75. As a maintainer, I want the version in `VERSION` and in the Editor's top bar
    bumped together, since the suite fails when they disagree.
76. As a maintainer, I want the new keys, commands and Site Config settings
    documented in the same release that adds them.

## Implementation Decisions

### The address overlay

- One key, `a`, meaning *address*: the thing this Line points at. Lower case,
  previously unused. `:link` and `:img` reach the same overlay.
- The overlay has two states — a picker and a form. The picker is skipped when
  the Line has no links (straight to the form, empty) or exactly one (straight
  to the form, filled).
- Refused on Code, CLI, Output, Rule and Meta Lines with a message; those Lines'
  text never goes through inline markup.
- Finding and rewriting links inside a Line's text is **model** work and belongs
  in `editor/editor.js`, where node can test it. The overlay's DOM, keys and
  focus are **`editor/ui.js`**, per AGENTS.md and ADR-0005. Every mutation goes
  through `render()`.
- The link pattern the model matches is the one the two `inline()`
  implementations already match; the model exposes finding the links in a Line's
  text, and replacing the nth one with a new wording/href pair or with its
  wording alone.
- The href warning reuses the safe-href logic `editor/editor.js` already carries
  for its preview pane. No new allowlist is written, and no fourth parity
  surface is created.
- Empty wording is refused with a message. Empty href unlinks.
- One committed overlay is one history entry: the overlay commits, then
  `render()` records.

### Images

- An Image remains a Line. `text` is the src, `sub` is the caption. No inline
  `![alt](src)` is added to either `inline()` implementation, and the exported
  shape `![caption](src)` is unchanged, so the round-trip tests keep passing
  untouched.
- The Editor's read pane emits a real `<img>` for an Image Line with an `onerror`
  that restores today's box-with-the-filename. The caption remains the
  `<figcaption>` and becomes the `alt`.
- This is the first outbound request the Editor page makes. `CONTEXT.md`'s
  **Editor** entry and the header comment of `editor/ui.js` are reworded from
  "has no server / talks to no server, ever" to the claim that actually matters
  and stays true: it never sends a Document anywhere, and the one thing it
  fetches is an image a Line names. `docs/security.md` gains a paragraph saying
  so.

### Tables

- A **Cell** is one of the pipe-separated parts of a Table Line. A **Column** is
  the nth Cell of every Line in a Table Run — **derived when asked, never
  stored**. There is no Table object and no grid. Recorded as
  `docs/adr/0015-tables-are-lines-not-a-grid.md`.
- Column operations are model work in `editor/editor.js`: given the cursor
  inside a Table Run, find the Run's bounds, split every Line into Cells, pad
  short rows to the Run's width, apply the operation, join back with ` | `.
- The Run's width is the widest Line in it. Padding happens only when an
  operation touches the Run.
- `:col del` on a Run of width 1 is refused.
- One Column operation is one history entry.
- Cell walking is DOM work in `editor/ui.js`: while editing a Table Line, `Tab`
  and `Shift-Tab` are intercepted on the editing span and move the caret to the
  next or previous pipe-delimited section of the same text. `Tab` past the last
  Cell commits and calls the existing open-line-below path, which already
  inherits Type. `Shift-Tab` on the first Cell is a no-op. `Tab` outside editing
  keeps cycling Dialects, unchanged.
- Row operations invent no new keys: `J`/`K`, `D`, `y` already do them.

### Site Config

- Every new key is read through `Site`, which is the one place a malformed
  config value is turned into a usable one. Three readers are added, following
  the shape of `Site::accent()` and `Site::lists()`.
- `listing_max`: a whole number ≥ 0. `0` means no cap. Anything else — absent,
  negative, non-integer, non-numeric — is the default `15`. Read by the
  homepage route only; `Listing::recent()`'s `$limit` default parameter stops
  being the place the number lives. Category listings are untouched and stay
  uncapped. `listing_max` is irrelevant when `listing` is `false`, because there
  is no list.
- `link_open`: `'here'` (default) or `'tab'`. Anything else is `'here'`.
  `Renderer::inline()` gains an **optional second argument defaulting to
  `'here'`**, so its existing single-argument call signature and output are
  byte-identical to today's. `'tab'` adds `target="_blank"` to links whose href
  matched `https?://` — exactly the set that already receives
  `rel="noopener noreferrer"`, so the guard target needs is already present.
  Local absolute paths, fragments and `mailto:` are never given a target. The
  mode is threaded from `Site` through the Renderer's callers and through the
  footer, so body links and footer links agree.
- **The Editor is never told `link_open`.** It has no configuration and gains
  none. Its preview is always the `'here'` rendering.
- `logo`: a string. Rendered as an `<img>` inside the existing `.brand` anchor,
  before the title text, with the title as its `alt`. The src goes through the
  same reduction an Image Line's src already gets, so anything that is not a
  safe local path becomes a file under the media directory. Height is capped in
  CSS to the top bar's line. Absent or empty → the markup is byte-identical to
  today's.
- `title` is not touched. It stays a plain string filling `<title>`, the brand
  text, the homepage `<h1>` and the page-title suffix comparison.

### Controls

- One treatment, expressed as a small set of custom properties in
  `shared/theme.css` so the site and the Editor cannot drift: a resting
  background and border, a hover, and a `:focus-visible` ring, each defined in
  terms of the existing theme tokens so both themes follow automatically.
- Applied in `site/public/site.css` (the reader's `A−`, `A+`, `theme`), in
  `editor/editor.css` (top bar buttons and the Legend), and in
  `shared/theme.css` (the fold affordance on an Output Run and the copy button
  on a Code block, which both halves share).
- `shared/theme.css` is the single source; `php bin/build` regenerates
  `editor/theme.css` and `site/public/theme.css`. Neither generated copy is
  edited by hand, and `bin/test` checks they are current.
- No layout, no sizing, no spacing changes. The accent stays the one colour an
  Instance controls.

### Release mechanics

- Five local commits on `main`, `php bin/test` green before each. Nothing is
  pushed and `bin/package` is not run until the maintainer has opened
  `tests/editor-probe.html` in a browser and reviewed the pages.
- `VERSION` and the `<i class="ver">` in `editor/index.html` are bumped
  together — the suite fails if they disagree.
- `bin/manifest.php` needs no change: every file touched is inside a directory
  it already ships whole, and `.scratch/` is already listed as tracked and never
  shipped.

## Testing Decisions

A good test here asserts what a reader or a writer would observe — the bytes of
a published page, the text of a Line after an operation — and never how the code
arrived there. The suite has no framework and asserts only what would actually
break the system; new assertions follow that, and each one should correspond to
a thing that could plausibly go wrong.

**Four seams, all of which already exist. No new seam is introduced.**

### 1. `Page::html($site, $router->route($path))` — the whole public page (PHP)

The primary PHP seam: one call exercises the Router building a Listing, the
Renderer rendering a body, the footer, and the page shell. Every Site Config
feature is asserted here, by constructing a config array and reading the
resulting HTML.

- `listing_max`: a config with a small number prints that many rows; `0` prints
  every document; an absent key prints fifteen; `-3`, `'ten'` and `2.5` each
  print fifteen. A Category page prints its whole Category whatever
  `listing_max` says. `listing => false` with a `listing_max` set prints no list.
- `link_open`: with `'tab'`, an external link in a document body carries
  `target="_blank"` and a local one does not; a footer link behaves the same as
  a body link. With `'here'`, with the key absent, and with an unrecognised
  value, no page contains `target=`.
- `logo`: with a logo the brand anchor contains an `img` whose alt is the title
  and whose src is under the media directory; a logo that is not a safe path is
  reduced; with no logo the shell is unchanged from today.

Prior art: the `listings`, `the page shell` and `footer` sections of `bin/test`,
which already build Routers from hand-written config arrays and assert on the
body — `$quietRouter`, `$catRouter`, `$brokenRouter`.

### 2. `Renderer::inline($s, $mode)` — the exact bytes (PHP)

The fine-grained seam, for the assertions where a page-sized haystack would make
a failure unreadable: which hrefs receive `target="_blank"`, that `rel` is still
emitted with it, and that the single-argument call is byte-for-byte what it is
today.

Prior art: the `link targets` section of `bin/test`, which already drives
`Renderer::inline()` over a table of cases and checks for `rel="noopener
noreferrer"`.

`tests/js-inline.js` is **not** changed. It keeps comparing the default mode
against `editor/editor.js`, which remains the parity guarantee it is today.

### 3. `editor/editor.js` under node, via `tests/js-model.js` — the model

Everything with no DOM in it:

- Finding the links in a Line's text: none, one, several, one whose wording
  contains brackets, one adjacent to another.
- Replacing the nth link with new wording and href; replacing it with its
  wording alone (unlinking); appending a new link to a Line that had none.
- Splitting a Table Line into Cells and joining them back, including empty
  Cells and a Line shorter than its Run.
- Finding a Table Run's bounds from a cursor inside it, and not crossing into a
  second Run further down.
- `add` with and without a position, `del`, `left` and `right`, each asserted on
  the text of every Line in the Run.
- Refusals: `del` on a width-1 Run, an out-of-range Column number, a cursor on a
  Line that is not a Table Line.
- An Image Line's src and caption surviving a round trip through export and
  import, including a caption containing brackets.

Prior art: the whole of `tests/js-model.js`, whose convention is that every
assertion is a bug the Editor actually had.

### 4. `tests/editor-probe.js` in a browser — the DOM half

The one test `bin/test` cannot run; the maintainer opens it. It drives the real
page through real key events, so it is where the overlay and Cell walking are
asserted:

- `a` on a Paragraph with two links opens the picker; picking the second fills
  the form with the second link's wording and href.
- `a` on a Line with one link goes straight to the form; on a Line with none,
  straight to an empty form.
- `Tab` moves between the two fields; `Enter` commits and the Line's text
  changes; `Esc` leaves the Line untouched.
- Committing an empty href unlinks and keeps the wording; committing empty
  wording is refused with a message.
- A rejected href shows the warning and still commits.
- `a` on a Code Line says so and changes nothing.
- `a` on an Image Line offers src and caption; committing a caption puts it in
  the export.
- One committed overlay is one `^Z`.
- `o` on a Table Line in a three-Column Run opens a three-Cell row.
- `Tab` while editing walks Cells; `Tab` on the last Cell opens the next row;
  `Shift-Tab` on the first Cell does nothing; `Tab` outside editing still cycles
  Dialects.
- `:col add`, `:col del 2`, `:col left 2` run through the command line and
  change every Line in the Run; `:col del 99` is refused; one `:col` is one
  `^Z`.

Prior art: the whole of `tests/editor-probe.js`, including its `run()` helper
that drives the command line the way `:` does.

## Out of Scope

- **Inline images.** `![alt](src)` inside a Paragraph, List item or Table Cell.
  An Image stays a Line. Adding it would mean new syntax in both `inline()`
  implementations byte-for-byte, a safe-src rule for inline srcs, and a decision
  about an image inside a Table Cell.
- **Linked images.** An Image Line carrying an href so the figure is clickable.
  It would change the Image Line's exported shape, which all three
  implementations round-trip.
- **A grid editing mode.** h/j/k/l between Cells, a current-Cell cursor,
  single-key Column operations. It is a second editing model inside an Editor
  whose premise is that the cursor is on a Line; rejected in
  ADR-0015.
- **A remembered "current Column".** `:col` always takes an explicit number.
  Remembering the last Cell edited would add hidden state that survives cursor
  moves and is invisible on screen.
- **Per-Category `listing_max`.** The homepage is the only capped Listing.
  Category pages stay uncapped.
- **`link_open => 'all'`**, opening local links in a new tab, and any per-scheme
  mapping.
- **A logo that replaces the title text**, and any nested `logo` config shape
  with a `text` switch.
- **The Editor learning any configuration**, including `link_open`. It has none
  and gains none.
- **Any layout, spacing or sizing change** in the visual work. Detailing only.
- **Pushing to the public repository and building a release archive.** Both wait
  for the maintainer's own testing.
- **Markdown link support in `title`.** `title` stays a plain string.

## Further Notes

- The line model exists in three implementations — the JS importer, the JS
  renderer and the PHP Renderer — and ADR-0003 says changing one means changing
  all three. This spec is deliberately arranged so that **none of the three
  change**: no new markdown syntax is added, the Image Line's exported shape is
  untouched, and `Renderer::inline()`'s new argument defaults to today's
  behaviour. The only cross-implementation risk is accidental, and
  `tests/js-inline.js` and the round-trip tests already catch it.
- `Renderer::inline()` is `public static` and called from `Page::footer()` as
  well as from the Renderer's own block code. Every call site has to receive the
  mode or the footer will disagree with the body — a plausible bug worth an
  explicit assertion.
- `docs/keymap.md` documents `a`, `Tab`/`Shift-Tab` in a Table Line, `:col`,
  `:link` and `:img`. The Editor's `?` overlay generates its command table from
  the list that runs the commands, so `:col`, `:link` and `:img` document
  themselves there; only the key table is hand-written.
- `docs/config.md` gains sections for `listing_max`, `link_open` and `logo`, and
  the example config at the top of the file and `site/site.php.example` both
  grow the keys with their explanatory comments — `site.php.example` is the file
  a new Instance copies.
- `CONTEXT.md` gains **Cell** and **Column**, and its **Editor** and **Site
  Config** entries are updated. It stays a glossary: none of the decisions above
  belong in it.
- Free unmodified keys after this release: `d`, `h`, `w` and most capitals.
