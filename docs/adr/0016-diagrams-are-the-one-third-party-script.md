# ADR-0016 — Diagrams are the one third-party script

**Status**: accepted · 2026-09-30 · amends ADR-0002, ADR-0013

## Context

Writers want Mermaid diagrams: a fenced ```` ```mermaid ```` block drawn as a
picture, the way GitLab and GitHub draw it. Nothing in PHP can draw one, and
the only drawing code there is — Mermaid itself — is a browser library of about
three megabytes with a security history of its own.

Until now the project promised no third-party JavaScript anywhere, and the
public page promised to be complete in one response with its script blocked.

## Decision

`mermaid` is a Code Dialect, and a Code Run in it is a **Diagram**. The Renderer
and the Editor emit a Diagram exactly as they emit any code block: escaped
source, tags they chose themselves. The drawing is an enhancement on top.

The Mermaid library is vendored and pinned in the repository — never fetched
from a CDN — and loaded only by a page that contains a Diagram, in both the
Editor's read pane and on the public page. It runs with `securityLevel:
'strict'`. It replaces the code block in place; with the script blocked or
failing, the reader has the source as an ordinary code block.

This is the one exception to "no third-party JavaScript", and it is scoped to
pages that draw a diagram.

The page's Content-Security-Policy is not widened for it. Mermaid's output
carries a `<style>` element and `style` attributes, both of which the nonce
policy of ADR-0013 refuses, so the page draws through `mermaid.render()` and
places the result itself: the stylesheet into a `<style>` carrying the page's
nonce, every `style` attribute into the element's CSSOM, which the policy
permits.

## Consequences

- A page without a Diagram is byte-for-byte what it was: no extra request, no
  wider policy.
- There is now a CVE feed to watch, and upgrading Mermaid is part of a release.
- The Line model is untouched: no fifteenth Type, and the file stays standard
  markdown that other hosts draw the same way.
- Placing the SVG depends on the shape of Mermaid's output, which an upgrade
  can change without notice. The editor probe asserts that a drawn Diagram
  carries its styles, so an upgrade that breaks the placement fails a test
  rather than a page.

## Rejected

**Drawing only in the Editor.** Keeps the public origin at zero third-party
bytes, at the price of a Diagram the writer saw as a picture being published as
source.

**`'unsafe-inline'` styles on pages that carry a Diagram.** Robust across
Mermaid upgrades and a few lines shorter, and it gives back, for CSS, the
second boundary ADR-0013 was written to establish. A nonce and
`'unsafe-inline'` cannot coexist — browsers ignore the latter — so it would mean
dropping the nonce from `style-src` on those pages altogether.

**No drawing at all.** Writers keep rendering SVG themselves and placing it with
an Image Line, which already works and costs nothing — and is what the demand
for this feature is a demand to stop doing.
