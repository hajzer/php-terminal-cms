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
document, under the directory its `category` meta names. A trailing language
code is part of that name: `what-it-is-sk.md` is the Slovak of `what-it-is.md`,
and the site reads the two as one document if `site.php` declared `sk`. See
`docs/config.md`.

Nothing inside the file records the language. There is no `lang:` meta to keep
in step with the name, and the editor treats the suffix as it treats any other
word in a name: type it, or rename the file.

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
