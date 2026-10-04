---
title: On a host without PHP
category: guides/hosting
date: 2026-10-04
---

# On a host without PHP

A host that serves files and runs nothing — GitLab Pages, GitHub Pages, a bucket behind a CDN — can still serve the site. A **Page Build** renders every page to a file ahead of time, through the same router and the same page shell the request-time site answers with.

## Build it

```console
$ php bin/page-build --output=dist/pages --base-url=https://example.gitlab.io/notes/
```

```output
built /home/you/notes/dist/pages for /notes/
```

Each Category, Sub-category and Document becomes a directory with an `index.html` in it, beside everything in `site/public/` except its PHP. `--base-url` is where the site will begin on its host; leave it out and the site begins at the host's root. A page that offers a Bundle has it beside it, at its address with `.zip` on it, and what is not Published is not built at all.

## What it costs

- A page changes when the build runs again, not when a file is copied.
- The policy is a `<meta>` in each page, with one nonce for the whole build, because a static host sends no header the site chooses.
- An address that is nothing is answered by `404.html`, if the host is told to use it.
- Every Bundle carries its own copy of the editor, about 4 MB each. `'bundle' => false` in `site.php` builds none but a document's that says `bundle: true`.
