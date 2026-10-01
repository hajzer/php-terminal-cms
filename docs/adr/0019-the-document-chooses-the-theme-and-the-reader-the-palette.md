# ADR-0019 — The Document chooses the Theme and the reader the Palette

**Status**: accepted · 2026-10-01 · amends ADR-0011, ADR-0013

## Context

With twelve Themes (ADR-0018), each in two Palettes, four parties could have a
say in how a page is drawn: the reader, with the toggle the page already has;
the Document, through its Meta; the Instance, through Site Config; and the
software, with a default. Before 0.2.0 the only choices were the reader's
light-or-dark toggle and one `accent` colour in Site Config, which reached the
page as the one inline `<style>` block — the reason `style-src` carries a
nonce at all (ADR-0013).

## Decision

The two axes are decided by different parties, in a fixed order each.

- **Theme**: the Document's `theme:` Meta, else Site Config's `theme`, else
  Baseline. The reader has no Theme control. A Theme is part of a publication's
  identity, like its logo: the operator's to set and the author's to pin for
  one piece.
- **Palette**: the reader's stored toggle, else the Document's `palette:` Meta,
  else Site Config's `palette`, else the browser's colour-scheme preference. A
  Palette is reading comfort, and the reader's choice beats every other party
  the moment it is made. What a Document or an Instance says about it is only
  how a page opens for a reader who has never chosen.
- **A name that is none of the twelve, or a word that is neither `light` nor
  `dark`, is not a choice.** The next party decides, silently, in Meta and in
  Site Config alike — the rule `accent`, `favicon` and the Category list
  already follow. A public page never fails to render over a spelling.
- **`theme:` prints under the title; `palette:` does not.** ADR-0011 prints
  every Meta but `title`, because the title is already on the page as the
  heading. `palette` joins `title` as the second exception: the reader can
  flip it at any time, so the page is not showing what the Document said but
  what the reader chose, and printing the Document's word would be printing
  something the page may not be doing.
- **`accent` is retired.** A Theme owns its colours, in both Palettes. Site
  Config gains `theme` and `palette` and loses `accent`; a `site.php` that
  still names one is ignored. With it goes the inline style block. The nonce
  stays on `style-src` for the stylesheet a Diagram places (ADR-0016).

## Consequences

- An author's pin is strong on the Theme axis and weak on the Palette axis,
  by design: a Document that says `palette: dark` opens dark for a first-time
  reader and does nothing for one who flipped to light on some other page of
  the same Instance.
- The public page keeps the one button it has; it flips the Palette. A page
  needs only its own Theme's stylesheet, which is what lets a Page Build and
  the policy stay as they are.
- The Editor cannot know the Instance's Theme (ADR-0006), so its switcher is
  the writer's own preference and its preview follows the Document's pin where
  there is one. Writing `theme: things` is writing a Meta Line, as writing
  `category:` is.
- The `palette` exception lives in three implementations and the agreement
  test, exactly as the `title` one does.
- An Instance that wanted one brand colour over a designed palette has no
  setting for it any more. It picks the Theme that has the colour.

## Rejected

**A Theme switcher for the reader.** Every page would carry all twelve
stylesheets, and `theme:` in Meta would mean nothing once any reader had
flipped anything.

**Meta pins both and the reader's toggle goes away on a pinned page.** A
control that vanishes reads as breakage.

**`accent` as an override on top of a Theme.** One configured colour over
twelve designed pairs clashes with most and is unreadable in one Palette of
many, which is a fault the single `accent` already had.
