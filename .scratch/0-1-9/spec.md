# 0.1.9 — a link where the caret is, a table you can point at, a face, and a
hard look

Status: ready-for-human

## Problem Statement

**A link can only land at the end of the Line.** `a` opens the address overlay,
the two fields are filled in, and the link is appended — always. 0.1.8 decided
that deliberately, so that a writer always knows where it went (story 7), with
"you can move it by editing the Line" as the way to put it anywhere else. In
practice a link belongs in the middle of a sentence, so the writer creates it at
the end and then cuts `[wording](href)` out of the tail and pastes it into
place. That is the bracket-counting the overlay was built to abolish, arrived at
by a longer road.

**On a touch screen a Table is still out of reach.** 0.1.8 shipped with the
address overlay reachable by key alone; `link` joined the Legend in `341b75d`
before the tag, so a link and an Image's caption are now a finger away. Every
Column operation is not: `:col` is a command, and the `: commands` hint in the
Legend is inert text.

**A Table is only reachable through the command line.** `Tab` walks the Cells of
a row and `J`/`K` move a row, but every Column operation is `:col add|del|left|
right` with a number the writer has to work out. Nothing on screen says a Table
has Columns, how many there are, or which one is the third. The writer counts
pipes — in a different place and for a different reason than before, but counts
them.

**Four releases of new surface have not been reviewed.**
`docs/security-audit.md` records two reviews, at 0.1.3 and 0.1.4, and says
0.1.5 changed no behaviour.
0.1.6, 0.1.7 and 0.1.8 are not in it. What has arrived since the last review
includes a Language in a file name reaching the Router, a Listing that groups
files by base name, three new Site Config keys — one of which puts a path in the
page shell and one of which adds an attribute to a link — the inline allowlist
gaining a second reader in the Editor's overlay, and the Editor making an
outbound request for the first time in its life.

**The Editor's claim about itself is no longer checked.** Until 0.1.8 the claim
was "talks to no server, ever", and it was true by inspection. It is now the
narrower "a Document is never sent anywhere; the one thing this page fetches is
an image a Line names", written in `ui.js`, in CONTEXT.md and in
`docs/security.md`. Nothing verifies it. The suite scans the site's PHP for
dangerous calls and has done since 0.1.4; it does not scan the Editor for the
ways a browser page can talk to the network.

**Neither half has a face.** No page in this software emits a favicon — not the
published site, not the Editor. Every browser asks for `/favicon.ico` anyway, so
a reader gets a blank tab icon and the server renders a 404 page to answer a
request it was always going to receive. `logo` arrived in 0.1.8 and puts a
picture in the brand link, but Site Config cannot name an icon, the shipped
example Instance leaves `logo` commented out so a fresh unpack demonstrates
neither, and the Editor spells its name out in text with nothing in its tab.

**Write mode is narrower than read mode, for no reason anybody chose.** The
write surface is capped at 80 characters and the read pane at `--page-width`,
which at each pane's own font size is about 670px against about 930px. Switching
between them re-flows the document and moves every Line the eye was resting on.
Split mode already uncaps the write surface entirely, so the narrow measure
applies only in the one mode with the most room for it.

**The README explains a visual idea in prose.** Two halves that never talk to
each other, and a document that is an ordered sequence of typed Lines, carried
by one ASCII sketch and a lot of words.

## Solution

**The link lands where the writer is.** While a Line is open for editing, `^K`
opens the address overlay, and what it commits is placed at the caret rather
than at the end. Text selected inside the edit box arrives in the overlay as the
`wording`, and the committed link replaces that selection — which is what
selecting a phrase and asking for a link means everywhere else. `a` on a Line
that is not open for editing keeps today's behaviour exactly, appending, because
there is no caret to speak of and the end is the only honest answer.

