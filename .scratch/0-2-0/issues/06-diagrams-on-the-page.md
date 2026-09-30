# 06 — Diagrams on the public page

Status: ready-for-agent
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

- [ ] `bin/test`: the page shell of a Document without a Diagram is byte for
  byte what it was
- [ ] `bin/test`: the enhancement script names no address other than the one
  Mermaid asset, and carries no interpolated nonce
- [ ] by hand, `php -S` with the sample Diagram and the header policy
  enforced: drawn, styled, redrawn on theme toggle, the copy button copying the
  source, and no CSP violation in the console — noted in the comments
- [ ] by hand, the same page with scripts blocked shows the source as a code
  block
- [ ] `php bin/test` green
