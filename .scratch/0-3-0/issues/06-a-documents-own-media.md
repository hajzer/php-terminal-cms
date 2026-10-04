# 06 — A Document's own Media, on the page and in the preview

Status: done
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

- [x] `bin/test`: spec Testing §3, both halves, including `./`, `../`,
  backslash and absolute srcs, and the logo unchanged
- [x] `tests/js-model.js`: the Editor's resolution table
- [x] Probe green in Chromium and Firefox with the new case
- [x] `docs/deploy.md` carries the migration

## Comments

The Editor applies the Renderer's whole reduction, not only the bare-name
part: an `https://` or `//host` src is a file name in the Media in the
preview as it is on the page, so the preview no longer shows a remote picture
the page never would. `docs/security.md` says so; the release notes (13)
need a line for it. The Editor's `img-src https: http: data:` is now wider
than anything an Image Line reaches — for the sixth review (12).

For the sixth review too: a src of `..` (or `x/..`) reduces to the "file"
`..` and comes out as `/media/<path>/..` — inside `media/`, but not a file
in the Document's directory. It was `/media/..` before this issue.

The second look strips exactly `-[a-z]{2}`, as the spec says; a Language
with three letters or a region (`-ast`, `-pt-br`) gets no second look in
the preview.

The probe's fixture is `site/public/media/about/editor-probe/probe.svg`.
The Editor resolves from `../site/public/media/`, so it can live nowhere
else, and it ships with `site/` in a release; the probe in a release needs
it.

`Document::load()` takes the base Name the Router resolved, which
`Document::media()` joins to the Category path.
