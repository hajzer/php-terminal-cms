# 12 — The tab can leave the document behind

Status: done
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

- [x] a link clicked in the read pane cannot lose the Document without a word
- [x] a URL dropped outside the edit box cannot either
- [x] a text drop into an open edit box still lands in it
- [x] the probe drives both gestures and asserts the Document survives
- [x] `bin/test`'s comparison of the two halves' rendering still holds, or the
  decision that it no longer needs to is written down

## Comments

- 2026-10-01, human, triage: implement it with 0.2.0, as links that open in a
  new tab and drops that are refused. No leave-page guard.
- 2026-10-01, agent: done, in the 0.2.0 tree. The decision is ADR-0021.
  - **The link.** A click on an `<a>` in the read pane has `target="_blank"`
    and `rel="noopener noreferrer"` set on it by `ui.js` as it passes, and
    goes on. `renderDoc()` is untouched, so the preview's markup is still the
    site's default rendering and `bin/test`'s comparison holds as it was. A
    fragment and a `mailto:` go as written. A link a Diagram draws goes the
    same way. Tried with real clicks in headless Chromium and Firefox: an
    `https:` link, a local path and a Diagram's `click` link each opened one
    new tab and left the Editor's tab where it was with the Document in it; a
    link to a heading scrolled the pane.
  - **The drop.** The page's `drop` listener calls `preventDefault()` on
    anything that carries no file and says "nothing to open — a drop is a
    markdown file", unless it lands on an `<input>`, a `<textarea>` or a
    `contenteditable` — an open Line, the command line, the Name, the address
    overlay's fields — where the browser puts the text. A Line dragged for
    reordering and let go of outside the sheet is refused without the message.
  - **The probe** has six assertions for it: the pane writes a link with no
    target; a click gives it one and is not stopped; a fragment and a
    `mailto:` are left alone; a URL dropped on the read pane and on the sheet
    is refused with the message; a drop on an open edit box is not; the
    Document is what it was. Against the Editor as it was, the click and the
    drop assertions fail. A real drag from outside the browser cannot be
    driven headlessly: that one is for a hand.
  - **The words.** `ui.js`'s header, CONTEXT.md's **Editor**,
    `docs/security.md`, `docs/keymap.md`, the audit's residual risks and the
    CHANGELOG's 0.2.0 entry say what the preview does now.
  - `php bin/test`: 860 passed, 0 failed. The probe: 299 of 299 in headless
    Chromium and headless Firefox.
