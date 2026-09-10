# ADR-0012 — The tagline is read, not only indexed

**Status**: accepted · 2026-09-10 · revisits ADR-0008

## Context

ADR-0008 took the tagline out of the Footer and left it as
`<meta name="description">` "and nothing else". That was right about the Footer
and wrong about the tagline: an Instance writes one line saying what the site
is, and no visitor ever sees it. The only reader is a search engine.

Putting it back in the Footer is not the answer — the Footer is the Instance's
own writing, and adding something the Instance did not put there is the thing
ADR-0008 decided against.

## Decision

The tagline sits in the top bar, beside the title, on every page. It is still
`<meta name="description">`; it is now also the second thing a reader sees.

A narrow screen drops it and keeps the navigation, because the navigation is the
routable surface and the tagline is a description. An Instance that declares no
tagline gets neither the top-bar line nor the description element.

## Consequences

- ADR-0008's decision stands untouched: the Footer is still Site Config's
  `footer` and only that, and the tagline is still not in it.
- The top bar is now every part of the Site Config that is the same on every
  page — title, tagline, Categories — which is a boundary that can be described
  in one sentence.
- One line of Site Config is one line on the page. A tagline long enough to
  crowd the navigation is truncated rather than allowed to wrap the bar.
