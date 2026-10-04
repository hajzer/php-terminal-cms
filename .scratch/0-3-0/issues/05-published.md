# 05 — Published, failing closed

Status: ready-for-agent
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

- [ ] `bin/test`: spec Testing §2 — one hidden fixture of each kind, absent
  from every reader; `flase`, `no`, `0`, `False` hide; absent and `true` publish
- [ ] `bin/test`: neither half prints `published`
- [ ] A hidden Language variant leaves the other Language's page without an
  indicator

## Comments