**A Table says what its Columns are.** A Table Run in the write pane carries a
strip above it, one entry per Column, each showing that Column's heading Cell.
Clicking an entry selects that Column and reveals `+ × ‹ ›` — add, remove, move
left, move right — which call the same `Doc.prototype.column` the commands call.
Clicking a Cell puts the cursor on that row and opens it with the caret already
in that Cell. With a Column selected, `^←` and `^→` move it.

**A favicon that is a setting, and one that is a file.** Site Config gains
`favicon` beside `logo`, read through the same media-path reduction — so a local
absolute path stands as it is and `/favicon.ico` at the document root is
expressible, and anything else is the file it names under `/media/`. The archive
ships a real icon and a real logo, and `site.php.example` names both rather than
commenting one out, so an unpacked Instance has a face before anything is
configured. The Editor gets the same mark and the same icon as **files beside
it**, because the Editor is never told any configuration and does not start now:
an Instance has an identity of its own and the Editor has none to have.

**The write pane takes the read pane's measure.** One token governs both, so
they cannot drift, and moving between the two modes stops moving the words. It
is still a measure and not the absence of one: an ultrawide window should not
produce a line of text a metre long, which is why this matches the read pane
rather than uncapping the way split mode does.

**Diagrams in the README.** They live in `docs/media/`, referenced by relative
path so they resolve on a git host and in an unpacked archive alike, with alt
text written as writing because a README is also read in a terminal and with
images off. The files, the manifest line that ships them and the references that
point at them arrive in one commit: `bin/test` fails when a tracked file is not
named by `bin/manifest.php`, so a file added without the line turns the suite
red, and a reference added without the file ships a README pointing at nothing.

**A third review, and the findings it produces.** One review of everything added
since 0.1.4, in the shape the first two took: scope written down, findings in a
severity table, fixes made in this release, and the whole of it appended to
`docs/security-audit.md` as `## 0.1.9 — third review`. A deep code review runs
beside it and against the same surface — correctness, dead ends and drift rather
than exposure — and its findings become issues or fixes, not a second document.
A review that finds nothing still writes its scope down, because an unreviewed
surface and a reviewed one that was clean are not the same claim.

**The Editor's claim becomes an assertion.** `bin/test` scans `editor/*.js` for
the ways a page reaches the network, the way it already scans the site's PHP for
the ways code reaches the system. The one request the Editor makes is an
`<img src>` the browser issues from markup, not a call in the source, so a
source that names none of them is a source that sends nothing — and the sentence
in `ui.js` stops being a promise and starts being a test.

**The cursor is still on a Line.** There is no Cell cursor, no `h`/`j`/`k`/`l`
between Cells, and no second editing model — ADR-0015 stands as written and this
is the interface it left room for. A selected Column is not remembered state: it
is drawn on screen the whole time it exists, and it is gone the moment the
cursor leaves the Run. 0.1.8 rejected a remembered current Column because it
would be "hidden state that survives cursor moves and is invisible on screen";
a strip the writer is looking at is neither hidden nor invisible, which is what
makes this one allowed.

## User Stories

### The link where the caret is

1. As a writer, I want to select a phrase in the Line I am editing, press one
   key, and have that phrase become a link's wording, so that linking a phrase
   is the same gesture here as everywhere else I write.
2. As a writer, I want the committed link to replace exactly the text I
   selected, so that the sentence reads the way it read before.
3. As a writer with nothing selected, I want the link inserted at the caret, so
   that I can put one where I am without selecting first.
4. As a writer, I want the overlay to open with the selection already in the
   `wording` field, so that I only have to write the href.
5. As a writer, I want `Esc` to leave the Line byte for byte as it was, caret
   and selection included, so that opening the overlay is never destructive.
6. As a writer, I want `a` on a Line I am not editing to append exactly as it
   does today, so that nothing I already know stops being true.
7. As a writer, I want one link edited or inserted to be one undo step.

### The Table strip

8. As a writer, I want a Table Run to show its Columns above it, so that I can
   see how many there are and which one is the third without counting pipes.
