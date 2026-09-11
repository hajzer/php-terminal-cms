# 05 — listing_max, link_open and logo

Status: done
Spec: ../spec.md
Commit: 3 of 5 — "site: link_open, listing_max, logo"

## What

Three new keys in Site Config. Every one is read through `Site`, which is the
one place a malformed config value becomes a usable one — follow the shape of
`Site::accent()` and `Site::lists()`.

## `listing_max`

The number of documents in the homepage Listing, replacing the hardcoded `15`
that currently lives as a default parameter on `Listing::recent()`.

| value | prints |
| --- | --- |
| a whole number ≥ 1 | that many |
| `0` | every document |
| absent | fifteen |
| `-3`, `'ten'`, `2.5`, `null` | fifteen — not a count |

Category listings are **untouched and stay uncapped**. `listing_max` has no
effect when `listing` is `false`, because there is no list.

## `link_open`

`'here'` (default) or `'tab'`. Anything else is `'here'`.

`'tab'` adds `target="_blank"` to links whose href matched `https?://` —
exactly the set that already receives `rel="noopener noreferrer"`, so the guard
that target needs is already there. A local absolute path, a fragment and a
`mailto:` never receive a target, whatever the setting.

`Renderer::inline()` gains an **optional second argument defaulting to
`'here'`**, so its one-argument call is byte-for-byte what it is today and
`tests/js-inline.js` needs no change. Thread the mode through every call site
**including `Page::footer()`** — a footer that disagrees with the body is the
likely bug here.

**The Editor is never told `link_open`.** It has no configuration and gains
none; its preview is always the `'here'` rendering.

## `logo`

`'logo' => '/media/logo.svg'` renders an `<img>` inside the existing `.brand`
anchor, before the title text, with `title` as its `alt`. The src goes through
the same reduction an Image Line's src already gets, so anything that is not a
safe local path becomes a file under the media directory. Height is capped in
CSS to the top bar's line.

`title` is **not** touched — it stays a plain string filling `<title>`, the
brand text, the homepage `<h1>` and the page-title suffix comparison at
`Page::html`. Absent or empty `logo` → markup byte-identical to today's.

## Also

`site/site.php.example` and the example block in `docs/config.md` grow all three
keys with their explanatory comments — `site.php.example` is the file a new
Instance copies. Prose sections for each in `docs/config.md`.

## Acceptance

New assertions in `bin/test`, at the seam `Page::html($site, $router->route($p))`
— prior art: the `listings`, `the page shell` and `footer` sections, which
already build Routers from hand-written config arrays.

- [x] `listing_max`: a small number prints that many; `0` prints all; absent prints
  fifteen; `-3`, `'ten'`, `2.5` each print fifteen; a Category page prints its
  whole Category whatever `listing_max` says; `listing => false` with a
  `listing_max` prints no list
- [x] `link_open`: with `'tab'`, an external body link carries `target="_blank"`
  and a local one does not, and a footer link behaves the same as a body link;
  with `'here'`, absent, and an unrecognised value, no page contains `target=`
- [x] `logo`: the brand anchor contains an `img` whose alt is the title and whose
  src is under the media directory; an unsafe path is reduced; no logo → the
  shell is unchanged

And at `Renderer::inline($s, $mode)` — prior art: the `link targets` section —
for the exact bytes: which hrefs get `target="_blank"`, that `rel` is still
emitted alongside it, and that the one-argument call is what it is today.

- [x] `php bin/test` green
- [x] `tests/js-inline.js` unchanged
