# 06 — A Document's own Media, on the page and in the preview

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 04

## What

ADR-0024. A bare file name in an Image Line names a file in
`site/public/media/<category path>/<base>/`; an absolute path names that path.
The Renderer and the Editor resolve it the same way; the Editor looks once
more without a trailing `-xx` when a picture fails to load.

## Scope

- `Renderer::mediaUrl()` takes the Document's Media directory; the basename
  reduction is unchanged; the logo calls it without one and stays flat.
  `Document::html()` passes the path through, `index.md` as `index`.
- `editor/editor.js`: the Image's src resolved to
  `../site/public/media/<category>/<Name without .md>/<file>` from the
  `category` Meta and the Name; `editor/ui.js`'s image `error` handler retries
  once with a trailing `-[a-z]{2}` taken off the directory before showing the box.
- `bin/test`: the two halves resolve the same table of srcs to the same
  Media-relative path (spec Testing §3).
- `tests/editor-probe.html`: a bare-name picture under `category: about`
  loads from a fixture file.
- `docs/format.md`, `docs/deploy.md`: the layout, and the migration —
  `mkdir -p site/public/media/<path>/<base>` and move each bare-named file.
- The repository's own content keeps its absolute srcs.

## Out

A fallback to flat `media/` on the site. Any upload of Media.

## Acceptance

- [ ] `bin/test`: spec Testing §3, both halves, including `./`, `../`,
  backslash and absolute srcs, and the logo unchanged
- [ ] `tests/js-model.js`: the Editor's resolution table
- [ ] Probe green in Chromium and Firefox with the new case
- [ ] `docs/deploy.md` carries the migration

## Comments