9. As a writer, I want each entry to show that Column's heading Cell, so that
   I can find the Column by what it says rather than by its number.
10. As a writer, I want to click an entry to select that Column, so that the
    thing I am about to operate on is the thing I pointed at.
11. As a writer, I want a selected Column to offer add, remove, move left and
    move right, so that every `:col` operation has a place to be clicked.
12. As a writer, I want `^←` and `^→` to move the selected Column, so that the
    operation is on the keyboard and not only under the mouse.
13. As a writer, I want the selection drawn on screen for as long as it exists
    and dropped when the cursor leaves the Run, so that there is never a
    selected Column I cannot see.
14. As a writer, I want to click a Cell and land in that Cell, so that editing
    the third Cell of the fourth row is one gesture.
15. As a writer, I want the strip to disappear when the cursor is not in a Table
    Run, so that it is not chrome on a document that has no tables.
16. As a writer, I want a Column operation from the strip to be one undo step,
    the same one `:col` produces.
17. As a writer, I want `×` on a Run one Column wide to be refused and say why,
    as the command is.

### The logo, the favicon and the diagrams

18. As a reader, I want the tab showing a page of this site to carry an icon,
    so that I can find it among twenty other tabs.
19. As an Instance, I want to name my own favicon in `site.php`, so that the
    icon is mine the way the logo and the accent already are.
20. As an Instance, I want the icon read the way the logo's src is read, so that
    there is one rule about what a configured path may be and not two.
21. As an Instance, I want `/favicon.ico` at the document root to be
    expressible, so that the file browsers ask for by habit can be the file they
    get, served without PHP in the path.
22. As someone unpacking the archive, I want a logo and an icon already there
    and already named in the example config, so that a fresh Instance has a face
    before I configure anything.
23. As an Instance with no interest in either, I want to be able to say none and
    get none, so that "say nothing" and "say none" are different answers.
24. As a writer, I want the Editor's tab to carry an icon, so that the tab I
    write in is findable too.
25. As a writer, I want the Editor's top bar to carry the same mark the site
    does, so that the two halves look like one piece of software.
26. As a writer who opens the Editor from a file on disk, I want its mark and
    its icon to load there, so that the page works the way it is actually used.
27. As a maintainer, I want the Editor to gain no configuration of any kind, so
    that "the Editor is never told anything" stays true.
28. As a maintainer, I want adding an asset to the Editor's page to be caught
    when it is not repathed into the probe, so that the probe cannot silently
    ask for a file that is not there.
29. As a reader of the README, I want diagrams of the things it explains in
    prose, so that the shape of the system arrives before the paragraphs do.
30. As a reader of the README in a terminal, with a screen reader, or on a phone
    with images off, I want alt text that is the diagram rather than a label,
    so that I lose nothing.
31. As someone who unpacked the archive, I want the README's images to be in it,
    so that the copy I have is the copy that was written.
32. As a maintainer, I want the files, the manifest line and the references to
    arrive together, so that the repository is never in a state where one of
    the three is missing.

### The write pane's measure

33. As a writer, I want the write pane as wide as the read pane, so that the
    document does not re-flow when I switch between looking and writing.
34. As a writer, I want the two measures to come from one value, so that moving
    one can never leave the other behind.
35. As a writer on a very wide screen, I want the write pane still to have a
    measure, so that a Line is not a metre long.
36. As a writer, I want split screen unchanged, since each pane filling its half
    is already what I want there.
37. As a writer, I want the content size keys to behave exactly as they do now,
    so that one change does not quietly become two.

### The review and the audit

38. As a maintainer, I want everything added since the last review looked at
    once, so that four releases of new surface are not carried into a public
    release unexamined.
39. As a maintainer, I want the review's scope written down even where it finds
    nothing, so that "nobody looked" and "somebody looked and it was clean" are
    told apart later.
40. As a maintainer, I want the findings in a severity table in the shape the
    first two reviews used, so that the record reads as one document and not as
    three.
