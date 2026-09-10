# ADR-0008 — The Footer is Site Config, written like a Line

**Status**: accepted · 2026-09-10

## Context

Every public page ended with a footer the code wrote itself: the tagline on the
left, the Site title on the right. Neither was a choice an Instance had made —
the tagline exists for `<meta name="description">`, and the title was already on
the page twice, in the top bar and in `<title>`. An Instance that wanted the one
thing footers are actually for, a line of credits with a link or two in it,
could not have it without editing `Page.php`.

The first attempt at that was to put HTML in the tagline. It came out escaped on
the page, as it should — the renderer has no path from configuration to markup
any more than it has one from a document — and the title still sat beside it.

## Decision

`site.php` gains a `footer` key, and it is the whole footer. One string is one
line; a list is several, in order. Nothing is added around it, and an Instance
that declares none has no `<footer>` element at all.

Each line goes through `Renderer::inline()` — the same function that renders the
text of a Paragraph. So a footer may carry `[text](url)`, `**bold**`, `*italic*`
and `` `code` ``, and it is escaped and its links are allowlisted by exactly the
same code that escapes and allowlists a document's.

## Consequences

- The tagline is `<meta name="description">` and nothing else, which is what it
  was always for.
- A footer cannot introduce markup, a scheme or an origin that a document could
  not. There is one inline renderer on the public origin and one link allowlist,
  and the footer did not add a second of either.
- The one thing a footer cannot have is a construct that is not inline — no
  list, no table, no block. A footer that wants those wants a Document, and
  there is a way to link to one.
- Nothing in `content/` changed. The footer is configuration, not content,
  because it is the same on every page and belongs to the Instance.
