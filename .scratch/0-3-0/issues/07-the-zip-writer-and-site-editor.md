# 07 — The ZIP writer, and the Editor inside `site/`

Status: ready-for-agent
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

- [ ] `bin/test`: a written ZIP read back by `ZipArchive` where present and by
  `unzip -t` otherwise; CRCs, names and sizes exact; two runs byte-identical
- [ ] `bin/test`: `site/editor/` equals `editor/`
- [ ] `AGENTS.md` and `docs/deploy.md` updated

## Comments