41. As a maintainer, I want each finding fixed in this release or written up as
    its own issue with a reason for deferring it, so that a finding cannot be
    recorded and then quietly lost.
42. As a maintainer, I want a surface that was looked at and deliberately left
    alone to say so and say why, as 0.1.4's review did.
43. As a maintainer, I want every fix to arrive with the assertion that would
    have caught it, so that the same defect cannot return unnoticed.
44. As a maintainer, I want the Language suffix reaching the Router reviewed,
    since a request slug becoming a file name is the oldest boundary here and it
    gained a new shape in 0.1.7.
45. As a maintainer, I want `logo` reviewed as a config string that becomes a
    path in the page shell, since that is the newest way `site.php` reaches the
    page as something other than writing.
46. As a maintainer, I want `link_open` reviewed for what `target="_blank"` adds
    beside the `rel` that was already there, and for whether the scheme test is
    the right test.
47. As a maintainer, I want the href allowlist reviewed now that the Editor's
    overlay reads it as well as the Renderer, since the two halves disagreeing
    is exactly the 0.1.4 finding that the parity test exists to prevent.
48. As a maintainer, I want the Editor's one outbound request reviewed as the
    new thing it is, and the documentation about it checked against what the
    code does.
49. As a person who cares what my Editor talks to, I want the claim that it
    sends nothing to be a test rather than a sentence, so that a future change
    that adds a request fails the suite instead of quietly making the
    documentation wrong.
50. As a maintainer, I want the deep code review's findings to become issues or
    fixes rather than a second document, so that there is one record of security
    and one backlog of everything else.
51. As a maintainer, I want the suite green and the probe run in a browser at
    the end of the review, so that the review's own changes are held to what
    every other change here is held to.

## Implementation Decisions

### Link placement

- `editor/editor.js` gains `addLinkAt(text, wording, href, at, end)`, beside
  today's `addLink`. It is model work and is tested in node. `addLink` stays and
  keeps its callers: appending is still what `a` does outside editing.
- The caret offset and selection extent are DOM facts, so `editor/ui.js` reads
  them off the editing span before the overlay opens and hands them in as
  numbers. `editor.js` is never told about a Selection — the split ADR-0005 and
  AGENTS.md draw between the two files holds.
- `^K` is bound on the editing span's own keydown handler, beside the `Tab`
  that walks Cells, and calls `preventDefault()`.
- Committing restores the edit box from the model and puts the caret after the
  inserted link, so the writer carries on typing where they left off.

### The Table strip

- Drawn by `editor/ui.js` from `doc.columns(doc.cur)`, which already exists and
  already returns the heading Cells padded to the Run's width. No new model
  call is needed to draw it.
- The selected Column is a number held in `ui.js` beside the pane and swap
  state, not on the Doc and not in the history. `render()` clears it when
  `doc.tableRun(doc.cur)` is null or names a different Run.
- The four controls call `doc.column(op, n)` — the same entry point, the same
  refusals, the same one-rewrite-is-one-history-entry.
- Clicking a Cell computes which Cell was hit from the click offset, then uses
  the existing `caretToCell(span, n)`.
- The strip is write-pane chrome and is not rendered into the read pane, does
  not reach `renderDoc`, and has no expression in the exported markdown.

### The logo, the favicon and the diagrams

- `favicon` is read in `TerminalCms\Site` beside `logo` and emitted as one
  `<link rel="icon">` by the page shell. It goes through the media-path
  reduction that already exists and **no second rule is written** — that code is
  audited and does exactly what is wanted, including keeping a local absolute
  path as it stands.
- The link's `type` follows the file's extension where that is known, because an
  SVG icon wants one; an extension nobody recognises emits the link without a
  type rather than guessing at one.
- Absent and empty are different: no key gets the shipped default, an empty
  string gets no link at all.
