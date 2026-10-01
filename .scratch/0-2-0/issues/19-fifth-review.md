# 19 — The fifth review: what landed after the fourth

Status: done
Spec: ../spec.md
Blocked by: 12, 14, 15, 16, 17, 18

## What

One security review of what landed after issue 10's, in the shape of the four
before it, appended to `docs/security-audit.md` as `## 0.2.0 — fifth review`.
The fourth review was written before the Themes and before the Editor's page
named a policy. Issue 18 read 14–17 for standards and spec, not for exposure,
and 12 landed after 18.

## Scope

- **A Theme's file.** What `bin/themes.php` writes from `shared/themes/*.json`
  into a stylesheet and into `themes.js`, what it refuses, and what the suite
  holds it to. That no stylesheet either half ships can cause a request.
- **The name that chooses.** `theme:` and `palette:` in Meta, `theme` and
  `palette` in Site Config, from the file to the attribute and the stylesheet
  address. That nothing in a request chooses either, and that the reader's
  stored Palette is one of two words or not used.
- **The Editor's Theme and Palette.** The stored names, the pin, the menu, the
  two commands, and every place a name reaches the DOM.
- **The Editor's policy.** That the browser enforces it from `file://`, what
  it refuses and what it does not, and whether the suite and the probe would
  notice it gone.
- **The replacements while Mermaid draws.** `setAttribute` and `createElement`
  replaced page-wide for the length of a render: that they come back, that
  the Editor's own code is safe under them, and what a Diagram from somebody
  else can do with the name the styles are kept under and with the stylesheet
  the document adopts.
- **The public page's placement**, which took the same `setAttribute`
  treatment in 9b3e1de.
- A security finding is fixed here or becomes its own issue with the reason it
  waits. Severity in the words the earlier reviews used; `## Residual risks`
  and `## Validation` updated in place.

## Out

Any new behaviour. The surface the fourth review read, except where the new
code touches it. A version bump: this is 0.2.0, unreleased.

## Acceptance

- [x] `## 0.2.0 — fifth review` appended, with scope, what was found, what was
  looked at and left alone, and hardening
- [x] every finding fixed or filed, none recorded and left
- [x] `## Residual risks` and `## Validation` say what is true now
- [x] `php bin/test` green, no generated file edited
- [x] the probe green in headless Chromium and headless Firefox
- [x] the maintainer has run `tests/editor-probe.html` in their own browser:
  the probe gained an assertion, and `editor/ui.js` and the page's drawing
  script each lost a sentence from a comment

## Comments

- 2026-10-01, agent: the review is in `docs/security-audit.md` as
  `## 0.2.0 — fifth review`. **No finding of any severity.** The scope was
  read and then run: in headless Chromium and Firefox 155, the Editor from
  `file://` and the site served by `php -S` with its header.
- 2026-10-01, agent, **hardening**, four checks the suite and the probe did
  not make:
  - `bin/test` matched the Editor's policy `<meta>` anywhere in the file. A
    browser obeys one only inside `<head>` and only for what follows it. The
    suite now requires both and tries a policy moved into `<body>` and one
    moved below a stylesheet.
  - The probe asserted that the policy refused nothing, which a page with no
    policy also passes. Tried on a copy: with the `<meta>` removed, and with
    it moved into `<body>`, the probe was green on all 292 in both browsers.
    It now writes a handler into the page as markup and requires that it does
    not run and that the browser reports the refusal — 293, and on those two
    copies that one fails.
  - `bin/test` reads `editor.js` and `ui.js` for a `style` attribute written
    by `setAttribute` or in a string of markup, and for a `<style>` element
    made. ADR-0020 says the Editor's own code must do neither while a drawing
    is in flight, and nothing held it to that.
  - `bin/test` fails on a `url()`, an `image-set()`, an `@import` or an
    `@font-face` in any stylesheet either half ships. The Editor's `img-src`
    allows any host, so a `url()` in a Theme would be a request from every
    writer's browser.
- 2026-10-01, agent, **the code read, fixed**: ADR-0020, `ui.js`, the page's
  drawing script and `bin/test` said Firefox refuses an assignment to
  `cssText` under the policy. It does not — tried in Firefox 155 under the
  `<meta>` and under the header, and in the Firefox 140 at `/usr/bin/firefox`
  under the `<meta>`. What Firefox drops is a `style` attribute's value as it
  is set, which is the half the code depends on; `setProperty` stays. The
  sentence in the page's script is bytes a reader is sent, so
  `/about/everything-is-a-line`'s pinned hash is re-recorded. 12's own
  comments say the same thing and are left as the record they are.
  `docs/security.md` said the Editor's stylesheets come only from the files
  the page links; `'self'` on `file://` is every file on the disk, tried in
  both browsers, and the paragraph and ADR-0020 now say what that lets
  injected markup do — link a stylesheet — and what it does not — run a
  script. Both now say the policy does not govern navigation. The residual
  risks no longer say the Editor names no policy, and name a label's `<a>`
  and `<img>` and an `init` directive's CSS beside `click` and the `img`
  shape.
- 2026-10-01, agent, **filed**: issue 20, a Document with two `theme:` Lines
  read differently by the page and the Editor. Drift, not exposure.
- 2026-10-01, agent, **looked at and left alone**, each with what was tried,
  is in the audit: a Theme's file; twenty-six shapes of Theme name; the
  Palette's two words; stored values and Meta with markup in them; eighteen
  things the policy must refuse from `file://`, each refused; what it does
  not refuse — a picture, a prefetch in Chromium, a local file, leaving the
  page, being framed; the replacements coming back after a drawing, a parse
  error and a failed picture, and the Editor used under them with a request
  held open; thirty-six ways out of Mermaid's scoping, none of which got out;
  sixteen hostile Diagrams pasted; a fixed-position label held inside its
  drawing; the served page with a hostile Diagram under the header; OSV for
  11.17.2 today, nothing.
- 2026-10-01, agent: `php bin/test`: 838 passed, 0 failed. The probe: 293 of
  293 in headless Chromium and in headless Firefox. Nothing was committed.
  The CHANGELOG's 0.2.0 entry gained a bullet for this review, since 11 had
  already written the fourth's; 11's counts are noted there.
- 2026-10-01, human: the probe is green in the maintainer's own browser. The
  box is ticked and the issue is closed.
