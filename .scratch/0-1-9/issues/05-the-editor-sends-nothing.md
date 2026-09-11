# 05 — The editor sends nothing, and the suite says so

Status: ready-for-agent
Spec: ../spec.md
Commit: 3 of 7 — "test: the editor sends nothing"

## What

Turn a sentence into an assertion.

Until 0.1.8 the Editor's claim was "talks to no server, ever", true by
inspection. It is now the narrower "a Document is never sent anywhere; the one
thing this page fetches is an image a Line names", written in three places —
`editor/ui.js`'s header, CONTEXT.md's **Editor** entry and `docs/security.md`.
Nothing checks it.

`bin/test` has scanned the site's PHP for the ways code reaches the system since
the 0.1.4 review. The Editor gets the same treatment for the ways a browser page
reaches the network.

## Scope

- A new check in the suite's existing `source` section, beside the one that
  already reads `site/src/*.php` and `site/public/index.php`.
- It reads the Editor's **hand-written** JavaScript — `editor/editor.js` and
  `editor/ui.js` — for the ways a page initiates a request: `fetch(`,
  `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, and a dynamic
  `import(`.
- **`editor/langs.js` is not scanned.** It is generated from `shared/langs.json`
  and it is data: the `js` table names `fetch` and eleven language tables name
  `import`, as words to colour. The PHP scan reads code and not
  `shared/langs.json` for the same reason. A syntax-highlighting keyword is not
  a call, and a scan that cannot tell them apart will be switched off the first
  time somebody adds a language.
- The forms are precise enough not to fire on prose: `fetch(` and not `fetch`,
  because `ui.js`'s own header comment contains the word "fetches".
- `navigator.` is **not** on the list. `navigator.clipboard` is the copy button
  and reaches no network; a list that flags it would be wrong about what it is
  for.
- A failure prints the file and the term, as the existing scan does.
- The one request the Editor makes is an `<img src>` the browser issues from
  markup, so it is invisible to a source scan by construction. That is the
  point, and it is worth a comment where the check lives: the scan says the
  Editor initiates nothing, `docs/security.md` says what the markup causes, and
  the two together are the claim.

## Out

Any attempt to assert the image request itself from the suite — that is the
probe's and the documentation's job. A Content-Security-Policy on the Editor
page, which is a static file opened from a filesystem and has nowhere to carry
one. Scanning generated files, or `tests/`.

## Acceptance

- [ ] `php bin/test` green, with the new check passing on the tree as it stands
- [ ] the check fails, naming file and term, when `fetch(` is put into
  `editor/ui.js` — verified by trying it and then taking it out again
- [ ] it does not fire on `editor/ui.js`'s header comment
- [ ] it does not fire on `navigator.clipboard`
- [ ] `editor/langs.js` is out of scope of the check, and the reason is written
  where the check is
- [ ] the assertion count in the suite's output has risen and the new line reads
  as plainly as the one beside it
