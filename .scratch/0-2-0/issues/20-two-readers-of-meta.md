# 20 — Two `theme:` Lines are the last on the page and the first in the Editor

Status: needs-triage
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

- [ ] the page and the Editor agree on which `theme:` a Document with two is
  drawn in, and on whether `theme : x` names one
- [ ] the same answer holds for `title:`, `palette:` and every other key
  either side reads
- [ ] `bin/test` compares the two readers on a Document with a repeated key
  and one with a spaced colon