- The archive ships two real assets — a logo under `site/public/media/`, which
  is where `.gitkeep` already says images live, and an icon at the document
  root, so the file browsers ask for by habit is served statically with no PHP
  in the path. `site.php.example` names both instead of commenting `logo` out.
- **The Editor gains no configuration.** Its mark and its icon are files shipped
  in `editor/`, addressed by relative paths that resolve under `file://`,
  because the Editor is opened from a filesystem as often as from a server.
- The Editor's wordmark and version stay where they are; the mark joins them and
  is sized to the top bar's existing line.
- **`bin/build`'s repathing becomes generic.** It is a hand-written list of five
  assets today, and `bin/test` compares the probe to the page by undoing the
  rewrite generically — so an asset that was never rewritten matches anyway and
  the check passes while the probe asks for a file that is not there. Confirmed
  by simulation before this spec was written. Every relative `href=` and `src=`
  is repathed, the probe's own script excepted, and an assertion checks that
  every asset the probe references resolves.
- The diagrams live in `docs/media/`, referenced by relative path so they
  resolve on a git host and in an unpacked archive alike. `bin/manifest.php`
  gains that directory — `docs/` is listed file by file rather than copied
  whole, so a new directory under it is invisible to the archive until it is
  named, and `bin/test`'s manifest check is what catches the omission.
- The files, the manifest line and the README's references are one commit.
  `bin/test`'s manifest check is what enforces the first half of that, and it is
  why they cannot be staged separately.

### The write pane's measure

- The write surface takes the read pane's measure from the same token, in write
  mode only. Split mode and read mode are untouched.
- The two panes sit on different font bases — the sheet is 14px, the reader page
  is `--global-font-size` — so a value in `em` or `ch` resolves differently in
  each. The **computed width** is what has to match; the declaration is whatever
  achieves that.
- `--page-width` itself does not move. It is the published page's measure too,
  and this is the Editor catching up to it, not a redefinition of it.
- `--doc-scale` continues to apply as it does in each pane today.

### The review and the audit

- One section appended to `docs/security-audit.md`: `## 0.1.9 — third review`,
  carrying its scope, a severity table, what was looked at and left alone, and
  what changed as hardening rather than as a finding. The file's existing
  `## Residual risks` and `## Validation` sections are updated in place rather
  than repeated — they describe the software, not a release.
- **Scope**: everything under `site/` and `editor/` that differs from 0.1.4,
  which is 0.1.6, 0.1.7 and 0.1.8 in full. The Language suffix reaching the
  Router and the Listing, `listing_max`, `link_open` and `logo`, the address
  overlay and the href allowlist's second reader, the Image preview's request,
  the Cell and Column rewrites, and the control treatment's reach into
  `shared/theme.css` and both generated copies.
- The **deep code review** covers the same surface for what an audit does not:
  correctness, drift between the three implementations of the line model,
  documentation that no longer matches the code, and anything the two reviews
  at the end of 0.1.8 flagged as a judgement call and left.
- A security finding is fixed in this release or becomes its own issue with the
  reason it waits. A code-review finding becomes an issue unless it is small
  enough to fix where it is found. Neither kind is recorded and left.
- Severity uses the words the first two reviews used — `medium`, `low–medium`,
  `low` — and the table's columns are the same three.
- **The audit is written last.** It reviews the release it ships in, so it runs
  after the link and Table work has landed, not before.

## Testing Decisions

The seams already exist. One assertion is added to a section of `bin/test` that
already exists, and no new seam is introduced.

### 1. `editor/editor.js` under node, via `tests/js-model.js`

Where the link placement lives, and the only half of this release that is
model work.

- `addLinkAt` with a caret in the middle of a Paragraph puts the link there and
  leaves both halves of the text intact.
- With `at === end` (a caret, no selection) nothing is replaced.
- With a selection, exactly the selected span is replaced.
- At offset 0 and at the end of the text, for the two edges.
- A link with no wording, and one with no href, behave as `mkLink` already
  says they do — no new rule about emptiness is introduced here.
