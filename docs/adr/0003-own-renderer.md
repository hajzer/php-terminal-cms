# Our own line renderer instead of a markdown library

Status: accepted
Date: 2026-09-09

`content/*.md` is not arbitrary markdown — it is produced by our editor from a
closed set of fourteen line types. So the site parses that subset itself in ~150
lines of PHP rather than vendoring Parsedown or a CommonMark implementation.

The security property is the point: the renderer never passes file bytes into its
output. It matches a line to a type and then emits tags it chose itself, with the
text escaped. Raw HTML in a document is not "sanitised", it is **unrepresentable**
— which is why the export format uses a ```` ```output ```` fence rather than the
`<details>` element it originally used.

## Consequences

- Zero dependencies, and no CVE feed to track for the one library that would
  otherwise sit on the public origin.
- Markdown features the editor cannot produce (footnotes, nested lists, inline
  HTML, reference links) will not render specially. A document hand-written
  outside the editor may not display as its author expects.
- **The line model now exists in three implementations**: the JavaScript importer,
  the JavaScript preview renderer, and the PHP renderer. They can drift, and a
  drift means a document looks different in the editor than on the site. This is
  the main long-term maintenance risk in the design. It is contained by two
  things: the language tables live once in `shared/langs.json` and are read by
  both tokenizers, and `bin/test` asserts `export(import(x)) === x` and that the
  JS and PHP renderers agree on the sample content.
