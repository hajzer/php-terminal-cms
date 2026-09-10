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

## Keep the files canonical

`bin/fmt` rewrites content files into exactly the form the editor emits, so a file you hand-edited and a file the editor exported are byte-identical.

```console
$ php bin/fmt --check
```

```output
  ok      site/content/guides/publishing-is-a-file-copy.md

10 file(s), 0 changed
```
