# ADR-0025 — A Bundle is a slice of the repository, written by the site

**Status**: accepted · 2026-10-04 · related to ADR-0001, ADR-0017, ADR-0024

## Context

A reader who wants to keep a Document — to read it offline, or to take it and
edit it — has the page and nothing else. The markdown sits in `content/`,
above the document root; the pictures are in `media/`; the Editor that can
open the file is not on the server at all, because an Instance is `site/` and
the Editor is beside it in the repository. A host serving a Page Build runs
no PHP to assemble anything.

## Decision

**A Bundle is a ZIP of a slice of the repository**: one top directory, named
after what was taken, holding `editor/`, `site/content/<path>.md` for each
Document in each Language it is Published in, `site/public/media/<path>/` for
each one's Media, and a two-line `README.txt`. The paths inside are the
repository's own.

- **A Document page offers its Document; a Category page offers the
  Category** — its `index.md`, its Documents and its Sub-categories'. There is
  no Bundle of a whole Instance.
- **The site writes it.** A Bundle's address is its page's with `.zip` on it —
  `/guides/php/intro.zip`, `/guides.zip` — and PHP resolves it through the same
  comparisons as the page (ADR-0004, ADR-0022). A Page Build writes the same
  files to the same addresses.
  The ZIP is stored, not deflated, by a writer in `site/src/` — no PHP
  extension is required.
- **The Instance carries the Editor.** `bin/build` copies `editor/` into
  `site/editor/`, above the document root, read into Bundles and never served.
  It is a generated directory.
- **Offered unless something says not to**: the Document's `bundle` Meta, else
  Site Config's `bundle`, else offered; a word that is not `true` or `false`
  is not a choice. A Category Bundle leaves out a Document that says
  `bundle: false`.
- **Import is opening the file.** Unzipped, `editor/index.html` opens a
  Document from `site/content/` with *Open .md*, and shows its pictures
  because the Editor resolves Media in the repository's layout (ADR-0024).
  Getting an edited Document back onto a site is Transfer: the same `rsync`
  of `site/` that deploys one.

## Consequences

- A reader can take the source and the pictures of anything they can read.
  That is the same content the page shows; an Instance or a Document that does
  not want it offered says `bundle: false`.
- Every Bundle carries the Editor, about 3.8 MB, most of it the vendored
  Mermaid. Stored rather than deflated costs little: the payload is PNGs and
  minified script.
- The Editor still sends nothing anywhere and opens nothing but a `.md`. The
  Bundle is the site's, not the Editor's; ADR-0001's boundary is where it was.
- `site/editor/` is one more generated copy for `bin/test` to hold to its
  source.
- A Document's Media is taken whole, sub-directories included, unless a
  directory of the Document's name is beside it under `content/`. The
  directories in its Media are then the Media of that directory's Documents —
  a Sub-category's, which may not be Published or declared — and the
  Bundle takes the files alone.
- A Bundle follows no symbolic link inside `content/`, `media/` or `editor/`.
  A Document that is a link is on its page and not in its Bundle.

## Rejected

**The reader's browser assembles the ZIP** from the `.md`, each Media file and
each Editor file fetched one by one. It works on a host that runs nothing, and
makes `content/` sources and the Editor addressable file by file — a far wider
surface than one ZIP per page.

**`ZipArchive`.** Less code, and an extension that a shared host may not have,
which would make the feature a property of the host.

**The Editor opens a `.zip`.** A second way into the Editor and a ZIP reader to
keep, for what unzipping and *Open .md* already do.

**A layout for unzipping straight into an Instance** (`content/`,
`public/media/` at the top). The relative way from `editor/` to the pictures
would then differ between a Bundle and a checkout.
