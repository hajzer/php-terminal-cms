# 09 — Bundles in a Page Build

Status: ready-for-agent
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

- [ ] `bin/test`: parity for a Document and a Category Bundle
- [ ] `bin/test`: no `.zip` for a hidden or `bundle: false` page in the output
- [ ] A built site served by `python3 -m http.server` downloads a Bundle

## Comments
