# ADR-0013 — The two inline points on a page name a nonce

**Status**: accepted · 2026-09-10

## Context

A published page carries two things the browser must be allowed to execute:
about fifty lines of enhancement script, and one `<style>` block holding the
accent colour from Site Config. Both are inline because there is no third-party
origin to trust and no build step to produce a file — which is the whole point
of ADR-0002.

The Content-Security-Policy therefore said `script-src 'unsafe-inline'`. That
is the weakest directive there is: it permits any script the page contains,
including one that arrived in a document. Nothing has ever arrived that way —
the Renderer cannot express raw HTML (ADR-0003) — but a policy that says "any
inline script is fine" is not a second line of defence, it is a note saying
there is only one.

## Decision

The entry point generates sixteen random bytes per request and sends them as a
nonce in `script-src` and `style-src`. The Page shell puts the same nonce on
the script and on the style block, and on nothing else. A page rendered without
one gets neither attribute, so a caller with no policy to satisfy is not
holding a broken page.

Nothing else on a page may run: no `<script src>`, no event-handler attribute,
no `style` attribute. There is nowhere in the Renderer that could emit one, and
now nowhere the browser would honour it either.

The script stays a nowdoc. Interpolating the nonce into the script's own text
would mean PHP reads the JavaScript — where `$` starts a variable and `\` an
escape — so the nonce is concatenated onto the opening tag instead.

## Consequences

- An escaping regression in the Renderer is contained by the browser as well as
  by the code: injected inline script has no nonce and does not run.
- The accent has to be six hex digits. It is the one Site Config value that
  reaches the page as CSS rather than as text, a nonce does not make CSS safe,
  and HTML escaping is not CSS validation.
- Pages cannot be cached by a proxy that would serve one visitor's nonce to
  another. Request-time rendering already ruled out that kind of cache.
- An Instance that wants no script at all deletes `enhancement()` and sends
  `script-src 'none'`.

## Rejected

**Move the script to a file and use `script-src 'self'`.** One more request per
page, a cache to invalidate on upgrade, and the editor half already proves the
project can ship JavaScript as files — but the page would stop being complete
in one response, which is what makes a document readable with the script
blocked.

**Hashes instead of a nonce.** Static, no per-request work, and they would have
to be recomputed and committed every time the script or the accent changed. The
accent comes from Site Config, so its hash differs per Instance.

**Leave `unsafe-inline` and rely on the Renderer.** The Renderer is the reason
nothing has got through. It is not a reason to decline a second boundary that
costs sixteen bytes.
