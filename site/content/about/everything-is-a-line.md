---
title: Everything is a line
category: about
date: 2026-09-08
---

# Everything is a line

Unix said everything is a file. Here, everything is a line — and a line is not a row of characters, it is a thing with a type.

## The analogy, and where it stops

The Unix slogan is worth reading in the words of the person who has spent the most time defending it. Linus Torvalds, in a thread archived at [yarchive.net](https://yarchive.net/comp/linux/everything_is_file.html):

> The UNIX philosophy is often quoted as "everything is a file", but that really means "everything is a stream of bytes".

The rest of that thread is the useful half. His argument is that the slogan was never about filenames or about a namespace — it is about being able to reach for the same small set of common operations whatever is on the other end. A device, a socket and a text file all answer `read` and `write`, so `grep` never had to learn what it was reading.

A line here is the same bargain, one level up. A heading, a table row, a shell command and a block of output are not different objects with different editors — they are all lines, and the same handful of operations works on every one of them: move it, retype it, duplicate it, delete it, change what it is. **J** moves a paragraph through a document and a row through a table with the same keystroke, because there is only one operation and it does not care which kind of line it has.

Where the analogy stops is the byte stream. Unix files are deliberately untyped: the meaning is the reader's problem. A line carries its type with it, because a document has to render, and something must know that this line is a shell command and the four under it are what it printed.

## The model

A **Line** carries exactly three things: some text, one **Type** out of a closed set of fourteen, and — for code and shell commands only — a **Dialect**. That is the whole model.

|  | type | key | dialects |
| --- | --- | --- | --- |
| H1 H2 H3 | headings | 1 2 3 | — |
| ¶ | paragraph | p | — |
| • | list item | l | — |
| " | quote | q | — |
| ! | note | n | — |
| ‖ | table row | t | — |
| {} | code | c | php bash c js sql |
| $ | CLI | s | bash powershell zsh sql |
| ⟩ | output | u | — |
| — | rule | r | — |
| ⧉ | image | f | — |
| @ | meta | m | — |

## Runs

Consecutive lines of the same type form a **Run**, and a run renders as one block. A code block is a run of code lines. A table is a run of table rows. A list is a run of list items.

This is why the editor can move a statement inside a code block, or a row inside a table, with the same keystroke that moves a paragraph inside a document: there is only one operation, and it is "move this line".

```php
<?php
/* a run of three code lines — J and K reorder them like any other lines */
$lines = Markdown::parse($src);
$html  = Renderer::render($lines);
echo Page::html($site, $html);
```

## Output is part of the block

A run of **output** lines immediately after a code or CLI run is that block's result. It is folded by default in the editor, on the page, and in the exported markdown — because you usually want to read the command, not what it printed last Tuesday.

```console
$ php bin/test | tail -2
```

```output
201 passed, 0 failed
```

## And it is still just markdown

The file the editor exports is ordinary markdown that GitHub renders correctly. The typed lines are how the editor and the renderer think about a document; they are not a format anyone else has to learn.
