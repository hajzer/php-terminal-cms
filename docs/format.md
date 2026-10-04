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

## Media

An Image Line names its picture by file name — `![the overlay](overlay.png)` —
and the file is in the Document's own directory under `site/public/media/`:
its path under `content/` repeated, without the language and the `.md`.

| the Document | its Media |
| --- | --- |
| `content/about/what-it-is.md` | `site/public/media/about/what-it-is/` |
| `content/about/what-it-is-sk.md` | the same: every language shares one |
| `content/guides/php/intro.md` | `site/public/media/guides/php/intro/` |
| `content/guides/index.md` | `site/public/media/guides/index/` |
| `content/index.md` | `site/public/media/index/` |

Every src that is not an absolute path is reduced to its file name and looked
for there, so `./overlay.png`, `shots/overlay.png` and `../overlay.png` all
name `overlay.png`. An absolute path — `/media/architecture.svg` — names that
path, for a picture that belongs to no one Document. There is no fallback: a
bare name that is not in the Document's directory is a broken picture, and is
not looked for in `site/public/media/` itself.

The editor's read pane looks in the same place from its own page —
`../site/public/media/<category>/<name>/`, which is where a checkout keeps it.
It knows the name and the `category` meta but not the site's languages, so for
`what-it-is-sk.md` it looks under `what-it-is-sk/` first and, when the picture
does not load there, under `what-it-is/`. An absolute src is used as written,
and from an editor opened off the disk it shows the box with the file name.

The site knows which directory a file is in; the editor is handed the file
and nothing about where it was, so the `category` meta is all it has. A
document in `content/guides/` whose Meta does not say `category: guides` shows
its pictures on the site and not in the editor — the editor looks under
`media/<name>/`, as it would for a file in `content/` itself. That holds for
a checkout and for an unzipped Bundle alike.

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

## Published

`published` is the one Meta key that decides whether a reader can see the
document at all:

```
---
title: Not yet
published: false
---
```

Only a file with no `published` line, or with exactly `published: true`, is
Published. **Any other word hides it** — `false`, `no`, `0`, `False`, and a
misspelt `flase` alike — because a typo in a draft's Meta should keep it a
draft, not release it. It is the one setting that fails closed. Only the
value is held to that: the key is `published`, in lower case, and a line with
any other key — `Published:`, `pubished:` — is just another meta line, which
leaves the document Published.

A document that is not Published is a 404 at its address, no listing names it,
no language indicator links to it, no Bundle carries it, and a Page Build
does not write it. A
category's `index.md` that is not Published leaves the category's page headed
by its label. Each language is its own file with its own Meta, so a
translation can be held back while the original is read: the original then
shows no language indicator until the translation is Published.

Not Published is not secret. The file is on the server and in the
repository, and anyone who can read `content/` or the git history reads it;
it is only unreachable through the site. A Category says it is not Published
in `site.php` instead — see `docs/config.md`.

`published` is not printed under the title, on the page or in the editor: a
reader only ever meets a Published document, so the line could only ever say
`true`. The editor has no draft mark — its preview shows the document as it
would read if it were Published.

## Bundle

`bundle: false` keeps a document's Bundle — the ZIP of its source, its pictures
and the Editor at its address with `.zip` on it — off the page and off the site,
and leaves the file out of its category's Bundle too. `bundle: true` offers it
on an instance whose `site.php` says `'bundle' => false`. Any other word is no
choice: the instance decides, and without a word from it the Bundle is offered.
See [config.md](config.md#bundles).

Each language is its own file with its own Meta, so each address decides for
itself, and a language that says `bundle: false` is left out of the others'
Bundles. A category's `index.md` decides for the category's page.

`bundle` is printed under the title like any other meta line: it is what the
page is doing.

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
them in the reader's browser each time. A reader who wants the picture as a
file saves it from the page's Full View, as SVG or as the source in a `.mmd`.
See
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
