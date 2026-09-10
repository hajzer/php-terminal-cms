# 0001 — Static output, editor on a separate origin

Date: 2026-09-09
Status: superseded by [ADR-0002](0002-request-time-rendering.md)

> **Superseded.** Clause 1 (static public site) was reversed on 2026-09-09: the
> public site renders at request time instead. Clauses 2 and 3 — static editor on
> a separate origin, joined by a file copy — survive unchanged and are restated in
> ADR-0002. Kept for the reasoning, which is still the reasoning.

## Context

linuxor.sk publishes technical notes. The current implementation is
Minimal-PHP-Markdown-CMS: PHP renders markdown from `content/` on every request.
The replacement is a line-based editor whose philosophy is *everything is a line*.

The stated goal for the replacement is that the system should have essentially
no attack surface.

## Decision

Split the system at the file boundary.

1. **The public site is static.** Markdown is rendered to HTML ahead of time and
   deployed as plain files. The public origin runs no application code, holds no
   database, accepts no input, and has no authenticated route.
2. **The editor is a separate origin** (`editor.linuxor.sk`) and is itself a
   static page — HTML, CSS and one JavaScript file. It has no backend, no API,
   no session, and no server-side state. It reads and writes nothing but the
   document held in the browser tab and a theme flag in `localStorage`.
3. **The two are joined by a file copy, not by a network call.** The editor's
   only output is a standard CommonMark document. The author moves it with a
   tool they already trust — `git push`, `rsync`, `scp`, WinSCP — over a channel
   that already has its own authentication.

## Consequences

- There is no login form, no upload endpoint, no comment box, no admin path and
  no write path from the internet to the content. Compromising the published
  site requires compromising the transport credentials or the host itself.
- `editor.linuxor.sk` can be taken further: served with a restrictive CSP, put
  behind basic auth or a VPN, or not published at all and opened from `file://`.
  Nothing in the editor depends on being served over HTTP.
- The exported file is ordinary markdown, so it stays readable and portable if
  this editor is abandoned. The line model is a lens over CommonMark, not a
  storage format — see [CONTEXT.md](../../CONTEXT.md) if/when it exists.
- The cost is that publishing is a manual step, and there is no
  edit-from-anywhere. That is the trade being bought deliberately.
- Collapsed command output is exported as a `<details>` block, which is inert
  HTML in markdown — no script, no interactivity beyond the browser's own
  disclosure widget.

## Alternatives rejected

- **PHP rendering at request time** (today's setup) — keeps a code path exposed
  on the public origin for no benefit, since the content changes only when the
  author changes it.
- **Editor with a save endpoint** — reintroduces authentication, and with it the
  entire class of problem this decision exists to remove.
