# Line types

Fourteen types, closed set. Every type has one keystroke. Adding a fifteenth
means touching four places: `editor/editor.js` (`TYPES`, `toMarkdown`, `parse`,
`renderDoc`), `site/src/Line.php`, `site/src/Markdown.php` and
`site/src/Renderer.php` — which is the price of the model being explicit.

## Runs

Consecutive lines of the same type — and, for `code` and `cli`, the same dialect
— form a **run** and render as a single block. `list`, `quote`, `note`, `table`,
`code`, `cli` and `out` are the run types; the rest are always alone.

This is why reordering works the way it does: `J` on a line inside a code block
moves that statement, and on a table row moves that row.

## The types

### `h1` `h2` `h3` — headings

Keys `1` `2` `3`. Markdown `# `, `## `, `### `. The site adds an `id` anchor to
h2 and h3 derived from the text.

### `p` — paragraph

Key `p`. The default. Markdown is the bare text.

**Inline markup**, available in paragraphs, lists, quotes, notes and table
cells: `` `code` ``, `**bold**`, `*italic*`, `[text](url)`. Links are restricted
to `http://`, `https://`, `mailto:`, `/` and `#`; anything else renders as plain
text with the URL dropped.

### `list` — list item

Key `l`. Markdown `- item`. A run becomes one `<ul>`. Flat only — there is no
nesting, deliberately.

### `quote` — quote

Key `q`. Markdown `> text`. A run becomes one `<blockquote>` with lines
separated by `<br>`.

### `note` — note

Key `n`. Markdown a GitHub callout:

```output
> [!NOTE]
> the text
```

Renders as a bordered aside. On GitHub the same file renders as a native note
callout, which is why this syntax was chosen over a custom one.

### `table` — table row

Key `t`. One line is one row; cells are separated by `|`. The **first line of
the run is the header**. Exports as a standard GFM table with the alignment row
inserted automatically:

```output
| binding    | does             |
| ---------- | ---------------- |
| prefix %   | split vertically |
```

In the editor you type `binding | does` — the outer pipes and the alignment row
are added on export and stripped on import.

### `code` — code

Key `c`. Markdown a fenced block with the dialect as the info string. Syntax
highlighted on the page by `site/src/Highlighter.php` and in the editor by the
same tables, both reading `shared/langs.json`.

Fifty-eight dialects. `Tab` cycles them, which is only sensible for the first
few — `:lang <name>` picks one directly, and the editor's `?` overlay lists them
all:

| | |
| --- | --- |
| languages | `php` `js` `ts` `python` `ruby` `go` `rust` `java` `csharp` `cpp` `c` `swift` `kotlin` `scala` `dart` `objc` `groovy` `perl` `lua` `r` |
| more languages | `julia` `matlab` `fortran` `pascal` `cobol` `vb` `asm` `haskell` `ocaml` `fsharp` `elixir` `erlang` `clojure` `lisp` `scheme` |
| shells | `bash` `sh` `ksh` `zsh` `fish` `tcsh` `nu` `powershell` `cmd` |
| data and markup | `sql` `html` `xml` `css` `json` `yaml` `toml` `ini` |
| configuration | `dockerfile` `makefile` `nginx` `graphql` `hcl` `diff` |

A dialect the tables do not know still works — the block renders as plain
escaped text, which is what an unknown info string emits.

### `cli` — shell command

Key `s`. Seventeen dialects, each with the prompt it is drawn with:

| dialect | prompt | | dialect | prompt |
| --- | --- | --- | --- | --- |
| `bash` | `$` | | `sql` | `sql>` |
| `sh` | `sh$` | | `psql` | `psql>` |
| `ksh` | `ksh$` | | `mysql` | `mysql>` |
| `zsh` | `%` | | `sqlite` | `sqlite>` |
| `fish` | `~>` | | `python` | `>>>` |
| `tcsh` | `tcsh>` | | `node` | `node>` |
| `nu` | `nu>` | | `irb` | `irb>` |
| `powershell` | `PS>` | | `php` | `php>` |
| `cmd` | `C:\>` | | | |

A prompt that is not the shell's real one — `sh$`, `ksh$`, `tcsh>`, `nu>` — is
the price of every prompt being unique. The alternative is a shell that cannot
be read back as itself.

The prompt is presentation, not content: it is added on render and taken out
again when the block is copied. Every prompt is unique, because the prompt is
also how the dialect is recognised when the file is read back — two dialects
sharing one would make the second unreadable. `bin/test` asserts that they are
unique, that the editor's table and `site/src/Line.php` agree, and that every
prompt round trips.

Exports as a ```` ```console ```` fence with the prompts written out, which is
the conventional way to show a terminal session in markdown and lets the dialect
survive a round trip.

### `out` — output

Key `u`. A run of `out` lines directly after a `code` or `cli` run becomes that
block's **output section**, folded by default. Exports as a ```` ```output ````
fence. `z` folds and unfolds it; the cursor skips folded lines.

An `out` run that does not follow a code or CLI run renders as a standalone
folded block.

### `rule` — thematic break

Key `r`. Markdown `---`, renders `<hr>`. Carries no text.

### `img` — image

Key `f`. Markdown `![alt](/media/name.png)`. The alt text is stored in the
line's dialect slot. Paths are normalised to `/media/<basename>`, which is
`site/public/media/` on disk — see [deploy.md](deploy.md). The editor's read pane shows
the picture itself, fetched from the src as written; a src that does not load falls
back to a box with the file name in it.

### `meta` — metadata

Key `m`. One `key: value` per line, exported as YAML frontmatter. Three keys are
read by the system:

| key | used for |
| --- | --- |
| `title` | page `<title>`, listing entries, the exported filename |
| `category` | which directory the document belongs to, and the nav highlight |
| `date` | listing order, newest first |

Any other key is carried through untouched and ignored.

Every meta line except `title` is printed on the page, once, in one line
directly under the document's title — `title` is left out because the title is
already there. A document with meta but no `H1` prints them where the title
would have been; a document with no meta gets no such line. The editor's preview
shows the same line in the same place.
