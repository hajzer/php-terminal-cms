# 14 — Migrations: `site/migrate`, and the Media move as the first

Status: done
Spec: ../spec.md
Blocked by: 06

## What

ADR-0027. `php site/migrate [--apply] [<site-dir>]` runs every Migration the
code carries over an Instance's `site/` — `site/migrations/0.3.0.php`, the
Media move of ADR-0024, then the standing `site.php` step — and reports what
it would do, or with `--apply` does it. Every action adds; nothing is removed.

## Scope

- **`site/migrate`.** PHP CLI only: any other SAPI is refused. The target is
  the argument, else the `site/` the runner sits in; a target with no
  `site.php` or no `content/` is refused. Loads `site/migrations/*.php`
  sorted by `version_compare`, then the standing step; each returns a list of
  actions from the target path and writes nothing. A bare run prints the list;
  `--apply` performs it in order and stops at the first failed write with a
  non-zero exit. A run with nothing left — notes only — exits 0.
- **The actions**, a closed set, refused otherwise:
  - `copy <from> <to>` — `<to>` must not exist; directories made as needed.
  - `insert <block>` into `site.php`, before its closing `];`.
  - `note <line>` — printed, never acted on.
- **`site/migrations/0.3.0.php`**, self-contained: it never loads `site/src`
  and reads `site.php` as data for `languages` and `lang` alone.
  - Every `.md` under `content/` at any depth, declared or not, Published or
    not.
  - Its Media path: the path under `content/` without `.md`, without a
    trailing `-<code>` that `languages` names; `index.md` included
    (`index`, `<category path>/index`).
  - Every Image Line whose src is not an absolute local path (0.2.0's
    `mediaUrl()` rule, copied): `?`/`#` and `./` stripped, backslashes as
    `/`, reduced to the basename.
  - A reduced name that is empty, `.`, `..` or starts with `.` → `note`, the
    Document and line.
  - Target `media/<path>/<name>` exists → nothing, or a `note` when its bytes
    differ from `media/<name>`.
  - Else `media/<name>` exists → `copy`. Else → `note`: a broken picture,
    with the Document and line.
  - After the plan: each flat `media/<name>` that was a source and that no
    `/media/<name>` string in `content/` or `site.php` names → `note`, unused,
    the operator's to delete.
- **The standing `site.php` step**, last, textual, from the runner's own
  `site.php.example`:
  - Each top-level key the example declares and `site.php` does not carry,
    live or commented → `insert` its doc comment and its lines from the
    example, every line commented with `// `.
  - Each live top-level key the example does not declare → `note`, "not read
    by this version — see CHANGELOG.md".
  - Keys are found with `token_get_all()`, at the returned array's top level
    only.
- **`bin/page-build`** runs the chain as a report before rendering; any
  pending `copy` or `insert` prints one line —
  `site/migrate has N step(s) to do — see docs/deploy.md` — and the build
  goes on.
- **`bin/test`** over `tests/fixtures/instance-0.2.0/`, copied to a temporary
  directory per run — see the spec's Testing §7.
- **`docs/deploy.md`** Upgrading: unpack, `php <release>/site/migrate
  <instance's site/>`, again with `--apply`, then rsync; the same for a
  downloaded copy and for a checkout. The hand recipe in "From 0.2.0" goes;
  the explanation of the layout stays.

## Out

Removing or overwriting anything. A version stamp. Running from a web
request. A Migration that loads `site/src`. Rewriting a Document's Lines.

## Acceptance

- [x] A bare run over the fixture lists exactly the expected actions and
  leaves the tree's hash unchanged
- [x] After `--apply`, a second run lists no `copy` and no `insert`
- [x] After `--apply`, the current Renderer resolves every Image Line in the
  fixture to a file that exists, except the one the fixture leaves broken
- [x] `require site.php` gives the same array before and after, and the file
  passes `php -l`
- [x] Every `$site['…']` key read in `site/src` is declared in
  `site.php.example`, live or commented
- [x] `site/migrations/0.3.0.php` is pinned by hash in `bin/test`
- [x] `bin/page-build` warns on a fixture with pending steps and builds
- [x] `site/migrate` refuses a non-CLI SAPI and a target without `site.php`
- [x] `docs/deploy.md` Upgrading uses `site/migrate`

## Comments
Done in `site/migrate` and `site/migrations/0.3.0.php`. A Migration file
returns a closure `fn (string $site): array` of actions, each
`['copy', from, to]`, `['insert', block]` or `['note', line]`, paths relative
to the Instance's `site/`. A bare run exits 2 while a `copy` or `insert` is
left — `bin/page-build` keys its warning on that and counts the report's
action lines. An insert block must be comments alone, or the runner refuses
it; a `site.php` whose last entry has no comma gets a note, since a key
switched on below it would not parse.

Left as the spec words it: a flat file counts as named when any text in
`content/` or `site.php` holds `/media/<name>`, so a src such as
`../media/shot.png` — which 0.3.0 reads as the Document's own `shot.png` —
keeps the "unused" note from appearing. It only ever withholds a note.
