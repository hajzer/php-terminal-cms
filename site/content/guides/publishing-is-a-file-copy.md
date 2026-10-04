---
title: Publishing is a file copy
category: guides
date: 2026-09-08
---

# Publishing is a file copy

The editor exports a markdown file. Moving that file to the server is a step the software knows nothing about, and that is the whole security model.

## With git

```console
$ git add site/content/guides/my-new-guide.md
$ git commit -m "guide: my new guide"
$ git push
```

Then, on the server, in a deploy hook or by hand:

```console
$ git -C /var/www/example.com pull --ff-only
```

## With rsync

```console
$ rsync -az --delete site/content/ deploy@example.com:/var/www/example.com/site/content/
```

## With whatever you already use

WinSCP, FileZilla, `scp`, a mounted share. The server reads `content/` from disk; it does not care how a file got there.

> [!NOTE]
> There is no upload endpoint to secure, no admin password to leak and no session to steal, because the writing half and the serving half share nothing but a file format.

## Pictures go the same way

A document's pictures live in its own directory, `site/public/media/<category>/<name>/`, and are copied like the document is.

```console
$ rsync -az site/public/media/ deploy@example.com:/var/www/example.com/site/public/media/
```

## Early, and back again

A document that says `published: false` can be copied before it should be read: it is on the server and at no address until the line is gone.

The copy runs the other way too. A document's page offers **↓ bundle** — the document, its pictures and the editor in one ZIP. Unzip it, open `editor/index.html`, edit, and the same `rsync` puts it back.

## Keep the files canonical

`bin/fmt` rewrites content files into exactly the form the editor emits, so a file you hand-edited and a file the editor exported are byte-identical.

```console
$ php bin/fmt --check
```

```output
  ok      site/content/guides/publishing-is-a-file-copy.md

11 file(s), 0 changed
```
