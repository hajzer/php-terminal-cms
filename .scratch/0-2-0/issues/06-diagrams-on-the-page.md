# 06 — Diagrams on the public page

Status: done
Spec: ../spec.md
Blocked by: 05

## What

The published page draws a Diagram the way 05's read pane does, under the
nonce policy of ADR-0013, which does not change.

## Scope

- `Page::enhancement()` — the one inline script — finds code blocks in the
  `mermaid` Dialect. With none, it does nothing new. With one or more, it
  creates a `<script src="/mermaid.min.js">` carrying its own nonce, read from
  `document.currentScript.nonce`, so `script-src` gains nothing.
- The same configuration and placement as 05: `strict`, the page's theme
  tokens and accent, the stylesheet into a `<style>` carrying the nonce, every
  `style` attribute into the CSSOM.
- A Diagram that does not parse keeps its code block, and nothing is printed.
- The theme toggle redraws every Diagram.
- The script stays a nowdoc (ADR-0013): the nonce is not interpolated into it.
- The asset's address goes through whatever 07 makes of the Base Path — write
  it here so that 07 has one place to prefix, and say which in the comments.
- The Renderer is untouched.
- `docs/security.md`'s *The one script on the page* says what it now does on a
  page with a Diagram, and what it does on every other page: nothing new.

## Out

Build-time drawing. A second script file of our own. Any change to the policy
header.

## Acceptance

- [x] `bin/test`: the page shell of a Document without a Diagram is byte for
  byte what it was
- [x] `bin/test`: the enhancement script names no address other than the one
  Mermaid asset, and carries no interpolated nonce
- [x] by hand, `php -S` with the sample Diagram and the header policy
  enforced: drawn, styled, redrawn on theme toggle, the copy button copying the
  source, no `script-src` violation in the console, and `style-src` reports
  only from Mermaid's drawing, each one the policy blocking an inline style
  (reworded — see the comments)
- [x] by hand, the same page with scripts blocked shows the source as a code
  block
- [x] `php bin/test` green

## Comments

- 2026-09-30, agent: how it is built.
  - `Page::html()` appends the drawing part to the one script only when the
    body holds the Renderer's own `mermaid` code-block markup
    (`Page::hasDiagram()`). A writer's text that spells that markup out is
    escaped and draws nothing, and `bin/test` checks this. On every other page the script
    is the old one, to the byte. `bin/test` pins sha256 hashes of a fixed
    shell, with and without a nonce, recorded before the change, and checks
    that no sample page without a Diagram mentions `mermaid`.
  - **For 07:** the address is `Page::MERMAID` (`'/mermaid.min.js'`), and it
    is written once, into a `data-mermaid` attribute on the script tag. The
    script reads it from `document.currentScript`, so the script's text stays
    a constant nowdoc. 07 prefixes the Base Path there, and only there.
  - The nonce is read from `document.currentScript.nonce` and set on the
    created `<script>` and on the placed `<style>`. `bin/test` checks that the
    script's text never contains the nonce, that the page still has exactly
    two `nonce=` attributes, that the only address-like string is
    `/mermaid.min.js`, and that no fetch-like call appears. It also runs
    `node --check` on both variants of the script. That check was added
    after a broken escape went through the suite unnoticed; it goes red on
    that escape.
  - Configuration and placement are the Editor's (`editor/ui.js`), with two
    differences. The page does not cache drawings and prints no error. The
    page's `svg.namespaceURI` names the `<style>` namespace, so the script
    holds no URL literal. Drawings are queued one at a time with
    `then(one, one)`, as in the Editor.
  - A Diagram's copy button is replaced by a clone that copies the source
    exactly. The page's ordinary copy handler strips one leading space from
    every line (`replace(/^ /gm, '')`). The Renderer's `pre.code` has no
    prompt space, so every indented code block on the page loses a column when
    copied. That older bug was recorded under 05 and is left alone here,
    because fixing it changes every page's bytes. It wants its own issue.
- 2026-09-30, agent: headless Chromium (Playwright chromium 1243). The site
  was served with `php -S` through `site/public/index.php`, so it ran under the
  real header policy, with the sample content plus a page holding one broken
  and one valid Diagram. 16 of 16 checks passed:
  - A page without a Diagram requests no `mermaid.min.js` and logs no
    violation.
  - On the sample page `/mermaid.min.js` is requested once. The SVG replaces
    the `<pre>`, and the placed `<style>` carries the nonce and applies. The
    node fill comes from the theme, and every `style` attribute in the SVG was
    written after placement, from none.
  - The theme toggle redraws in the new fill, and a second toggle puts the old
    fill back.
  - The copy button copies the source exactly, indentation included.
  - The broken Diagram keeps its code block, nothing is printed and nothing
    is left in `<body>`, and the valid one beside it is drawn.
  - With JavaScript disabled, the source is a code block and nothing is
    fetched.
- 2026-09-30, agent: **the console acceptance cannot hold as written. A
  decision is needed.** On the sample page, drawing logs 69 CSP reports:
  66 `style-src-attr` and 3 `style-src-elem`, with **0 `script-src`**.
  Measured apart, `mermaid.render()` itself logs 37, from the scratch element
  it measures in inside the live document, and parsing its output logs 26–27.
  I tried three parses (`DOMParser`, a `<template>` and
  `createHTMLDocument`), and each logged the same count, because every one
  inherits the page's policy. Each report is an inline style being *blocked*.
  The picture is right because placement carries the styles. 05 predicted
  this. It is not the issue's stop condition, which is `'unsafe-eval'` or a
  surviving `style` attribute, and neither happened. `docs/security.md` now
  says the reports appear and why. The by-hand box stays open. The choices
  are to reword it ("no `script-src` violation; `style-src` reports only from
  the drawing"), or to go back to ADR-0016.
- 2026-09-30, agent: after the two-axis review. Corrected: the
  `enhancement()` docblock and the first paragraph of *The one script on the
  page* no longer say that every page's script only adds three conveniences
  and fetches nothing. A `bin/test` comment no longer names a release. Left as
  they are, and why:
  - The copy feedback and the theme resolution repeat the first part of the
    script. That part cannot change without changing every page's bytes.
  - `hasDiagram()` repeats the Renderer's markup. A change there turns the
    sample page's drawing test red, so it does not fail silently.
  - The Headers sentence in `docs/security.md` gained the exception for the
    added `<script src>`, which is outside the named section. It would have
    been false without the change. ADR-0016 does not name that exception. 10
    or 11 may want it in the ADR.
  - **Still to do by hand:** the two by-hand acceptance items, in a real
    browser. Serve with
    `php -S localhost:8080 -t site/public site/public/index.php` and open
    `/about/everything-is-a-line`.
- 2026-09-30, human: the by-hand check, in Firefox against `php -S`, with
  the header policy enforced. With scripts on, the Diagram is drawn. With
  scripts blocked by NoScript, the source shows as a code block. NoScript
  also logged one `script-src-elem 'none'` report of its own, for the page's
  inline script (its hash matched the script on a Diagram page). With the
  extension removed and the browser restarted, that report is gone. What
  remains is `style-src-elem` and `style-src-attr` reports attributed to
  `mermaid.min.js`, plus Firefox's "unreachable code after return statement"
  warning about the minified library, which is not a CSP report.
- 2026-09-30, human: decision on the console line: accept the `style-src`
  reports and reword the acceptance item as above. Stripping style
  attributes before parsing, and reopening ADR-0016, were both declined.