- `addLink` is asserted unchanged, byte for byte, so appending has not moved.
- `Doc.prototype.column` is untouched and its existing assertions stand.

### 2. `tests/editor-probe.js` in a browser

Everything else here is DOM, which is what the probe is for and what
`bin/test` cannot run.

- `^K` with a selection inside an open edit box opens the overlay with the
  selection in `wording`, and committing replaces the selection in the Line.
- `Esc` leaves the Line's text identical.
- A Table Run draws a strip with one entry per Column carrying the heading
  text; a document with no Table draws none.
- Clicking an entry selects it, `+ × ‹ ›` operate, and `×` at width 1 is
  refused with the command's own message.
- Clicking a Cell opens that row with the caret in that Cell.
- Moving the cursor out of the Run clears the selection and the strip.
- One undo takes back a strip operation entirely.
- In write mode the write surface's computed width equals the read pane's,
  within a pixel; write → read → write leaves both unchanged; split still fills
  each half. A computed style is an observable fact about the page, which is
  what the probe is for — the rest of the look is a thing to be looked at.

### 3. `php bin/test` — the source scan, extended to the Editor

The suite's `source` section scans `site/src/*.php` and `site/public/index.php`
for a list of dangerous calls and fails naming the file and the call. The same
section gains the Editor: every `.js` under `editor/` is scanned for the ways a
browser page reaches the network — `fetch`, `XMLHttpRequest`, `WebSocket`,
`EventSource`, `sendBeacon`, and a dynamic `import(`.

- A clean tree passes, which is the assertion: the Editor names none of them.
- The one request the Editor makes is an `<img src>` the browser issues from
  markup, so it is invisible to this scan by construction — which is the point.
  The scan says the Editor initiates nothing; `docs/security.md` says what the
  markup causes, and the two together are the whole claim.
- `editor/langs.js` is generated and is scanned like the rest; it is data and
  names none of them.
- A failure prints the file and the call, as the existing scan does.

Prior art: the `source` section of `bin/test`, added by the 0.1.4 review for
exactly this purpose on the other half of the system.

### 4. `php bin/test` — the page shell and the manifest

`favicon` is Site Config reaching the page, which is the seam every Site Config
feature in 0.1.8 was asserted at: build a config array, render the whole page,
read the HTML.

- A named favicon emits one `<link rel="icon">` with the reduced href; a local
  absolute path stands, a bare name lands under `/media/`.
- The shapes the media-path rule already refuses — a protocol-relative URL, a
  climb, a backslash, a control character — are reduced exactly as `logo`'s are.
- An `.svg` carries a type; an unknown extension does not.
- No key emits the default; an empty string emits no link.
- `logo` is asserted unchanged in every case already covered.
- The manifest check, which already fails when a tracked file has fallen off
  `bin/manifest.php`, is what covers `docs/media/`.

Prior art: the `the page shell` and `listings` sections, which already build
Routers from hand-written config arrays and assert on the body, and the release
manifest check.

### 5. The rest of `php bin/test`

Otherwise unchanged and green throughout. Nothing in the link or Table work
reaches the PHP half, the exported markdown, or the rendered page; anything the
audit changes there arrives with the assertion that would have caught it.

## Out of Scope

- **A Cell cursor and a grid editing mode.** `h`/`j`/`k`/`l` between Cells,
  editing one Cell as its own field. Rejected in ADR-0015 and still rejected;
  everything here is an affordance over the Line model, not a way around it.
- **Selecting more than one Column**, and any Column-range operation.
- **Dragging a Column in the strip to reorder it.** `‹` and `›` move one step,
  which is `J`/`K` for rows written sideways. Drag is a second interaction for
  the same operation and can come later if the step proves tedious.
- **Column alignment, width, or a heading that is not just the first row.** A
  Column still has no identity and carries no properties — ADR-0015.
