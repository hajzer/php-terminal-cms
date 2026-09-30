# 10 — The fourth review, and a code read

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09

## What

One security review of the surface this release adds, in the shape of the
first three, appended to `docs/security-audit.md` as `## 0.2.0 — fourth
review`. A code read beside it, against the same surface, for correctness and
drift rather than exposure.

## Scope

- **Mermaid.** The pinned version's advisories. `securityLevel: 'strict'` and
  what it disables. The placement: that no `style` attribute survives, that the
  only `<style>` added carries the nonce, that the script it loads carries it.
  That a Diagram's source reaches `render()` as text and never as markup. What
  the Editor's network claim now covers, and that the vendored file is the one
  unscanned script.
- **Paste.** That clipboard `text/plain` goes through `parse()` and nothing
  else, and that no pasted byte reaches the DOM except as a Line's text.
- **The Base Path.** Where it enters the Renderer; that a Href or src is
  prefixed only when it starts with `/`, and that the allowlist still judges
  what the author wrote, not the prefixed result. That no request-time path
  can set it.
- **The Page Build's writes.** The first time code that renders the site writes
  a file. The refusals, the swap, the marker, symlinks under `content/` and
  under the output, an output given as a relative path, and what a failure
  mid-swap leaves.
- **The built policy.** The `<meta>` policy's reach, the nonce's lifetime, and
  `frame-ancestors`' absence, written down as residual risk.
- **The code read**: drift between the three implementations over the Dialect;
  the raw face and `toMarkdown` agreeing; documentation that no longer matches
  the code.
- A security finding is fixed in this release or becomes its own issue with the
  reason it waits. A code-read finding becomes an issue unless it is small
  enough to fix where found.
- Severity in the words the earlier reviews used; `## Residual risks` and
  `## Validation` updated in place.

## Acceptance

- [ ] `## 0.2.0 — fourth review` appended, with scope, severity table, what was
  looked at and left alone, and hardening
- [ ] every finding fixed or filed, none recorded and left
- [ ] the by-hand checks from 05, 06, 07 and 08 re-run on the final tree
- [ ] `php bin/test` green
