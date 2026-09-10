# ADR-0014 — The file name carries the language

**Status**: accepted · 2026-09-10

## Context

A Document written in two languages is one document, not two: it has one
address per language, one entry in a Listing, and one place a reader switches
between them. The system had nowhere to record which language a file was
written in.

Three things could have carried it: a directory per language (`content/sk/...`),
a Meta Line (`lang: sk`), or the file name. The Router already addresses a
Document as `<category>/<slug>` and finds it by comparing the request against
the real names in one directory (ADR-0004), and the Editor already names the
file and knows nothing about the site it is published to (ADR-0009, ADR-0006).

## Decision

A Document's language is the suffix on its file name: `what-it-is-sk.md` is the
Slovak of `what-it-is`. A name with no suffix is the site's own language, which
is what every document written before this existed is — and it keeps the
address it had.

Site Config names the languages: `lang` is the site's own, `languages` is every
other one a file name may end in. A suffix is a language only if it was
declared. That is not caution about spelling: `what-it-is` ends in `-is`, which
is Icelandic, and `install-in-five-minutes` ends in `-es`. Reading a suffix
without a list to check it against splits documents that were never
translations.

One address per language and no others. The bare slug is the site's own
language; `-sk` is the Slovak. A language a Document was not written in is a
404 rather than a second address for the language it was written in.

## Consequences

- Nothing has to be kept in step. The language is not in the document, so a
  file cannot say one thing while its name says another, and moving or copying
  a file moves its language with it.
- The Listing groups the files in a directory by base name, so one Document is
  one row whatever it is translated into, with `(EN | SK | CZ)` beside it.
- A page declares the language of the Document it is showing, not the site's.
- Translating an existing Document does not move it. `what-it-is.md` stays
  where it is, at the address every existing link uses.
- The Editor is not involved. A file name is a slug with `.md` on it, and a
  language suffix is part of the slug like any other word — the writer types
  it, or renames the file, exactly as before.
- A Category's `index.md` is its introduction in any language, so a category
  page reads `index-sk.md` when the site is Slovak and never lists it.

## Rejected

**A directory per language.** `content/sk/guides/what-it-is.md` reads well and
puts every translation of a category together — but it doubles the routable
surface, makes the Category list ambiguous (is `sk` a category?), and moves
every existing document to a new address the day a second language appears.

**A `lang:` Meta Line.** The Editor would fill it in and the site would read
it, and then two files in one directory could claim the same language, or none
could, and the file name would say nothing about which is which. It also puts
the language in the printed meta bar, where it is noise: a reader looking at a
Slovak page knows.

**Reading the suffix by shape (`-[a-z]{2}`).** No configuration to write, and
it silently cuts `what-it-is` into `what-it` plus Icelandic.

**Content negotiation on `Accept-Language`.** One URL that is a different
document per reader is not cacheable, not linkable and not what a reader
switching languages by hand asked for. The site reads no request headers by
design (ADR-0002).