- **A remembered Column that survives the cursor leaving the Run.**
- **Inline images, linked images, and any new inline syntax.** Unchanged from
  0.1.8's exclusions: none of the three implementations of the line model
  change in this release, which is what keeps ADR-0003 out of it.
- **A link picker in the read pane**, and any editing from the preview.
- **`a` inserting at a caret on a Line that is not open for editing.**
- **Pushing and packaging.** As ever, the maintainer's own call — and 0.1.8 is
  held behind this release's review, so the tag moves rather than a 0.1.8.1
  being cut.
- **A fourth review of what the first two already covered.** The scope is what
  differs from 0.1.4. The public path's shape is re-read as context, not
  re-audited.
- **A penetration test, a fuzzing campaign, or a dependency scan.** There are no
  dependencies, and the review is a reading of the code as the first two were.
- **A second document for the code review.** Its findings become issues or
  fixes. `docs/security-audit.md` stays what its title says it is.
- **Any finding acted on by loosening a claim in the documentation.** If the
  code and the documentation disagree, the code is what changes, unless the
  documentation was simply wrong about behaviour that was always correct.
- **Automating the audit.** The scan added here asserts one narrow fact. It is
  not a substitute for reading the code, and nothing should be built that
  pretends it is.
- **The Editor learning any configuration**, including its own mark. It has none
  and gains none; 0.1.8 excluded this and the exclusion stands.
- **A per-page or per-Category favicon**, Apple touch icons, a web app manifest,
  a `theme-color`, and the rest of the icon zoo. One icon, one link.
- **Generating, resizing or converting an image** at build time or at request
  time. The assets are files somebody drew.
- **Replacing the Editor's or the site's wordmark with the logo.** `title` still
  does everything it does, and the Editor is still named in text.
- **Any change to the media-path reduction**, which is audited code already
  doing what a favicon needs.
- **Making either pane full-bleed or uncapped**, changing `--page-width` itself,
  a per-pane width setting, or a draggable divider.
- **Diagrams anywhere but the README** — not in `docs/`, not in the published
  site, not in the Editor — and no diagram of something the code does not do.

## Further Notes

- The line model's three implementations do not change: no new markdown syntax,
  no change to what a Line exports, no change to `inline()` in either half. The
  cross-implementation risk ADR-0003 guards is not engaged.
- `docs/keymap.md` and the `?` overlay's hand-written key table each need a
  line for `^K`. The `?` overlay's command table is generated and needs nothing.
- The review is the last work in the release, but its **scope is fixed now**:
  everything under `site/` and `editor/` that differs from 0.1.4. Work done in
  this release is in scope for it, including the link and Table work above and
  the scan this spec adds.
- `docs/security.md` states the model and `docs/security-audit.md` records the
  checking of it. The Editor paragraph 0.1.8 added to the former is the claim
  this review has to test, and it is the one place the two files now overlap.
- If the review finds something that belongs in 0.1.8 rather than after it, the
  local `v0.1.8` tag moves. Nothing is public yet, which is why the review is
  worth doing before anything is.
- This release is the first to add **binary content to the archive**, and the
  first in two releases to need `bin/manifest.php` changed. `editor/` and
  `site/` are copied whole so assets inside them ship without a line; `docs/` is
  listed file by file, so `docs/media/` is not.
- The logo, the icon and the diagrams exist and are the maintainer's to place.
  Nothing else in the release depends on issue 08, so a diagram that wants
  redrawing can hold that one commit without holding the release.
- The `bin/build` repathing trap was found while writing these issues, not by
  the review: a new asset in `editor/index.html` is not repathed into the probe,
  and `bin/test` passes anyway because it undoes the rewrite generically. It is
  fixed in issue 07 rather than left for issue 09, because issue 07 is the one
  that would otherwise trip over it.
- ADR-0015 needs no amendment and should not get one. This release is what it
  described as the alternative to a grid: affordances over Lines. If the strip
  turns out to want a Cell cursor after all, that is the moment to reopen it,
  and a superseding ADR is how.
