# 01 — The model half of links and Image fields

Status: done
Spec: ../spec.md
Commit: 1 of 5 — "editor: link and image overlay"

## What

Everything about finding and rewriting the addressed thing in a Line's text,
with no DOM in it. Lives in `editor/editor.js` so `tests/js-model.js` can drive
it under node — `editor/ui.js` is keyboard, mouse and DOM only (AGENTS.md,
ADR-0005).

## Scope

- Find the links in a Line's text: the same pattern the two `inline()`
  implementations already match. Report each link's wording and its href, in the
  order they appear.
- Replace the nth link with a new wording/href pair.
- Replace the nth link with its wording alone — unlinking.
- Append a new link to the end of a Line's text.
- Expose the safe-href judgement `editor/editor.js` already carries for its
  preview pane, so the overlay can warn with the very rule the published page
  uses. Do not write a second allowlist.

## Out

No new markdown syntax. No inline `![alt](src)`. The Image Line's exported shape
(`![caption](src)`) is unchanged — the Image half of this work is reading and
writing `text` and `sub` on a Line that already exists, which the model can
already do.

## Acceptance

`node tests/js-model.js` covers, and passes:

- [x] a Line with no links, one link, several links
- [x] a link whose wording contains brackets
- [x] two adjacent links
- [x] replacing the second of three, leaving the first and third byte-identical
- [x] unlinking keeps the wording exactly
- [x] appending to a Line that had none, and to a Line that had some
- [x] the safe-href judgement agrees with `Renderer::safeHref` on the cases
  `bin/test`'s `link targets` section already lists

Then:

- [x] `php bin/test` green
- [x] `tests/js-inline.js` untouched and still passing

## Comments

Done in `93d6112` — "editor: the model half of links".

`editor/editor.js` gains, and `editor/ui.js` is untouched:

| Function | Does |
| --- | --- |
| `links(text)` | every link in order, as `{wording, href, at, end}` |
| `setLink(text, n, wording, href)` | rewrites the nth |
| `unlink(text, n)` | replaces the nth with its wording |
| `addLink(text, wording, href)` | appends a new one |
| `safeLinkHref(href)` | the existing allowlist judgement, exposed |

`inline()` and `links()` now read the link syntax through one `LINK` constant,
so there is one pattern rather than two that could drift. `safeLinkHref()`
wraps the `safeHref(rawHref(esc(…)))` the preview already used — no second
allowlist, and it escapes first, the way `inline()` does, so it judges the href
the same way round the Renderer does.

Two things settled here that the later issues depend on:

- **A link needs both halves.** The first cut let an empty wording fall back to
  the href, which would have fought the refusal issue 02 asks for. Now an empty
  wording leaves the text as it stands, with a test for it.
- **Link, Wording and Href are in `CONTEXT.md`** (noted in issue 07, which
  should not write them again). The overlay's field was renamed `text` →
  `wording` in the spec and issue 02 to match: on the Image half of that same
  overlay a Line's `text` is already the src, so one overlay had `text` meaning
  two things.

`node tests/js-model.js`: 161 cases, 0 failed. `php bin/test`: 370 passed, 0
failed. `tests/js-inline.js` untouched.
