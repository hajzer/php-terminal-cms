# 01 — The `mermaid` Dialect

Status: done
Spec: ../spec.md

## What

`mermaid` becomes the fifty-ninth Code Dialect, so a ```` ```mermaid ```` fence
reads back as a Code Run the Editor offers, `Tab` reaches, and both tokenizers
colour. Nothing is drawn yet — that is 05 and 06. This is the Dialect a Diagram
is made of.

The importers already turn ```` ```mermaid ```` into Code Lines with Dialect
`mermaid`, and the exporter already writes it back. What is missing is the
Dialect being one this software knows.

## Scope

- An entry in `shared/langs.json`: `%%` comments, strings, the diagram kinds
  and structural words listed in the spec's *The Dialect* section as keywords.
  One Line at a time, no `~`, per the file's own `_comment`.
- `mermaid` in `editor/editor.js`'s `TYPES` Code Dialects, so `Tab` cycles to
  it.
- `php bin/build` regenerates `editor/langs.js` and `site/shared/langs.json`.
- A Diagram in the sample `bin/test` round-trips and compares, so the three
  implementations are held to agreeing about it (ADR-0003).

## Out

Drawing. A Type, a key or an overlay of its own. Any change to `parse()`,
`fenceToLines()` or `toMarkdown()`.

## Acceptance

- [x] `mermaid` is in `shared/langs.json` and in `TYPES`' Code Dialects
- [x] `node tests/js-model.js`: `Tab` on a Code Line reaches `mermaid`
- [x] `tests/js-tables.js`: the JS and PHP tables agree for `mermaid`
- [x] a ```` ```mermaid ```` sample round-trips byte for byte, and the JS and
  PHP renderers emit the same code block for it
- [x] `editor/langs.js` and `site/shared/langs.json` regenerated, not edited
- [x] `php bin/test` green
