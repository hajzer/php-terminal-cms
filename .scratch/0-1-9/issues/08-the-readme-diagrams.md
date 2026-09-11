# 08 — The README's diagrams

Status: done
Spec: ../spec.md
Commit: 5 of 8 — "docs: the diagrams"

## What

The README explains a system whose whole idea is visual — two halves that never
talk to each other, and a document that is a sequence of typed lines — with one
ASCII sketch and a lot of prose. Diagrams are coming.

The maintainer has the files. They land in this commit with the references that
point at them: `bin/test` fails when a tracked file is not named by
`bin/manifest.php`, so adding them without the manifest line turns the suite red
— the two arrive together or not at all.

## Scope

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
- Every reference resolves, from the repository root and from an unpacked
  archive.
- The existing ASCII sketch of the two halves stays unless a diagram genuinely
  replaces it. It works where images do not.
- Each file is small enough that cloning the repository is not a decision, and
  is a format a git host renders inline.

## Out

Diagrams in `docs/` beyond the README, and any diagram in the published site or
the Editor. Generating or rendering diagrams from source at build time. A
diagram that documents something the code does not do yet.

## Acceptance

- [x] `docs/media/` exists and is named in `bin/manifest.php`
- [x] `php bin/test` green, including the manifest check
- [x] the README says where each diagram goes and what it is for
- [x] alt text is written for each, and reads as writing rather than as a label
- [x] no reference in the README points at a file that is not in the repository
- [x] every reference resolves from the repository root, and from an unpacked
  archive built by `bin/package`
- [x] the archive carries `docs/media/` and its contents

## Comments

The files exist and are the maintainer's to place. Nothing else in 0.1.9 depends
on this issue, so if a diagram turns out to want redrawing it can be held
without holding the release — but the manifest line and the references belong
with whatever files do land, never ahead of them.

The maintainer's PNG turned out to document a different program: a `templates/`
directory, an `F1`–`F4` toolbar, a "New post / Edit post / List posts" sidebar
and a penguin for a mark — none of which exist here. The maintainer asked for it
to be redrawn against the code, and confirmed the one claim that looked wrong
but is not: the CLI in it means editing the deployed `content/*.md` with a
terminal editor, which is true and is now said in those words.

So it is drawn, not photographed — `docs/media/architecture.svg`, 10 kB, in the
project's own palette, rendered inline by a git host and editable the next time
the code moves. It sits at the head of Layout, where the tree said what the
files are and nothing said what happens between them. The ASCII sketch stays.

Review then caught the diagram doing the thing this issue put out of scope.
The bottom row claimed to be the order the classes in `site/src` are reached and
was not: `Router` consults `Site`, `Language` and `Listing` before `Document`,
not after. It also said there are no rewrite rules, and `site/public/.htaccess`
ships three. Both are fixed in `828d2ec`.

Only one file landed, so only one diagram is placed. The manifest line and the
references went in with it.
