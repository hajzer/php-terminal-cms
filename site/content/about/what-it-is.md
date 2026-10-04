---
title: What php-terminal-cms is
category: about
date: 2026-09-07
---

# What php-terminal-cms is

A publishing platform for people who already have a text editor, a terminal and a server.

## Installation

```console
$ tree -L 2 php-terminal-cms
```

```output
php-terminal-cms
|-- editor/          index.html
|-- site/
|   |-- content/     one markdown file = one document (page)
|   |-- public/      the site's main directory (web server root)
|   |-- src/         the site's PHP, ~3,100 lines
|   `-- site.php     the system's configuration
|-- shared/          the one copy of the theme and the language table
`-- bin/             build, test, fmt, package, page-build
```

Two components, one repository. The editor is a static HTML page; the server is a PHP script that reads and interprets markdown files. Nothing is generated ahead of time and nothing is cached — a page is rendered from its markdown file on every request.

## Requirements

- PHP 8.1 or newer, with no extensions beyond the defaults
- a directory the web server can serve clients from
- a browser

## What it refuses to do

- **It does not write files.** The public component (site) only opens files for reading and nothing else.
- **It does not read the request.** No `$_GET`, no `$_POST`, no cookie, no session.
- **It does not run third-party code.** The server part (site) has no dependencies. The system depends on only one JavaScript library (Mermaid), which runs in the reader's browser (editor) and is loaded only when a page contains a Mermaid diagram.

> The security model is not a list of mitigations. It is a list of things that are absent, and absent things cannot be exploited.
