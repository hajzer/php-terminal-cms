# 07 — The ZIP writer, and the Editor inside `site/`

Status: done
Spec: ../spec.md

## What

The two pieces a Bundle is made of that are not about Documents: a stored-ZIP
writer of the site's own, and a generated copy of the Editor at `site/editor/`.

## Scope

- `site/src/Zip.php`: method 0 entries, CRC-32 by `hash('crc32b')`, UTF-8 name
  flag, central directory and end record; entries streamed to a stream
  resource; each entry's time from the source file's mtime, so the same
  input gives the same bytes. No PHP extension needed.
- `bin/build` copies `editor/` to `site/editor/`; `bin/test` fails if the copy
  differs from its source. `.gitignore` or not: decide by how `site/public`'s
  generated `theme.css` is handled today, and do the same.
- `bin/manifest.php` ships it; `docs/deploy.md` says it is above the document
  root and never served.
- `AGENTS.md`'s list of generated files gains `site/editor/`.

## Out

Which files go into a Bundle (08). Deflate.

## Acceptance

- [x] `bin/test`: a written ZIP read back by `ZipArchive` where present and by
  `unzip -t` otherwise; CRCs, names and sizes exact; two runs byte-identical
- [x] `bin/test`: `site/editor/` equals `editor/`
- [x] `AGENTS.md` and `docs/deploy.md` updated

## Comments

`Zip` has two ways in: `file($name, $path)` streams a file from disk and stamps
it with the file's mtime, and `data($name, $bytes, $mtime)` takes bytes that are
not a file, such as 08's `README.txt`. `finish()` writes the central directory
and leaves the stream open.

The DOS time is the mtime in UTC, so the bytes do not depend on the host's
timezone. `unzip` reads a DOS time as local time, so an unpacked file's mtime
is off by the reader's UTC offset. An extended-timestamp extra field (0x5455)
would fix that and would not change determinism. It is not written.

A Bundle's bytes follow the mtimes of `site/editor/`. `bin/build` keeps each
copy's mtime equal to its source's, but git does not record mtimes. A fresh
checkout, or a deploy that does not keep them (`rsync -a` does), stamps
Bundles with checkout times. They are stable from then on, but two Instances
deployed from the same release are not byte-identical. That matters for 09's
"same bytes as the request-time route" only if the two are compared across
hosts.

The suite forbade `fwrite` anywhere in `site/src/`. It now allows `fwrite` in
`Zip.php` alone and requires every `fopen()` there to be `'rb'`. `fputs`,
`SplFileObject` and a mode held in a variable are not scanned anywhere in the
site. This is for the sixth review (12).

On this host only the `unzip` branch of the read-back ran: PHP here has no
`ZipArchive`. The `ZipArchive` branch has not been run yet. Python's `zipfile`
read a 22-file archive cleanly as a one-off check.
