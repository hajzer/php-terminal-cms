# 09 — Bundles in a Page Build

Status: done
Spec: ../spec.md
Blocked by: 08

## What

`bin/page-build` writes every offered Bundle at the address the request-time
site answers it at, byte for byte the same.

## Scope

- `bin/page-build`: `<cat>[/<sub>]/<slug>.zip` and `<cat>[/<sub>].zip` beside
  the pages, through the same `Bundle` and `Zip`.
- The parity test: request-time bytes and built bytes equal for one Document
  and one Category Bundle.
- `docs/deploy.md`'s Page Build section names the files.

## Acceptance

- [x] `bin/test`: parity for a Document and a Category Bundle
- [x] `bin/test`: no `.zip` for a hidden or `bundle: false` page in the output
- [x] A built site served by `python3 -m http.server` downloads a Bundle

## Comments

From 08: built pages already carry `↓ bundle` links. `bin/test`'s two
page-build address checks (with and without `--base-url`) skip `.zip`
addresses until the build writes them, and both skips come out here. The
route is `$router->route($address . '.zip')`, whose result carries a
`bundle` key when one is offered. Each Language's address of a Document
answers the same bytes, so a Document in two Languages is two equal files.

`write()` in `bin/page-build` takes a page's HTML or a `Bundle`; the Bundle is
`$router->route($address . '.zip')['bundle']` for every address the build
writes, so the Router alone decides which pages offer one. Checked by hand:
`python3 -m http.server` over a build sends `guides.zip` as
`application/zip`, and the download is the built file byte for byte.

Open: a static host sends no `Content-Disposition`, so the browser names the
download after the address — `guides/hosting.zip` saves as `hosting.zip`, and
`what-it-is-sk.zip` as itself, where `index.php` says `guides-hosting.zip` and
`what-it-is.zip`. The bytes are the same. A `download="<top>.zip"` on the
`↓ bundle` link would make the names agree too (a change to the page markup,
so to the pinned hashes); `docs/deploy.md` says how they differ until then.
