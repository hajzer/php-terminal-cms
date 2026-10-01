# 20 — Two `theme:` Lines are the last on the page and the first in the Editor

Status: done
Category: bug
Spec: ../spec.md
Blocked by: —
Found by: the fifth review in issue 19

## What

The page and the Editor read a Document's Meta two ways.

The page builds a map: `Markdown::parse()` and `Document::peekMeta()` split
each Meta Line at its first colon, trim both halves, and write
`$meta[key] = value`. A key written twice keeps the **last** value, and
`theme : things` is the key `theme`.

The Editor finds a Line: `Doc.metaAt(key)` returns the **first** Meta Line
whose text starts with `key:`, so a key written twice keeps the first, and
`theme : things` is not `theme` at all.

Run through both on this tree:

| in the frontmatter | the page is drawn in | the Editor's read pane |
| --- | --- | --- |
| `theme: wasp` then `theme: things` | things | wasp |
| `theme: nope` then `theme: wasp` | wasp | no pin |
| `theme : wasp` | wasp | no pin |
| `theme:wasp` | wasp | wasp |

ADR-0019 and the CHANGELOG say a Document's `theme:` draws the read pane in
that Theme, "so the preview is the page". For these files it is not.

## Why it is not the review's to fix

It is not exposure: both readers judge the name against the Themes there are
before either uses it, and neither shape reaches anything but a Theme that
exists. And it is older than the Themes, which only made it visible —
`title:` is read the same two ways, where it decides the page's title on one
side and the file's name on the other.

Which reader moves is a decision about what Meta is: whether a key may be
written twice, and whether a space before the colon is part of the key. The
Editor never writes either shape itself — a paste merges frontmatter by key,
and `setMeta` writes `key: value` — so only a file from somewhere else has
them.

## Acceptance

- [x] the page and the Editor agree on which `theme:` a Document with two is
  drawn in, and on whether `theme : x` names one
- [x] the same answer holds for `title:`, `palette:` and every other key
  either side reads
- [x] `bin/test` compares the two readers on a Document with a repeated key
  and one with a spaced colon

## Comments

- 2026-10-01, human, triage: the Editor follows the page. No published page
  changes.
- 2026-10-01, agent: done. `Doc.metaAt()` finds the **last** Meta Line whose
  key — what stands before its first colon, trimmed — is the one asked for,
  and `meta()`, `setMeta()`, `theme()`, the paste's merge by key and `Tab` on
  a `theme:` or `palette:` Line all read through it. `setMeta` and a paste
  therefore write the Line that is read, and `Tab` on `theme : wasp` steps it
  and writes `theme: <next>`. Nothing in `site/src/` moved. The two meta bars
  still choose what to print by the Line's first characters, in both halves
  alike, and were left: they agree, and changing what the page prints was not
  the decision.
  `tests/js-model.js` has thirteen assertions for it, each red before the
  change that could be. `bin/test` runs nine frontmatters through both
  readers — a key twice, a first and a last `theme:` that is no Theme, a
  space before the colon, none after it, a value with colons, a key emptied
  by a later Line, a Line with no colon, a longer key that starts the same —
  and requires the same `title`, `category`, `date`, `theme` and `palette`
  from each, and the Editor's pin to be the Theme the page is drawn in.
  `docs/format.md` states the rule. `php bin/test`: 860 passed, 0 failed.
