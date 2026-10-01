# ADR-0020 — The Editor names a policy without a nonce

**Status**: accepted · 2026-10-01 · related to ADR-0013, ADR-0016

## Context

The public page runs under a Content-Security-Policy that names a nonce
(ADR-0013), so an escaping miss in the Renderer is contained by the browser as
well as by the code. The Editor's page named no policy: whatever reached its
DOM as markup ran. Two things made that gap worth closing. A Document from
somebody else can now hold Diagrams, and so put a pasted source in front of
Mermaid, three megabytes of third-party code (ADR-0016). And the fourth review
of 0.2.0 found an escaping miss in the Editor, a caption written through
`innerHTML`, which ran because nothing stopped it.

The Editor is opened from `file://` or served as static files. There is no
request, so a policy has to be named in a `<meta>`, and it cannot be made per
load. The page had three things such a policy would refuse: the inline script
that copied the starter document into `window.STARTER`, the `onerror`
attribute on the read pane's `<img>`, and the `<style>` element a Diagram's
placement made for Mermaid's stylesheet.

## Decision

`editor/index.html` names this policy in a `<meta>`:

    default-src 'none'; script-src 'self'; style-src 'self';
    img-src 'self' https: http: data:; connect-src 'none';
    base-uri 'none'; form-action 'none'; object-src 'none'

`'self'` matches a `file://` page in Chromium and Firefox, so the Editor's own
script files load whether it is opened from disk or served. The policy names
no nonce, no hash and no `'unsafe-*'` source.

What the policy refuses, the page stops doing:

- `ui.js` reads the starter document out of its inert
  `<script type="text/markdown">` element itself. No inline script is left.
- The read pane's `<img>` carries no handler. A listener `ui.js` attaches to
  the pane, in the capture phase because `error` does not bubble, swaps the
  picture for its box when the src does not load.
- A Diagram's stylesheet is a constructed `CSSStyleSheet` the document adopts.
  `style-src` does not govern one. Mermaid scopes its rules to the drawing's
  own id, so the sheets of different drawings do not collide. A sheet belongs
  to a kept drawing and is dropped with it, so the adopted sheets never
  outnumber the drawings kept. A drawing the read pane is showing is never
  the one dropped.
- Mermaid's per-element styles are written back through the CSSOM, one
  declaration at a time with `setProperty`, which the policy permits where it
  refuses the attribute. This record first said Firefox refuses an assignment
  to `cssText` as well. It does not: the fifth review tried it in Firefox 140
  and 155, and both honour one. What Firefox drops is the attribute's value.
- While Mermaid draws, its `style` attributes are written under another name,
  and its scratch `<style>` is an inert element whose text is kept beside the
  drawing. Firefox drops a refused `style` attribute's value as it is set, so
  a style statement's fill would otherwise never reach the placement. A
  scratch `<style>` would otherwise be reported as a refused stylesheet on
  every drawing.

`bin/test` holds the directives as written and fails if the `<meta>` is
removed, moved out of `<head>` or below anything the page loads, or loosened
in any part. The browser probe runs under the policy, because it is the same
page, and fails if a script or a stylesheet was refused during the run — or
if a handler it writes into the page as markup is not.

## Consequences

- An escaping miss in the Editor no longer runs inline script, handler or
  stylesheet. Injected markup can still name a file the policy's `'self'`
  matches: on a served Editor that is the Editor's own origin, and on a
  `file://` page Chromium and Firefox count any local file as `'self'`. A
  stylesheet named that way is applied. A script is not run, because the
  Editor writes markup through `innerHTML` and a browser never runs a
  `<script>` written that way.
- The policy does not govern where the tab goes. A link, or a
  `<meta http-equiv="refresh">` that reached the page as markup, still leaves
  the page, and the Document with it.
- `connect-src 'none'` makes the browser enforce what the source scan in
  `bin/test` already asserts: the Editor opens no connection.
- The policy is the same on every copy of the Editor, and anyone can read it.
  Nothing in it is a secret.
- An Image Line's src is still fetched from anywhere. That is the Editor's one
  deliberate outbound request, and markup injected into the page could make
  one of the same kind.
- Mermaid's measuring pass still writes inline styles the policy refuses, and
  Chromium reports each one as `style-src-attr`. The picture is right because
  the placement carries the styles.
- The Diagram code reaches into Mermaid's drawing by replacing
  `setAttribute` and `createElement` for the length of one render. The
  replacement stands for the whole page while the render runs, which is
  asynchronous, so the Editor's own code must not write a `style` attribute
  or make a `<style>` element; it uses the CSSOM. If a later
  Mermaid stops writing styles that way, the placement still reads whatever
  `<style>` and `style` the SVG arrives with. The worst case is reports in the
  console, not a wrong picture.

## Rejected

**A fixed nonce in the `<meta>`.** It is the same on every copy and printed in
the page, so injected markup could copy it. It would look like ADR-0013's
boundary without being one.

**Hashes of the inline script and handler.** They would have to be recomputed
whenever the starter document changed, and the starter is documented as the
thing an Instance edits (`docs/config.md`). A hash also cannot cover the
stylesheet Mermaid makes per drawing.

**`style-src 'unsafe-inline'` for the Diagram stylesheet alone.** It would
allow any `<style>` that reached the page, which is the kind of miss the
policy exists to contain. A constructed stylesheet needs no such allowance.
