---
title: Writing in the editor
category: guides
date: 2026-09-09
---

# Writing in the editor

Open `editor/index.html` straight from disk. There is no server to start, because the editor has nothing to talk to.

## The loop

The whole writing loop is **o**, type, **Enter**, type, **Enter** — never leaving the home row. One keystroke restyles the line under the cursor, and the line wears its style as you write it.

- **o** — new line below, straight into editing
- **Enter** — commit this line and open the next one
- **D** — remove the line
- **J** and **K** — move the line itself up and down
- **^Z** and **^⇧Z** — undo and redo, one writer's action at a time
- **?** — every key, and every command

## One key per type

| key | type |
| --- | --- |
| 1 2 3 | headings |
| p l q n | paragraph, list, quote, note |
| t | table row |
| c s u | code, CLI, output |
| r f m | rule, figure, meta |

Tab cycles the dialect of a code or CLI line, and `:lang php` picks one by name, which is quicker once you know there are fifty-eight of them. A CLI dialect also picks the prompt the line is drawn with — `$` for bash, `PS>` for PowerShell, `>>>` for a Python session.

## The document, and what it is called

The topbar has the three things that act on the whole document, and nothing else: **Open .md**, **New .md** and **Clear**. There is no save button, because there is nowhere to save to.

The tab bar shows the name the file will have, and only the name. Click it to type a new one, or press **R**. Until you set one it follows the title, so naming a post is usually just writing its heading. The directory is not shown there because it is not something you set there — it comes from the `category:` meta line, and **E** shows the two together as the path the file belongs at.

```console
$ ls content/guides/
```

```output
index.md  install-in-five-minutes.md  publishing-is-a-file-copy.md  writing-in-the-editor.md
```

## The command line

**:** opens it, Tab completes, Enter runs. Everything the editor can do is there — `set`, `lang`, `move`, `fold`, `name`, `title`, `cat`, `meta`, `open`, `newdoc`, `clear`, `undo`, `export`, `size`, `theme`. Press **?** for the full table; it is generated from the commands themselves, so it is never out of date.

## Split screen

Press **b** to split the window: the lines on the left, the page as a reader will see it on the right, both updating as you type. **B** swaps the sides. The panes stack vertically on a narrow window.

## Content size

**+** and **−** step the document size, and **0** puts it back to 100%. It applies to both panes, and it is remembered for next time. The buttons in the tab bar do the same thing for the mouse.

## Folded output

A run of output lines under a code block is that block's result, and it is folded by default so the commands stay readable.

```console
$ rsync -az content/ deploy@example.com:/var/www/example.com/site/content/
```

```output
sending incremental file list
content/guides/writing-in-the-editor.md
sent 4.2K bytes  received 95 bytes  2.86K bytes/sec
```

Press **z** to fold or unfold the output of the block under the cursor. The cursor never gets stuck inside something folded: moving onto a hidden line unfolds it rather than leaving you typing into nothing.

## Getting the file out

Press **E**. You get the markdown, the path it belongs at, and a copy button — the editor's only output is a file. It never had a connection to anywhere.
