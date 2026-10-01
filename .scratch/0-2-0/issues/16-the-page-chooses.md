# 16 — The page chooses: Meta, Site Config, and the end of `accent`

Status: done
Spec: ../spec.md
Blocked by: 14

## What

The public page is drawn in the Theme and opens in the Palette that ADR-0019
says it should: the Document's `theme:` and `palette:` Meta, else Site
Config's `theme` and `palette`, else Baseline and the browser. `accent` is
retired and the one inline `<style>` with it. `palette` joins `title` as a
Meta the page does not print.

## Scope

- **`Site::theme()`** returns the configured name if a file
  `site/public/themes/<name>.css` exists for a slug-shaped name, else
  `baseline`; **`Site::palette()`** returns `light`, `dark` or `''`. The
  Document's `theme` and `palette` Meta are read by the same two validations.
  One function resolves each chain — Meta, Site Config, default — and is
  unit-tested for its order and for every fall-through; `Page::html()` calls
  it and does nothing else about it.
- **`Page::html()`** writes `data-theme="<name>"` always and
  `data-palette="<word>"` only when the chain decided one, links
  `themes/<name>.css` through the Base Path, and writes no `<style>`. The
  enhancement script needs no change: it already reads `data-palette` from
  14. A 404 and a Category with no `index.md` have no Document and take Site
  Config's.
- **`accent`**: `Site::accent()`, `Site::ACCENT`, the `<style>` line,
  `nonceAttr` on it, the `accent` entry in `site.php.example`, the *The
  accent* section of `docs/config.md`, and the accent sentences in
  `docs/security.md` and `docs/security-audit.md`'s running text (the audit
  table's history rows stay as history). An `accent` key left in a
  `site.php` is ignored like any unknown key, and `docs/config.md` says so
  in one sentence under the new `theme` and `palette` entries.
- **Site Config docs**: `theme` and `palette` in `site.php.example` and
  `docs/config.md`'s table, the *Themes* section rewritten — twelve, two
  Palettes, the chain, pointing at `docs/themes.md`.
- **The Meta line**: `Renderer::meta()` leaves `palette` out beside `title`;
  the agreement test's sample gains `theme:` and `palette:` Meta Lines, and
  17 does the same in `metaBar()` — until 17 lands the agreement test's
  sample may hold only `theme:`, and this issue's comment says so.
- **`bin/test`**: spec §6's page bullets in full; the shell hashes re-pinned
  with a comment; the `nonce=` count on a page without a Diagram goes from
  two to one; the Page Build parity test and the `/proj/themes/<name>.css`
  existence check.
- **`docs/format.md`**: `theme` and `palette` among the Meta the system
  reads, with the two rules — the names, the fall-through, and that
  `palette` is not printed.
- **`docs/security.md`**: the accent paragraph goes; the sentence about the
  nonce now names the Diagram's placed stylesheet as the only `<style>` the
  nonce is for. *The one script on the page* says `data-palette`.

## Out

The Editor's switchers, Legend and `Tab`. The ports.

## Acceptance

- [x] `bin/test`: every page bullet in spec §6 — Meta wins over Site Config,
  Site Config over `baseline`, an unknown name falls through at each step,
  `palette` reaches the attribute or is absent, `accent` changes no byte, no
  `<style` in the shell, the 404 takes Site Config's, a build prefixes the
  Theme link and ships the file
- [x] `bin/test`: the chain resolver's unit tests, one per fall-through
- [x] `bin/test`: `Renderer::meta()` prints `theme` and not `palette`
- [x] `bin/test`: no `Site::accent`, no `ACCENT`, and one `nonce=` on a page
  without a Diagram
- [x] `docs/config.md`, `docs/format.md`, `docs/security.md`,
  `site.php.example` say what this issue made true, and nothing in `docs/`
  still says `accent` is a setting
- [x] `php bin/test` green, no generated file edited
