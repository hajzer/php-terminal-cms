# php-terminal-cms

A micro publishing platform whose organising idea is that a **document is an
ordered sequence of typed lines**, not a blob of text. Authors compose lines in a
terminal-styled editor; the result is an ordinary markdown file that a separate
renderer turns into a static-feeling public page.

## Language

### The document model

**Line**:
The atomic unit of a document — one piece of text carrying exactly one Type, its
own position, and optionally one Dialect. Everything in the model is a Line.
_Avoid_: block, element, node, paragraph (when you mean any line)

**Type**:
What a Line *is* — H1, H2, H3, Paragraph, List, Quote, Note, Code, CLI, Output,
Table, Rule, Image, Meta. Fourteen, closed set. Every Type has exactly one
keystroke that applies it.
_Avoid_: style, format, kind, tag

**Dialect**:
The language a Code or CLI Line is written in — fifty-eight of them for Code,
seventeen shells and interactive prompts for CLI. Only these two Types carry one.
It selects the syntax highlighting, and for CLI the prompt, which is also how
the Dialect is recognised again when the file is read back — so no two CLI
Dialects may share one.
_Avoid_: subtype, variant, language, lang

**Run**:
Consecutive Lines of the same Type (and, for Code and CLI, the same Dialect),
rendered as a single visual block. A code block, a list, a table and a quote are
each a Run — which is why reordering a Line reorders a row of a table or a
statement inside a block.
_Avoid_: block, group, section

**Output**:
A Run of Output Lines immediately following a Code or CLI Run, presented as that
block's result. Folded by default everywhere — editor, page and exported
markdown.
_Avoid_: result, stdout, response

**Meta**:
A Line holding one `key: value` pair, exported as YAML frontmatter. `title`,
`category` and `date` are the ones the system reads; anything else is carried
through untouched. Every Meta but `title` is shown on the page, in one line
under the title.
_Avoid_: frontmatter (when you mean the Line), header, attribute

**Link**:
The one addressed thing a Line's text can carry — a Wording and an Href,
written `[wording](href)` in any Line whose text becomes inline markup:
headings, Paragraph, List, Quote, Note and Table. A Link the allowlist refuses
is not a Link the page will make: it prints as its Wording alone, in the
Editor's preview and on the public page alike.
_Avoid_: anchor, hyperlink, url (that is one shape an Href can take), reference

**Wording**:
The half of a Link a reader sees. A Link cannot do without one — clearing it is
refused rather than obeyed, so `[](…)` is never written.
_Avoid_: text (that is the whole of a Line), label, caption (that is the Image's
half), title

**Href**:
The half of a Link that says what it addresses, as the author wrote it.
Clearing it unlinks, leaving the Wording exactly as it stands. One allowlist
judges it — a fragment, a local absolute path, `http`, `https` or `mailto` —
and the Editor and the Renderer share that one, so a Link in the preview is a
Link on the page.
_Avoid_: target (that is whether a Link opens in a new tab), address,
destination, link

### Composing and publishing

**Document**:
One markdown file — a sequence of Lines with its Meta. Addressed on the public
site as `<category>/<slug>`.
_Avoid_: post, article, page, entry

**Name**:
The file a Document becomes — a slug with `.md` on it, which is what the site
addresses the Document by, and which ends in a Language code when the Document
is written in one that is not the site's own. Held by the Editor, not by the
Document's Lines, and it follows the `title` Meta until somebody sets one or
opens a file, after which it stays put.
_Avoid_: filename (two words in this codebase), slug (that is the shape, not the
thing), path (that is the Name plus its Category)

**Language**:
The language a Document is written in, and the only thing about a Document that
lives in its Name rather than in its Lines — `what-it-is-sk.md` is the Slovak of
`what-it-is`. A Name with no suffix is the site's own Language, declared as
`lang` in Site Config; `languages` declares the others, and a suffix that is not
one of them is part of the Name. Two files that are one Document are one entry
in a Listing and one address each.
_Avoid_: locale, translation (that is the file, not the property), i18n

**Category**:
A named group of Documents, declared in Site Config and matching one directory
under `content/`. The public navigation is exactly the Category list; a URL
segment that is not a Category is a 404.
_Avoid_: section, folder, tag, collection

**Editor**:
The static page on which Lines are composed. Has no server: it holds one
Document in the browser tab, opens markdown from a file picker or a drop, and
emits it by download. It never writes to a server. It knows nothing of the
Category list — a Document's Category is a Meta Line like any other, and the
Editor only reads it to say which directory the file belongs in.
_Avoid_: CMS, admin, backend, dashboard

**Renderer**:
The PHP that turns a Document into HTML for the public site at request time. It
reads only the subset of markdown the Editor emits, escapes everything, and emits
only tags it chose itself.
_Avoid_: parser (that is only half of it), engine, generator

**Fold**:
Whether an Output run is presented collapsed. It is a property of the Lines
themselves, not state held beside the document, so it survives editing the run
it belongs to. Folded is the default everywhere.
_Avoid_: collapse, hide, toggle

**Export**:
Producing the markdown file from the Lines in the Editor. The only output the
Editor has.
_Avoid_: save, publish, download

**Transfer**:
Moving an exported file to a server by a means the system knows nothing about —
git, rsync, scp, WinSCP. Deliberately outside the software.
_Avoid_: deploy (that is the code), upload, sync, publish

**Site Config**:
The per-instance `site.php` — title, tagline, Category list, accent colour,
Listing switches and Footer. The only thing that differs between two
installations of the same code.
_Avoid_: settings, options, env

**Listing**:
The documents an index page prints below its own writing — every Document in a
Category on that Category's page, the recent ones from every Category on the
homepage. One row is one Document whatever Languages it exists in, printed in
the site's own and carrying `(EN | SK)` — the one being read, and the way to the
others. Each Listing is a switch in Site Config, on unless an Instance says
otherwise; switched off, the index page is its `index.md` and nothing else.
_Avoid_: feed, archive, index (that is the page, not the list)

**Footer**:
The lines of writing at the foot of every public page, and the only thing there.
They come from Site Config, one string per line, written in the same inline
markup a Line uses and escaped the same way — so a Footer may carry links and
cannot carry anything else. An Instance that declares none has no footer.
_Avoid_: credits, colophon, signature

**Instance**:
One deployed copy of the code with its own Site Config and `content/`.
Two deployments of php-terminal-cms share no runtime state and no code path —
only a version number.
_Avoid_: site (ambiguous — the code or the deployment?), tenant, host
