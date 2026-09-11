# 07 — The editor's own logo and favicon

Status: ready-for-agent
Spec: ../spec.md
Commit: 4 of 7 — "brand: a logo and a favicon, both halves"

## What

The Editor is a page too. Its tab has no icon, and its top bar spells the name
out in text. It should carry the same mark the site does, so the two halves look
like one piece of software.

**The Editor is never told any configuration and gains none here.** Its logo and
its icon are files sitting beside it, not settings — the site's are settings
because an Instance has its own identity, and the Editor has none to have.

## Scope

- A `<link rel="icon">` in `editor/index.html`, pointing at a file shipped in
  `editor/`.
- The mark in the top bar's brand, in front of the wordmark. The wordmark stays:
  it is the name, and the version sits beside it.
- Sized in CSS to the top bar's line, the way the site's brand logo already is,
  so a file of any reasonable size fits and nothing moves.
- The Editor opens from the filesystem as often as from a server, so every path
  it uses is relative and has to work under `file://`. An icon that resolves
  only from a web root is not shipped.

## The trap this issue has to fix

`bin/build` generates `tests/editor-probe.html` from `editor/index.html` by
repathing its assets, and the list of assets it repaths is **written out by
hand** — the two stylesheets and the three scripts, named one at a time. A new
`href=` or `src=` in the page is not repathed, so the probe would ask for it
relative to `tests/` and get nothing.

`bin/test` does not catch this. It compares the probe to the page by undoing the
rewrite generically, so an asset that was never rewritten matches anyway and the
check passes green while the probe quietly 404s. Verified before this issue was
written.

So, as part of this work and before the icon is added:

- The repathing stops being a hand-written list. Every relative `href=` and
  `src=` in the page is repathed, except the probe's own script.
- An assertion that would have caught it: every asset the generated probe
  references resolves to a file that exists.

## Out

A configurable Editor logo, an Editor that reads `site.php`, or any Editor
setting whatever — it has none and this does not start the collection. A
different mark for the Editor than the one the site ships. Replacing the
wordmark with the logo. Any layout or sizing change to the top bar beyond
fitting the mark on the line it already has.

## Acceptance

- [ ] `editor/index.html` carries a `<link rel="icon">` and a mark in the brand,
  and both resolve when the page is opened from the filesystem
- [ ] the wordmark and the version are unchanged and in the same place
- [ ] the top bar's height is unchanged
- [ ] `php bin/build` regenerates `tests/editor-probe.html` and every asset the
  probe references resolves to a file that exists
- [ ] `bin/build`'s repathing is generic — adding a sixth asset to the page
  needs no edit to `bin/build`
- [ ] a new asset added to the page and left unrepathed **fails** `bin/test` —
  verified by trying it and then taking it out again
- [ ] `php bin/test` green, including the derived-files check
- [ ] the probe green in a browser, opened from the filesystem, with its count
  noted in the comments
