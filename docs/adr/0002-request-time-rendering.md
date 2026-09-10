# Request-time PHP for the public site, static editor with no write path

Status: accepted
Date: 2026-09-09

The public site renders markdown to HTML in PHP on each request, rather than
being generated to static files ahead of time ([ADR-0001](0001-static-output-and-separate-editor.md),
now superseded). Publishing is then "copy the `.md` into `content/` and it is
live" — no build step to run, forget, or get wrong from a phone.

The editor keeps the property that mattered most: it is a **static page with no
server routes at all**. It holds one document in the browser tab, imports
markdown by drag-and-drop, and emits it by download. The author moves the file
with git, rsync or WinSCP — a channel that already has its own authentication.

## Consequences

- The public origin is not inert. Apache, the PHP runtime and our own renderer
  in `site/src/` are reachable from the internet. What does *not* exist: any
  database, login, session, cookie, form, upload, write path, third-party library
  or line of JavaScript. The surface is minimal, fully auditable and read-only.
  See [docs/security.md](../security.md).
- The renderer runs on every page view, so it must stay small and allocation-light.
  No caching layer initially; add one when measured, not before.
- Because nothing on the internet can write to `content/`, a compromise of the
  web tier cannot alter published content without also compromising the host.

## Rejected

- **Editor with a save endpoint** — removes the manual transfer step, and with it
  reintroduces authentication, sessions, CSRF and path validation: the entire
  class of problem this design exists to avoid.
- **htmx and Alpine** — both were in the original brief. With no server endpoints
  in the editor and no dynamic content on the public page, neither had a job.
  Dropping them keeps third-party runtime dependencies at zero and the public
  page at zero bytes of JavaScript.
