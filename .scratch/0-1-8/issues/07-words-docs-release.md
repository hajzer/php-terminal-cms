# 07 — Words, docs, ADR and the version

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06
Commit: 5 of 5 — "0.1.8"

## CONTEXT.md

Link, Wording and Href landed with commit 1 — the model half needed the words
before it could name anything. They are already in the glossary; do not write
them again, and do not drift from them.

Two new terms. It stays a glossary — no implementation detail.

- **Cell** — one of the `|`-separated parts of a Table Line.
  _Avoid_: field, box, entry.
- **Column** — the nth Cell of every Line in a Table Run. Derived when asked,
  never stored: adding one rewrites every Line in the Run, and there is no Table
  object for it to belong to. The only structure in the model that spans Lines
  and is not a Run. _Avoid_: field, axis.

Two entries reworded.

- **Editor** — "has no server" becomes the claim that is actually true and
  actually matters: it never sends a Document anywhere, and the one thing it
  fetches is an image a Line names, to show it in the preview.
- **Site Config** — the list of what it holds gains the three new settings.

## docs/adr/0015-tables-are-lines-not-a-grid.md

Context / Decision / Consequences, in the house format. A future reader will
ask why there is no Table object, and the answer is a trade-off made against a
grid editing mode: h/j/k/l between Cells and a current-Cell cursor would be a
second editing model inside an Editor whose premise is that the cursor is on a
Line. Record what a derived Column costs (every operation rewrites the Run,
short rows get padded) and what it buys (one model, reordering a row is
reordering a Line, undo needs nothing new).

## The rest of the documentation

- **`docs/keymap.md`** — `a` in the Styles/Blocks tables, `Tab`/`Shift-Tab`
  while editing a Table Line, and `:col`, `:link`, `:img` in the command tables.
  The Editor's `?` overlay generates its command table from the list that runs
  the commands, so only the key table is hand-written.
- **`docs/config.md`** — `listing_max`, `link_open` and `logo` in the key table
  and as prose sections; the example block at the top grown to match
  `site/site.php.example`.
- **`docs/security.md`** — a paragraph under the editor section: previewing an
  Image Line fetches that image, so an author who writes an `https://` src is
  telling their own browser to contact that host. The Document itself still goes
  nowhere.
- **`editor/ui.js`** header comment — "Talks to no server, ever" reworded to
  match the CONTEXT.md wording above. Comments describe the system, not the
  history of deciding it, and a source file does not point at an ADR number.
- **`README.md`** and **`CHANGELOG.md`** — the release.

## The version

`VERSION` → `0.1.8`, and the `<i class="ver">` in `editor/index.html` with it.
`bin/test` fails if the two disagree.

`bin/manifest.php` needs no change: every file touched sits inside a directory
it already ships whole, and `.scratch/` is already listed as tracked and never
shipped.

## Acceptance

- [ ] `php bin/test` green, including the version check and the derived-files check
- [ ] No generated file edited by hand
- [ ] Five local commits on `main`, nothing pushed
- [ ] **Stop here.** `bin/package` is not run and nothing reaches the public
  repository until the maintainer has opened `tests/editor-probe.html` in a
  browser and reviewed the pages themselves.
