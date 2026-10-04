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

Each entry carries its mtime twice: as a DOS time in UTC, and as the Unix
time in an extended-timestamp (`UT`, 0x5455) field. Neither depends on the
host's timezone. `unzip` restores the field exactly, and the suite checks this
by unpacking under `TZ=Asia/Kathmandu`. The field is a signed 32-bit time, so
it is clamped to 1970–2038.

`bin/build` rewrites a target only when its bytes change, and gives each
`site/editor/` copy its source's mtime. A rebuild leaves every mtime alone, so
it does not change a Bundle's bytes. Git does not record mtimes: a fresh
checkout stamps Bundles with the checkout's times, and they are stable from
then on. A release archive and `rsync -a` carry mtimes, so Instances deployed
from the same release write the same bytes. That holds for `site/content/` and
`media/` as much as for `site/editor/`. It follows from taking the time from
the mtime, as the spec says.

The suite forbade `fwrite` anywhere in `site/src/`. It now allows `fwrite` in
`Zip.php` alone and requires every `fopen()` there to be `'rb'`. The scan of
the whole site also covers `fputs`, `fputcsv`, `ftruncate`,
`SplFileObject`, `tmpfile`, `tempnam`, `copy(`, `rename(`, `mkdir(`, `rmdir(`,
`touch(`, `symlink(` and `chmod(`. A file mode held in a variable is not
caught. This is for the sixth review (12).

Both read-back branches have run. The `unzip` branch runs on this host. The
`ZipArchive` branch ran in a throwaway `php:8.3-cli` container with
`docker-php-ext-install zip`. The `unzip` mtime check runs wherever `unzip`
exists, whichever reader did the read-back.
