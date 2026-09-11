# Keymap

Everything in the editor is reachable from the keyboard. The mouse is supported
where it is genuinely better — dragging a line, clicking a type in the legend.

On a touch screen there is no keyboard to run the writing loop from, so the
legend along the bottom is it: the line types on the left with `link` among
them, and `edit` `new` `remove` `↑` `↓` `fold` on the right, each doing exactly
what the key printed beside it does. Tap a line to put the cursor on it; tap it
again to write in it.

## Moving

| key | does |
| --- | --- |
| `j` `k` or `↓` `↑` | move the cursor — skips folded output lines |
| `g` `G` | first / last line |
| `J` `K` | move the **line** up / down |
| drag `⠿` | reorder with the mouse |

## Writing

| key | does |
| --- | --- |
| `i` or `Enter` | edit the line in place |
| `Enter` (while editing) | commit and open a new line below — the writing loop |
| `Esc` (while editing) | commit and stop |
| `o` `O` | new line below / above, straight into editing |
| `Tab` / `⇧Tab` (editing a table row) | the next / previous cell |
| `^K` (while editing) | a link at the caret, or over what is selected — the same overlay `a` opens, under Blocks |
| `^←` `^→` | move the selected table column — the strip above a table selects one |
| `D` or `x` | remove the line |
| `y` | duplicate the line |
| `^Z` | undo |
| `^⇧Z` or `^Y` | redo |

A new line inherits the type and dialect of the one it follows, so writing a
list or a code block is `o`, type, `Enter`, type, `Enter`.

A table row is one line and its cells are the `|`-separated parts of it, so
`Tab` while editing walks the caret along the row a cell at a time. Past the
last cell it commits the row and opens the next one with the caret in its first
cell — the same writing loop, sideways. `⇧Tab` walks back, and on the first
cell there is nowhere to go. `o` on a table row opens a row as wide as the run
it is in, so the pipes are typed for you.

A table run in the write pane carries a strip above it, one entry per column,
each its number and that column's heading cell — so the columns are something
to look at rather than pipes to count. Clicking an entry selects that column;
clicking a cell puts the cursor on that row and opens it with the caret already
in that cell. The strip is drawn for the run the cursor is in and for no other,
and the selection lives as long as the strip does: leave the run and nothing is
selected. It is write-pane chrome — the read pane and the exported markdown
know nothing about it.

A selected column reveals four controls in the strip — `+` `×` `‹` `›`, which
are add, remove, move left and move right. Each one is `col add|del|left|right`
with the selected column's number, so a click and the command run the same
operation, refuse for the same reasons in the same words, and count as one undo
step. `^←` and `^→` are `‹` and `›` on the keyboard, and with no column
selected they do nothing. After an operation the strip is redrawn from the run
as it now is and the selection follows the column it was on: `add` puts an
empty column in front of it, `left` and `right` carry it along, and `del`
leaves nothing to point at, so nothing is selected.

## Styles

One key each. Applies to the line under the cursor.

| key | type |
| --- | --- |
| `1` `2` `3` | H1 · H2 · H3 |
| `p` | paragraph |
| `l` | list item |
| `q` | quote |
| `n` | note |
| `t` | table row |
| `c` | code |
| `s` | CLI |
| `u` | output |
| `r` | rule |
| `f` | figure / image |
| `m` | meta |
| `Tab` / `⇧Tab` | cycle the dialect of a code or CLI line |
| `:lang <name>` | pick a dialect by name, which is faster past the first few |

## Blocks

| key | does |
| --- | --- |
| `z` | fold / unfold this block's output section |
| `C` | copy this code, CLI or output block to the clipboard |
| `a` | the links in this line — or an image's file and caption |
| `^K` (while editing) | a link at the caret, or over what is selected |

`a` opens the overlay on whatever the cursor is on. On a line that carries
links it shows them to pick between — one link opens straight for editing, and
none opens an empty form, so writing the first link in a line is also one key.
On an image line the two fields are `src` and `caption` instead. A line
that carries no inline markup at all — code, CLI, output, rule, meta — says so
and is left alone.

`^K` is the same overlay reached from inside the box, and it puts the link
where the writer is rather than at the end. Text selected in the box arrives as
the wording and the committed link replaces exactly that span; with nothing
selected the form opens empty and the link lands at the caret. Either way the
caret is left after the link, so typing carries on. `a` on a line that is not
open for editing appends, as it always has — there is no caret there to speak
of.

Clearing the href unlinks, leaving the wording as writing; clearing the wording
is refused, because `[](…)` is not a link. An href the published page would
refuse is marked in the overlay with what will happen to it, by the same
allowlist the page uses — but it does not stop you committing it.

## Document and session

| key | does |
| --- | --- |
| **Open .md** or drop a `.md` | open an existing document for editing |
| **New .md** or `N` | start a new document, keeping the category |
| **Clear** | empty this document, keeping its name — `^Z` brings it back |
| `R` | name the file — or click the name in the tab bar |
| `E` | export — shows the markdown, copy or download it |
| `^B` then `1` / `2` / `3` | write pane / read pane / split screen |
| `e` / `v` / `b` | the same, without the prefix |
| `B` | swap the two panes — editor left or editor right |
| `+` `-` | content bigger / smaller, in both panes |
| `0` | content back to 100% |
| `T` | theme, normal ⇄ dark |
| `:` | command line |
| `?` | the keys and every command, in the editor |

The three buttons in the topbar are the whole of what the editor does to a
document as a whole. There is no save button, and no fourth thing hiding
anywhere: the editor has nowhere to save to, and `E` is how a file leaves it.

## Undo and redo

