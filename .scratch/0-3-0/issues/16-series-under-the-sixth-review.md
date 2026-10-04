# 16 — Series under the sixth review

Status: done
Spec: ../spec.md
Blocked by: 12, 15

## What

The sixth review closed before Series landed, so `## 0.3.0 — sixth review`
in `docs/security-audit.md` describes a 0.3.0 without them. One read of what
issue 15 changed — `Site`, `Listing`, the Router's Category page and
`bin/page-build` — in the shape of that review, appended to its section.

## Scope

- **Published.** `Listing::series()` and the Page Build's own look for a
  Series' `index.md` are new readers of `content/`: that each has no way to
  a file name but `Listing::documents()`, and what the suite would notice if
  one found another.
- **The row.** What it prints and where it leads, from Meta and Site Config
  an operator may have written badly; a Series that is not Published, or
  whose Category is not.
- **A Series with no Published `index.md`.** That what still answers — its
  page, its Parts, its Bundle and its parent's — is what the docs say
  answers.
- **Page Build.** That the addresses it adds for a Series' `index.md` are
  ones the request-time site answers with the same page, and none that it
  does not.
- **Site Config.** `series` in every shape that is not `true`, and on every
  entry that is not a top-level Category.
- A finding is fixed here or becomes its own issue; `## Residual risks` and
  `## Validation` updated in place.

## Acceptance

- [x] Series are in `## 0.3.0 — sixth review` of `docs/security-audit.md`
- [x] Every finding fixed or ticketed
- [x] `php bin/test` green

## Comments
Done. No finding, so nothing fixed and nothing ticketed; `### Series, read
after` closes the sixth review's section.

- Read: what issue 15 changed in `Site`, `Listing`, the Router's Category
  page and `bin/page-build`.
- Tried, on a scratch Instance of eleven declared Series: 41 addresses, every
  row of nine pages, and the 19 Bundles of a Page Build of it. Nothing that
  is not Published is in a row, a Language indicator, a page or a Bundle.
- Tried, in copies of the tree: five broken rules. Four failed the suite. A
  Page Build that names a Series' `index.md` without asking Published failed
  nothing — it fails closed, the build stops on the 404, but the suite did
  not hold it.

Hardening: the Series fixture in `bin/test` gains an `index-sk.md` that is
not Published beside a Published `index.md`, and two assertions. 1113
before, 1115 after. `docs/config.md` says how a Series is taken off the
site, `## Residual risks` says the same, `## Validation` and `CHANGELOG.md`
carry the read.

Choices to look at:
- A Series whose `index.md` is not Published is still on the site, Parts and
  Bundles and a Page Build of them. ADR-0028 decided it and the docs say it;
  it is recorded as a residual risk and not changed.
- The Editor is untouched, so the probe was not run.
- Nothing was run in a browser: a Series adds no markup a page did not
  already print.
