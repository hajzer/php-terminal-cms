# 12 — The tab can leave the document behind

Status: needs-triage
Spec: ../spec.md
Blocked by: —
Found by: the deep code read in issue 10

## What

The Editor holds one Document in the browser tab and nowhere else. Two
ordinary gestures navigate the tab away, and the browser's default for both is
what happens:

- **A link clicked in the read pane.** `renderDoc()` writes real `<a href>`
  elements, because the preview is the page the site will make. The `read`
  pane's click handler acts on the copy button and lets everything else
  through, so a click on a link follows it — in this tab.
- **A URL, or text, dropped on the page outside the edit box.** The `drop`
  handler on `document` reads `dataTransfer.files[0]` and returns without
  `preventDefault()` when there is none. The browser then does what it does
  with a dropped URL, which is navigate to it.

Either way the Document is gone: the page reloads as the starter document, and
`^Z` has nothing to bring back. Nothing warns first.

## Why it waits

Not exposure, and not a one-line fix. There are at least three answers and
each changes what the preview is or what the page refuses:

- a `beforeunload` guard, which is the browser's own "leave this page?" and
  costs nothing in the preview, but fires on a deliberate close too;
- preview links that open elsewhere, which makes the preview a rendering the
  site does not make — the Editor is never told `link_open`, and today a link
  in the preview is the `'here'` rendering byte for byte, which `bin/test`
  compares;
- a `drop` that is refused unless it carries a file, which is safe for the
  page but has to leave a drop *into* an open edit box alone.

Choosing is a decision about the preview's claim, not a fix to make while
reviewing. The Editor's header comment, CONTEXT.md and `docs/security.md` all
describe what the page fetches and sends; none of them says what leaves it,
and whichever answer is chosen should be written where the claim about the
preview lives.

## Acceptance

- [ ] a link clicked in the read pane cannot lose the Document without a word
- [ ] a URL dropped outside the edit box cannot either
- [ ] a text drop into an open edit box still lands in it
- [ ] the probe drives both gestures and asserts the Document survives
- [ ] `bin/test`'s comparison of the two halves' rendering still holds, or the
  decision that it no longer needs to is written down
