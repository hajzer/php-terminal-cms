# The markdown contract

A document is an ordinary CommonMark file. Anything can read it; GitHub renders
it correctly. But the editor and the site read back a **defined subset**, and
knowing where that subset ends is the difference between a document that round
trips and one that quietly changes shape.

## Canonical form

`php bin/fmt` rewrites a file into canonical form — byte-for-byte what the
editor would export. `bin/fmt --check` reports without writing, and `bin/test`
requires the shipped content to already be canonical.

Canonical form is:

- YAML frontmatter first, if there is any metadata
- exactly one blank line between blocks
- paragraphs on **one line each**, never hard-wrapped
- tables with outer pipes and a generated alignment row
- fences: `` ```<dialect> `` for code, `` ```console `` for CLI, `` ```output ``
  for output

## The name, and the language in it

A file name is a slug with `.md` on it — the address the site gives the
document, under the directory its `category` meta names: `category: guides`
for a category, `category: guides/php` for a Sub-category declared inside it.
A trailing language code is part of that name: `what-it-is-sk.md` is the
Slovak of `what-it-is.md`, and the site reads the two as one document if
`site.php` declared `sk`. See `docs/config.md`.

Nothing inside the file records the language. There is no `lang:` meta to keep
in step with the name, and the editor treats the suffix as it treats any other
word in a name: type it, or rename the file.

## The Meta that draws the page

Two Meta keys choose how the site draws a document, and each is a choice only
when it names something real:

- `theme: <name>` — the Theme, one of the twelve in [themes.md](themes.md),
  spelled as its file in `site/public/themes/` is: `theme: things`. It wins
  over `site.php`'s `theme`; a name that is none of the twelve is passed
  over for `site.php`'s, and that for `baseline`. It is printed under the
  title with the rest of the meta.
- `palette: light` or `palette: dark` — how the page opens for a reader who
  has never pressed light/dark. It wins over `site.php`'s `palette`; any other
  word is passed over for that, and that for the reader's browser. A reader's
  own choice beats it on every page. It is not printed: the reader may have
  flipped the page, and the line would say something the page is not doing.

Neither is ever an error. A misspelt name draws the page the way it would be
drawn without the line. See `docs/config.md` for the `site.php` half.

A meta line is one `key: value` pair. The key is what stands before the first
colon and the value what stands after, each without the spaces around it, so
`theme : things` is the key `theme`. A key is written once; where a file has
one twice, the last line counts — on the page and in the editor alike, which
`bin/test` compares.

## Round trip

```
parse(export(lines))  == lines        exact
export(parse(md))     == md           when md is canonical
export(parse(export(parse(md))))      always stable after one pass
```

`bin/test` asserts all three over the sample content, and that the PHP and
JavaScript implementations emit identical bytes.

## Reading a file written by hand

The parser is forgiving in the ways that matter and lossy in ways worth knowing:

| you write | you get |
| --- | --- |
| a hard-wrapped paragraph | one paragraph line, unwrapped on export |
| `*` or `+` list markers | a list; exports as `-` |
| `***` or `___` breaks | a rule; exports as `---` |
| `> [!WARNING]` / `[!TIP]` | a note; exports as `[!NOTE]` |
| a fence with no info string | output lines |
| `` ```shell-session `` / `` ```terminal `` | a CLI run; exports as `console` |
| a table without an alignment row | a table; one is generated |

And the things it will not do:

| you write | you get |
| --- | --- |
| nested lists | flat list items, indentation lost |
| a numbered list | paragraphs beginning `1.` |
| setext headings (`===` under text) | a paragraph and a rule |
| raw HTML | escaped text — see below |
| footnotes, definition lists, task lists | paragraphs |
| an image inside a paragraph | text; images must be alone on a line |
| more than three heading levels | `####` becomes a paragraph |

None of these will corrupt a file. The document renders as text rather than as
the construct you meant, which is visible immediately in the read tab.

## Raw HTML

There is none, anywhere, by design. The renderer escapes every character of
every line and then emits tags it chose itself, so a document cannot inject
markup into a page ([ADR-0003](adr/0003-own-renderer.md)).

This is why an output section exports as a ```` ```output ```` fence and not as
a `<details>` element: a fence is text, and an element would be markup the
renderer had to pass through. The cost is that GitHub shows an output block
expanded as a plain code block instead of collapsed.

## Dialects and prompts

A CLI run exports with its prompt written into the text:

```output
```console
$ composer install
PS> Set-Location my-site
```
```

On import the prompt is matched against the table in `site/src/Line.php` —
`$` `sh$` `ksh$` `%` `~>` `tcsh>` `nu>` `PS>` `C:\>` `sql>` `psql>` `mysql>`
`sqlite>` `>>>` `node>` `irb>` `php>` — to recover the dialect, then stripped. A line with no recognised
prompt is read as `bash`. This keeps the file conventional to a human reader
while surviving the round trip.

Every prompt is unique, and no prompt is reached only after one it starts with:
two dialects sharing a prompt would make the second unreadable, and the file
would come back as something other than what was written. `bin/test` asserts it
for every dialect, in both implementations.

## Diagrams

A Diagram is a code run in the `mermaid` dialect, and in the file it is
nothing but a standard ```` ```mermaid ```` fence — the one GitLab and GitHub
draw in place. The picture is not stored anywhere: the fence's lines are the
source, they round trip like any code block's, and the picture is drawn from
them in the reader's browser each time. See
[line-types.md](line-types.md#code--code).

## Inline markup

`` `code` ``, `**bold**`, `*italic*`, `[text](url)` — in paragraphs, list items,
quotes, notes and table cells.

Link targets are restricted to `http://`, `https://`, `mailto:` with an
address, a local absolute path, and a fragment. Anything else — `javascript:`,
`data:`, a bare scheme, a relative path, and the shapes that look local without
being local, such as `//example.com` and `/../secret` — renders as the link text
with the target discarded. The full rule, and why each shape is refused, is in
[security.md](security.md#the-renderer); `editor/editor.js` applies the same one,
so the editor's preview shows exactly the links the site will emit.
