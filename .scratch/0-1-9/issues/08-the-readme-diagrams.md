# 08 — The README's diagrams

Status: ready-for-agent
Spec: ../spec.md
Commit: 5 of 8 — "docs: the diagrams"

## What

The README explains a system whose whole idea is visual — two halves that never
talk to each other, and a document that is a sequence of typed lines — with one
ASCII sketch and a lot of prose. Diagrams are coming.

**The image files arrive from the maintainer, later.** This issue prepares
everything that does not depend on having them, and states what must be true of
them when they land. It is deliberately the one commit in this release that can
be dropped without dropping anything else.

## Scope — now

- A home for them: `docs/media/`, referenced from the README by relative path so
  that it resolves on a git host and in an unpacked archive alike.
- `bin/manifest.php` gains that directory. This is the first file touched in two
  releases that the manifest does not already ship inside a directory it copies
  whole — `docs/` is listed file by file, not as a directory, so a new one under
  it is invisible to the archive until it is named. `bin/test` fails when a
  tracked file has fallen off the manifest, so this is caught rather than
  discovered by a reader of the archive.
- Where in the README each diagram goes, and what each is **for** — a diagram
  that repeats the prose beside it earns nothing.
- The alt text, written as writing. A README is read in a terminal, by a screen
  reader, and on a phone with images off; the alt text is the diagram for all
  three, and it is not "diagram".

## Scope — when the files land

- Every reference resolves, from the repository root and from an unpacked
  archive.
- Nothing points at a file that is not there. The references land in the same
  commit as the files: a README shipped pointing at a missing image is worse
  than a README with no images.
- The existing ASCII sketch of the two halves stays unless a diagram genuinely
  replaces it. It works where images do not.
- Each file is small enough that cloning the repository is not a decision, and
  is a format a git host renders inline.

## Out

Diagrams in `docs/` beyond the README, and any diagram in the published site or
the Editor. Generating or rendering diagrams from source at build time. A
diagram that documents something the code does not do yet.

## Acceptance

- [ ] `docs/media/` exists and is named in `bin/manifest.php`
- [ ] `php bin/test` green, including the manifest check
- [ ] the README says where each diagram goes and what it is for
- [ ] alt text is written for each, and reads as writing rather than as a label
- [ ] no reference in the README points at a file that is not in the repository
- [ ] with the files in place: every reference resolves from the repository
  root, and from an unpacked archive built by `bin/package`
- [ ] the archive carries `docs/media/` and its contents

## Comments

If the image files have not arrived when the rest of the release is ready, this
issue is held and its commit is skipped. Nothing else in 0.1.9 depends on it,
and issue 10 should not wait for it — say so in that issue's comments rather
than shipping a README that points at nothing.
