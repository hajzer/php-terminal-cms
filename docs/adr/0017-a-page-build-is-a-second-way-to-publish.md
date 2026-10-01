# ADR-0017 — A Page Build is a second way to publish

**Status**: accepted · 2026-09-30 · amends ADR-0002, ADR-0013 · amended by ADR-0019

## Context

ADR-0002 renders the public site in PHP on every request, so publishing is a
file copy. Some hosts an author already has — GitLab Pages, GitHub Pages —
serve files and run no PHP at all. ADR-0001 once made the whole site static and
was reversed; the reasons it was reversed still hold for an Instance that has
PHP.

## Decision

A **Page Build** renders every page of an Instance to files, with the same
Router, Renderer and Page shell that answer a request. It is a second way to
publish, beside request-time rendering, not a replacement for it.

- **Layout.** `index.html` for the homepage, `<category>/index.html` for a
  Category, `<category>/<slug>/index.html` for a Document and for each of its
  Languages, and `404.html`. Links are written `/<category>/<slug>/` — an
  address the request-time site answers too, because its Router ignores a
  trailing slash, so a link shared from either mode works on the other.
- **Base Path.** Read from the path of the base URL the build is given, and
  put in front of every local address the site carries: navigation, Listings,
  language links, assets, and a Link's Href or an Image's src written from the
  site's root. Addresses stay absolute: `404.html` is served at whatever depth
  the reader mistyped, where a relative one would resolve against that. The
  Base Path is the build's, not Site Config's — one Instance can be built for
  two hosts.
- **Policy.** Static hosts send no headers a site chooses, so a built page
  names its Content-Security-Policy itself, in a `<meta>` element, with one
  random nonce per Page Build on the inline script and a Diagram's placed
  stylesheet.

- **Output.** The build renders into a fresh directory beside the output and
  swaps it into place only once every page has rendered. It replaces an output
  that is absent, empty, or marked as an earlier Page Build, and refuses
  anything else — and anything that is or holds `site/` or `content/`. It
  refuses to run without a Site Config rather than fall back to the example.

## Consequences

- Two ways to produce one page can drift. `bin/test` builds the sample content
  and requires every built page to equal the page the request-time site serves
  for the same address, but for the Base Path, the trailing slash and where
  the policy comes from — which holds only as long as the build has no page
  assembly of its own.

- The Editor is untouched and knows nothing of either mode. An Href written
  from the site's root means the site's root on both.
- A `<meta>` policy cannot carry `frame-ancestors`, so a built page can be
  framed. It has nothing to click that a framing page could abuse.
- A nonce that lives as long as a build is weaker than one per request only
  against an attacker who can both inject markup and read the page. On a static
  site the only thing that can inject markup is the content, and the Renderer
  cannot express raw HTML (ADR-0003).
- Pages cannot be browsed from `file://`, where a directory does not open its
  `index.html`. A local preview is `php -S` over the output directory.

## Rejected

**`<slug>.html` linked without the extension.** The addresses stay identical to
the request-time site's, but only on hosts that fall back from `/x` to `x.html`
— GitLab and GitHub do, plain nginx and S3 do not.

**Page-relative links.** No Base Path to configure, and a build that works
wherever it is copied — except on `404.html`, which a host serves at any depth.

**No policy on built pages.** The Renderer would be the only boundary, which
is what ADR-0013 was written to stop being true.
