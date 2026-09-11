# 10 — The third security review, and a deep code read

Status: done
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08, 09
Commit: 7 of 8 — "docs: the third review"
Landed in 8 commits, the findings and the hardening each on their own:
  9aaf19b site: the site's own language is one address, the bare one
  9e7b4bc site: a media path that climbs is a name under media/, however short the climb
  2ebc747 site: a lang or an accent that is not a string is its default, quietly
  4f645a6 editor: the overlay judges the href it writes, and cuts an image's halves too
  a2fccf6 editor: a line break in the box commits as one character
  a7e669a editor: the one request carries no referrer, and the scan names the constructors
  bb94b6e docs: the third review
  and the tracker commit that carries this line and issue 12

## What

`docs/security-audit.md` records two reviews, at 0.1.3 and 0.1.4, and says 0.1.5
changed no behaviour. 0.1.6, 0.1.7 and 0.1.8 are not in it.

Two passes over the same surface, with different questions. The **security
review** asks what a request or a file can cause, and is written up. The **deep
code read** asks about correctness, drift and dead ends, and produces issues and
fixes rather than a second document.

**This is written last.** It reviews the release it ships in, so it runs after
01–09 have landed.

## Scope — what is reviewed

Everything under `site/` and `editor/` that differs from 0.1.4. In particular,
because each is a boundary that moved:

- **A Language suffix reaching the Router.** A request slug becoming a file name
  is the oldest boundary here and it gained a new shape in 0.1.7. The 0.1.4
  review already removed one shape rule from the slug on the grounds that the
  equality comparison against real names is the boundary; check that the
  language suffix did not put a new one back, and that one Document has one
  address per Language and no others.
- **The Listing grouping files by base name**, and what a file name that groups
  unexpectedly does to it.
- **`logo`** — the newest way `site.php` reaches the page as something other
  than writing. A config string becoming a path in the page shell, through the
  media-path reduction, under a policy that allows images from this site only.
- **`link_open`** — `target="_blank"` arriving beside the `rel` that was already
  there, and whether the scheme test is the right test. The docs were wrong
  about this once already and were corrected in the 0.1.8 release commit.
- **`listing_max`** — a config value reaching a count.
- **The href allowlist's second reader.** The Editor's overlay now warns with
  it as well as the preview rendering with it. Two halves disagreeing is exactly
  the 0.1.4 finding that the parity test exists to prevent; check the warning
  path against the render path, not just the render path against the PHP.
- **The Editor's one outbound request**, as the new thing it is, and the three
  places that describe it checked against what the code does.
- **Cell and Column rewrites** — a Line's text rewritten by a derived structure,
  and what an unusual Cell does to it.
- **The control treatment's reach** into `shared/theme.css` and both generated
  copies.
- **`favicon`**, as a second config string becoming a path in the page shell,
  and whether one media-path rule serving both it and `logo` is right or is two
  jobs wearing one hat.
- **The assets the archive now ships** — a logo, an icon, and whatever lands in
  `docs/media/`. A release archive gained binary content it did not carry
  before, and `bin/manifest.php` gained a directory listed by name rather than
  copied whole.
- **`bin/build`'s repathing**, which was a hand-written list that `bin/test`
  could not catch an omission from (issue 07). Check the generic version does
  not now rewrite something it should not.

## Scope — what is produced

- One section appended to `docs/security-audit.md`: `## 0.1.9 — third review`,
  in the shape the first two took — scope, a severity table with the same three
  columns and the same words (`medium`, `low–medium`, `low`), a "looked at and
  left alone" list with reasons, and anything changed as hardening rather than
  as a finding.
- `## Residual risks` and `## Validation` are updated in place, not repeated.
  They describe the software, not a release.
- A security finding is fixed here, or becomes its own issue saying why it
  waits. A code-read finding becomes an issue unless it is small enough to fix
  where it is found. Neither kind is recorded and then left.
- Every fix arrives with the assertion that would have caught it.

## Out

A fourth review of what the first two covered — the public path's shape is
re-read as context, not re-audited. A penetration test, a fuzzing campaign or a
dependency scan; there are no dependencies and this is a reading of the code, as
the first two were. A second document for the code read. Acting on a finding by
loosening a claim in the documentation: where code and docs disagree the code
changes, unless the documentation was simply wrong about behaviour that was
always correct.

## Acceptance

- [x] `docs/security-audit.md` carries `## 0.1.9 — third review` in the house
  shape, with its scope stated even where it found nothing
- [x] every item in "Scope — what is reviewed" is accounted for in the write-up,
  as a finding or as looked-at-and-left-alone with a reason
- [x] every finding is fixed here or has an issue number and a reason for
  waiting
- [x] every fix has an assertion that fails without it
- [x] `## Residual risks` and `## Validation` reflect this release, updated in
  place
- [x] the deep code read's findings are issues or fixes, and no second document
  was created
- [x] `docs/security.md` and CONTEXT.md still describe what the code does, and
  the Editor paragraph in particular was tested rather than taken on trust
- [x] `php bin/test` green, with the assertion count noted
- [x] the probe green in a browser, with its count noted

## Comments

**Two findings, both `low`, both fixed; nothing above that.** A file suffixed
with the site's own language answered at two addresses (Router), and the
overlay warned about the href as typed rather than the href it writes, in the
safe direction only (editor.js). Four hardening changes and two code-read fixes
beside them, each with its assertion; every assertion was run against the code
before its fix and seen to fail — `bin/test` went 7 red on the old PHP and
scripts, the probe 2 red on the old scripts.

**One code-read finding deferred, as issue 12:** a link clicked in the read
pane, or a URL dropped outside the edit box, navigates the tab away and loses
the Document. It waits because the three possible answers each change what
the preview is, and that is a decision and not a fix.

**Counts.** `php bin/test`: 548 passed, 0 failed (477 at 0.1.8). The probe:
0 failed of 172 (170 before this issue), run in Firefox headless, since one is
installed here — the maintainer's own run in a browser is still the last step
issue 11 says to stop at.

**For issue 11's changelog**, what this issue changed that a reader of a
release note would want: the second address is gone; the overlay's warning is
now right about a href with a space or a `)` in it; an image's src and caption
cannot break the round trip any more; `../x.png` is `/media/x.png`; a
non-string `lang` or `accent` is silently its default; the editor page names
`no-referrer`; the network scan is longer. `docs/security.md` already carries
the referrer and the media-path sentences — issue 11's edit to its Editor
paragraph (that the claim is now tested) is still to do and is not done here.

**The 0.1.8 tag** was not moved. Finding 1 belongs to 0.1.7's Router and the
rest to 0.1.8 and later, but nothing is public and 0.1.9 sits on top; the
maintainer's call, as the spec says.
