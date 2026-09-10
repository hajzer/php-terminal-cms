---
title: php-terminal-cms
date: 2026-09-09
---

# php-terminal-cms

A micro publishing platform built on one idea: a document is an **ordered sequence of typed lines**, not a blob of text. You compose the lines in a terminal-styled editor that runs from a file, and about three hundred lines of PHP turn the markdown it exports into this page.

> [!NOTE]
> This site is the software's own example content. Everything you are reading lives in `content/` as markdown, and the whole installation is a directory you copy onto a server.

## The two halves

```diagram
EDITOR                            SERVER

editor/index.html                 site/public/index.php
  a static page, no endpoints       renders content/*.md per request
  drop a .md in, download one out   no database, no JS, no dependencies
         |
    export .md
         |
    git / rsync / WinSCP --------> content/
```

They never talk to each other. The editor cannot write to the server, and the server cannot be written to from the internet — publishing is a file copy you perform with a tool that already has your credentials.

## What it is not

No database. No login. No session, cookie, form or upload. No admin panel, no build step, no composer dependency, no npm package, no CDN, and not one byte of third-party JavaScript.
