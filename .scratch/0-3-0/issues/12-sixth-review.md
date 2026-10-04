# 12 — The sixth review: what 0.3.0 adds

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 04, 05, 06, 07, 08, 09, 10

## What

One security review of 0.3.0's new surface, in the shape of the five before
it, appended to `docs/security-audit.md` as `## 0.3.0 — sixth review`.

## Scope

- **Three segments.** That no request segment becomes a path at any depth,
  and the `.zip` suffix is stripped before comparison, never after.
- **The Bundle's reads.** Every file a Bundle reads comes from Site Config,
  `scandir()` or `site/editor/`; no symlink in `content/` or `media/` takes it
  outside; a Bundle never contains `site.php`, `src/` or a hidden Document.
- **Published.** That every reader of `content/` asks the predicate, and what
  the suite would notice if one stopped.
- **Media.** The reduction in both halves; the Editor's retry.
- **Full View.** Blob downloads, the serialised SVG, and that a Diagram from
  somebody else cannot use the save to put script in a file the reader opens.
- **`site/editor/` inside an Instance**, above the document root.
- A finding is fixed here or becomes its own issue; `## Residual risks` and
  `## Validation` updated in place.

## Acceptance

- [ ] `## 0.3.0 — sixth review` in `docs/security-audit.md`
- [ ] Every finding fixed or ticketed

## Comments
