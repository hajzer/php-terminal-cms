---
title: What php-terminal-cms is
category: about
date: 2026-09-07
---

# What php-terminal-cms is

A publishing platform for people who already have a text editor, a terminal and a server, and who do not want a fourth thing between them and a published page.

## The shape of an installation

```console
$ tree -L 2 php-terminal-cms
```

```output
php-terminal-cms
|-- editor/          the writing surface — open index.html from disk
|-- site/
|   |-- content/     your markdown, one file per document
|   |-- public/      the only thing a web server points at
|   |-- src/         the renderer, ~300 lines of PHP
|   `-- site.php     title, tagline, categories, listings, footer
|-- shared/          the one copy of the theme and the language table
`-- bin/             build, test, fmt, package
```

Two halves, one repository. The editor half is a static page; the site half is a PHP script that reads files. Nothing is generated ahead of time and nothing is cached — a page is rendered from its markdown file on every request, which takes about a millisecond because there is nothing else to do.

## The requirements, in full

- PHP 8.1 or newer, with no extensions beyond the defaults
- a directory the web server can serve
- a browser, for the editor

There is no fourth requirement. No composer install, no node, no build.

## What it refuses to do

- **It does not write files.** The public half opens files for reading and nothing else; `bin/test` fails the build if `file_put_contents`, `unlink` or `fwrite` ever appears in `site/src/`.
- **It does not read the request.** No `$_GET`, no `$_POST`, no cookie, no session. A URL selects a category and a slug by comparison against names on disk, never by being turned into a path.
- **It does not run third-party code.** No dependency means no dependency to update at three in the morning.

> The security model is not a list of mitigations. It is a list of things that are absent, and absent things cannot be exploited.
