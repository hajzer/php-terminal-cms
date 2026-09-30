# 10 — The fourth review, and a code read

Status: ready-for-human
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09

## What

One security review of the surface this release adds, in the shape of the
first three, appended to `docs/security-audit.md` as `## 0.2.0 — fourth
review`. A code read beside it, against the same surface, for correctness and
drift rather than exposure.

## Scope

- **Mermaid.** The pinned version's advisories. `securityLevel: 'strict'` and
  what it disables. The placement: that no `style` attribute survives, that the
  only `<style>` added carries the nonce, that the script it loads carries it.
  That a Diagram's source reaches `render()` as text and never as markup. What
  the Editor's network claim now covers, and that the vendored file is the one
  unscanned script.
- **Paste.** That clipboard `text/plain` goes through `parse()` and nothing
  else, and that no pasted byte reaches the DOM except as a Line's text.
- **The Base Path.** Where it enters the Renderer; that a Href or src is
  prefixed only when it starts with `/`, and that the allowlist still judges
  what the author wrote, not the prefixed result. That no request-time path
  can set it.
- **The Page Build's writes.** The first time code that renders the site writes
  a file. The refusals, the swap, the marker, symlinks under `content/` and
  under the output, an output given as a relative path, and what a failure
  mid-swap leaves.
- **The built policy.** The `<meta>` policy's reach, the nonce's lifetime, and
  `frame-ancestors`' absence, written down as residual risk.
- **The code read**: drift between the three implementations over the Dialect;
  the raw face and `toMarkdown` agreeing; documentation that no longer matches
  the code.
- A security finding is fixed in this release or becomes its own issue with the
  reason it waits. A code-read finding becomes an issue unless it is small
  enough to fix where found.
- Severity in the words the earlier reviews used; `## Residual risks` and
  `## Validation` updated in place.

## Acceptance

- [x] `## 0.2.0 — fourth review` appended, with scope, severity table, what was
  looked at and left alone, and hardening
- [x] every finding fixed or filed, none recorded and left
- [ ] the by-hand checks from 05, 06, 07 and 08 re-run on the final tree
- [x] `php bin/test` green

## Comments

- 2026-09-30, agent: the review is in `docs/security-audit.md` as
  `## 0.2.0 — fourth review`, with `## Residual risks` and `## Validation`
  updated in place. One finding, medium, fixed: the Editor's status line
  wrote an Image Line's caption through `innerHTML` unescaped (since 0.1.7),
  and a paste of `![<img src=x onerror=…>](x.png)` ran script in the Editor —
  tried in headless Chromium, and it ran; escaped now, and the probe holds it.
  Hardening: `bin/test` checks the vendored Mermaid's own first line — the
  hash of the bytes below it, the version `docs/security.md` names, the
  licence beside it; the build refuses a file named `.md` by name (it had
  failed on it with the wrong reason); ADR-0016 records the nonced
  `<script src>` that 06 left for 10 or 11. Filed: issue 12, the Editor's
  page naming no policy. Handed to 11: the `docs/security.md` sentences that
  still say no third-party JavaScript, one request, and under two thousand
  lines (it is about 2,200), plus what 11 already lists.
- 2026-09-30, agent: Mermaid 11.17.2 against its advisory feed. Fifteen
  advisories stand against the package on GitHub's database; three from 2021
  and 2022 predate 11, and each of the twelve since is fixed at 11.16.1 or
  earlier (11.10.0, 11.15.0, 11.16.1; the DOMPurify one at 10.9.3 never
  touched 11). OSV answers nothing for 11.17.2 today. 12.0.0 was published
  2026-09-10 and is not taken.
- 2026-09-30, agent: `php bin/test`: 721 passed, 0 failed. The probe in
  headless Chromium (Playwright's chromium 1243): **248 of 248**, one new for
  the caption; it went red before the fix.
- 2026-09-30, agent: the by-hand checks of 05, 06, 07 and 08, re-run as a
  script in headless Chromium on this tree, 31 of 31:
  - 05: `editor/index.html` from `file://`, a ```` ```mermaid ```` fence
    pasted: drawn, one placed stylesheet, and every request a `file://` beside
    the page, `editor/mermaid.min.js` among them.
  - 06: `php -S` through `index.php` on `/about/everything-is-a-line`: the
    header is the policy and there is no `<meta>`; the SVG replaces the
    `<pre>`, the placed `<style>` carries the nonce, a node's fill is the
    page's background; Mermaid fetched once from the origin and every request
    to the origin; the copy button copies the source; the toggle redraws in
    the new fill and a second toggle puts the old one back; **0 `script-src`
    violations**, and only `style-src-elem` (3 per drawing) and
    `style-src-attr` (66 per drawing) from the drawing; with scripts blocked
    the source is a code block and nothing is fetched.
  - 08: the same page from a Page Build under `/proj`, served plain: no
    header, the `<meta>` first in `<head>`, and every line of 06's list the
    same.
  - 07: a `/proj` build and a root build served with `php -S`: every local
    `href`, `src` and `data-mermaid` of every page answers 200 (97 each), and
    `404.html` is the site's 404 page.
  The box stays open for the maintainer's own run in a real browser, as
  every earlier issue's did. The tree is what 08's human check saw plus this
  issue's changes: `ui.js`'s status line, `bin/page-build`'s `.md` refusal,
  and the docs.
- 2026-09-30, human: the probe in Firefox: **24 failed of 247**, every one
  on a paste — the paste tests, the raw-face paste, and the whole Diagram
  section, which pastes its fence in. Also: the content of the pages is not
  adjusted to the screen width (which pages, and how, still to be said).
- 2026-09-30, agent: reproduced in Playwright's Firefox (155, build 1543),
  24 of 247 to the line. The cause is the probe's own `paste()` helper, not
  the Editor: it made a `DataTransfer` in script and dispatched it on a
  synthetic `paste` event, and the listener gets a *copy* of that
  DataTransfer in both browsers — one Chromium fills and Firefox hands over
  empty, so `getData('text/plain')` answered `''` and every paste said
  "nothing to paste". The helper now shadows the event's `clipboardData` with
  a stand-in that answers `getData()`, which is all the listeners under test
  read of it. **248 of 248 in Firefox and in Chromium.** What the probe
  cannot do in either is press a real `^V`: 03 tried that with real
  keypresses in Chromium only, so the by-hand check should include one real
  `^V` in Firefox with nothing open.
- 2026-09-30, agent, on the screen width: measured the site's home and
  Document pages, the `/proj` build's Document page and the Editor at 360,
  768, 1280 and 1920px in headless Chromium and Firefox. The site and the
  build fit at every width with no horizontal overflow, their stylesheets
  loaded, and a drawn Diagram is 338px wide at 360 and its natural 485px
  above that. The Editor overflows at 360px only: its top bar is 580px
  wide and clipped (484px at 0.1.9 — issue 04's *Export .md* and *raw*
  added the rest). Filed as issue 13. If what was seen is something else —
  the text column not filling a wide screen is the measure from 0.1.9, by
  design — the page, the browser and what it looked like are what is
  needed.
