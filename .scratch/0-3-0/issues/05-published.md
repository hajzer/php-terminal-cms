# 05 — Published, failing closed

Status: done
Spec: ../spec.md
Blocked by: 04

## What

ADR-0023. `published` in a Document's Meta or a Category's or Sub-category's
Site Config declaration; absent or `true` publishes, any other word hides.
Hidden is a 404 and named nowhere. Not printed under the title.

## Scope

- One predicate for a declaration (in `Site`) and one for a file (from
  `Document::peekMeta()`), and every reader of `content/` asks them:
  `Router::resolve()`, `Listing::variants()`/`group()`/`recent()`, the
  navigation, a Category page's Sub-category names, `Language::addresses()`,
  `bin/page-build`. (The Bundle, 08, asks them too.)
- A hidden Category behaves as undeclared, its Sub-categories with it.
- `Renderer::meta()` and `editor.js`'s `metaBar()` leave `published` out; the
  agreement test's sample gains `published: true`.
- `docs/format.md`, `docs/config.md`: the key, the rule, and that hidden is
  not secret.

## Out

Any Editor UI for it. An unlisted state.

## Acceptance

- [x] `bin/test`: spec Testing §2 — one hidden fixture of each kind, absent
  from every reader; `flase`, `no`, `0`, `False` hide; absent and `true` publish
- [x] `bin/test`: neither half prints `published`
- [x] A hidden Language variant leaves the other Language's page without an
  indicator

## Comments

Two gates carry it: `Site::categories()` drops a declaration that is not
Published, and `Listing::group()` drops a file that is not. Every reader —
the Router, the Listings, the navigation, the Sub-category names, the
Language indicator, the Page Build — already went through one of them, so
none of them changed. The Bundle (08) gets it the same way.

`Document::peekMeta()` now reads the frontmatter through `Markdown::parse()`
and to its end. Before, it split on `\n` alone and stopped after 50 lines, so
a `published: false` in a file written with bare `\r`, or past the fiftieth
line, would have been missed and the draft published. `bin/test` has both.

Only the value fails closed. A misspelt key (`Published:`) is another Meta
line, and the Document is Published; `docs/format.md` says so. A Sub-category
that is not Published no longer shadows its parent's Document of the same
name, which is then read and listed again; `docs/config.md` says so.

The third acceptance item is in the fixture (`notes/both-sk.md`), asserted
on the page and in the Listing.
