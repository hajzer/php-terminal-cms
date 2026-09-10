# Keymap

Everything in the editor is reachable from the keyboard. The mouse is supported
where it is genuinely better — dragging a line, clicking a type in the legend.

On a touch screen there is no keyboard to run the writing loop from, so the
legend along the bottom is it: the line types on the left, and `edit` `new`
`remove` `↑` `↓` `fold` on the right, each doing exactly what the key printed
beside it does. Tap a line to put the cursor on it; tap it again to write in
it.

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
| `D` or `x` | remove the line |
| `y` | duplicate the line |
| `^Z` | undo |
| `^⇧Z` or `^Y` | redo |

A new line inherits the type and dialect of the one it follows, so writing a
list or a code block is `o`, type, `Enter`, type, `Enter`.

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
| `go <line\|top\|end>` | put the cursor on a line by number |
| `copy` | copy this code, CLI or output block to the clipboard |

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