`^Z` takes back anything that changed the document — a word typed, a line
removed, a run reordered, a file opened, **Clear**, **New .md**. `^⇧Z` (or `^Y`)
puts it back. The buttons in the topbar do the same and grey out when there is
nothing left to take back.

One thing the writer did is one undo. Opening a line with `o` and typing into it
is one step, not two. Two things are not steps at all: moving the cursor, and
folding or unfolding an output section. Both are looking rather than editing,
neither reaches the file, and there is no point in undoing your way back
through a walk down the document.

Undo is in the browser tab and nowhere else. Reloading the page loses it, along
with the document; the editor keeps nothing between visits.

## Naming the file

The tab bar shows one thing: the **name** the file will have. It is the part you
can click and type into, or set with `R` or `:name`. Whatever you type is turned
into a slug with `.md` on the end, because that is what the site addresses a
document by.

- until you set one, the name **follows the title** — type a title and the file
  is named after it. Setting a name, or opening a file, stops that: the name you
  chose stays until you clear it with `:name` and no argument.
- the **directory** is not shown, because it is not something you set here: it
  is whatever the `category:` meta line says. No category means the document
  belongs at the top of `content/`, which is where the home page lives.
- `E` shows the two together — `content/<category>/<name>.md` is the path the
  export overlay offers the file at.

Opening a file takes its name, so `E` offers it back under the same one. The
name is slugged on the way in as well, so a file called `My Post.md` becomes
`my-post.md` — a document the site could not address by its real name is a
document the site cannot serve. A name that was already a slug, which is every
file the editor has written, comes back unchanged.

The directory the export overlay shows is the one the document's `category:`
says, not the folder the file was opened from: a page in a browser is not
allowed to know that, and the category is what the site routes on anyway.

## Split screen

`b` shows the lines and the rendered page at once, both updating as you type.
`B` swaps the sides, for people who want the preview on the left. On a window
narrower than 900px the two panes stack instead of sitting side by side.

The write pane keeps the keyboard in split mode: every editing key does what it
does in the write pane alone, and the reader half just follows along.

## Content size

`+` and `-` step the document size between 70% and 200%, and `0` puts it back.
It applies to both panes and to nothing else — the tab bar, the legend and the
status line keep their size, so the chrome does not eat the window as the words
grow. The tab bar has `A-` / `A+` buttons that do the same thing.

The published page has the same control, next to the theme toggle, with the same
keys. Both are remembered in the browser and never leave it.

## Command line

`:` opens it. `Tab` completes the word under the cursor — command names first,
then the arguments that command takes — `Enter` runs, `Esc` cancels. Clicking a
completion picks it too.

Everything the editor does to a document or to the screen is here, which is the
point: the keys are the fast path and the command line is the complete one.
(Only the two things a key is strictly better at are missing — moving the cursor
line by line, and opening the edit box.) The editor's own `?` overlay
prints this table from the same list that runs the commands, so the two cannot
drift apart.

### The line under the cursor

| command | does |
| --- | --- |
| `set <type> [dialect]` | set the type of this line |
| `lang <dialect>` | set the dialect — refused on a type that has none |
| `new [type]` | insert a line below this one |
| `del` | remove this line |
| `dup` | duplicate this line |
| `move up\|down\|top\|bottom` | move this line within the document |
| `col add\|del\|left\|right [n]` | a column of this table — counted from 1, across every row |
| `link` | the links in this line — pick one, or write a new one; the same as `a` |
| `img` | an image's file and caption — the same overlay |
| `go <line\|top\|end>` | put the cursor on a line by number |
| `copy` | copy this code, CLI or output block to the clipboard |

A column is the nth cell of every row in the table run the cursor is in, counted
from 1, and it is worked out when you ask rather than stored anywhere. `col add`
with no number puts an empty column on the right; `col add 2` puts one before
the second. `col del 2` takes that one out, and `col left 2` · `col right 2`
swap it with its neighbour. `Tab` offers the numbers with the heading row's
words beside them, which is how you tell which number you want. The strip above
the run is the same four operations without the number: select a column there
and `+` `×` `‹` `›` are `add`, `del`, `left` and `right` on it.

Every row of the run is rewritten by one such command, and rows shorter than the
widest one are padded with empty cells first — so a ragged table comes out of
its first column command square. The run's bounds are where it stops: a second
table further down the document is untouched. `col del` on a table one column
wide is refused. One column command is one undo step.

Rows need no commands of their own: a row is a line, so `J`/`K` move one, `D`
removes one and `y` duplicates one, exactly as they do everywhere else.

### Output sections

| command | does |
| --- | --- |
| `fold` | fold or unfold this block's output — the same as `z` |
| `foldall` | fold every output run in the document |
| `unfoldall` | unfold every one of them |

### The document

| command | does |
| --- | --- |
| `undo` · `redo` | the same as `^Z` and `^⇧Z` |
| `open` | open a markdown file — the same as dropping one on the page |
| `newdoc` | start a new document, keeping the category |
| `clear` | empty this document, keeping its name |
| `name [file.md]` | name the file; no argument goes back to following the title |
| `title <text>` | set the title meta line |
| `cat <name>` | set the category meta — the directory the file goes in |
| `date <text>` | set the date meta line; no argument uses today |
| `meta <key> <value>` | set any meta line, adding it if it is missing |
| `export` | show the markdown — copy it or download it |

### The screen

| command | does |
| --- | --- |
| `write` · `read` · `split` | choose the pane layout |
| `swap` | swap the panes, switching to split screen if it is not on |
| `size up\|down\|reset` | content size, the same as `+` `-` `0` |
| `theme` | normal ⇄ dark |
| `help` | the keys and this table |

`w` is recognised and says there is nothing to save: the editor has nowhere to
save to. `E` produces the file.
