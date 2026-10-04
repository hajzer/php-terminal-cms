# 12 — The sixth review: what 0.3.0 adds

Status: done
Spec: ../spec.md
Blocked by: 04, 05, 06, 07, 08, 09, 10, 14

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
- **The runner writes into an Instance.** That every `copy` target resolves
  inside `media/` — the dot-name rule, a symlink in `media/` or `content/`, a
  Document path no Site Config declared; that `site.php` is only ever
  inserted into before its final `];`, whatever the operator's file looks
  like; that `site/migrate` refuses any SAPI but the CLI, and that nothing in
  `public/` can reach it.
- A finding is fixed here or becomes its own issue; `## Residual risks` and
  `## Validation` updated in place.

## Acceptance

- [x] `## 0.3.0 — sixth review` in `docs/security-audit.md`
- [x] Every finding fixed or ticketed

## Comments

Done. Three findings, all low, all fixed here, none ticketed:

- A Document named as a directory beside it that is not Published or not
  declared took that directory's Documents' Media into its Bundle and its
  Category's. `Bundle::take()` now takes the files of such a Media directory
  and none of its directories.
- A link under `media/` led the runner's copies out of the Instance.
  `strays()` in `site/migrate` holds a copy to the directory its two paths
  share, with links followed, and refuses the run before anything is written.
- A Diagram saved as SVG fetched, when opened as a file, what the page's
  policy had refused. `drawing()` in `Page.php` now writes the copy without
  anything that runs or names an address, bar a link. The two pinned pages
  with a picture, `/` and `/about/everything-is-a-line`, are re-recorded.

Hardening beside them: a Bundle follows no link inside `content/` or `media/`;
a `site.php` that is a link stays one; an address with a NUL is a 404 under
`php -S`; `bin/test` fails if the site lists a directory anywhere but
`Listing::documents()` and `Bundle::tree()`. 1077 assertions before, 1091
after; the probe 301 green in headless Chromium 153 and Firefox 155.

The 0.3.0 Migration is untouched, so its pinned hash stands.

Choices to look at:
- A Document that is a link is still served as a page and still offers
  `↓ bundle`; the Bundle is then the Editor and a README.
- The runner refuses the whole run, a bare report included, when a copy would
  leave `media/` through a link — `bin/page-build` then prints the reason as
  "could not read the Instance" and builds on.
- The saved SVG drops `set` and `animate…` elements and any attribute with a
  `url()` that is not `#…`. The sample Diagram saves to the same pixels as
  before in both browsers; a Diagram type that leans on SMIL would lose its
  animation in the saved file only.
- Nothing here was run by hand in a real browser: the browser checks were
  scripted runs in the two headless ones.

