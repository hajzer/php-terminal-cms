# 09 — The third security review, and a deep code read

Status: ready-for-agent
Spec: ../spec.md
Blocked by: 01, 02, 03, 04, 05, 06, 07, 08
Commit: 6 of 7 — "docs: the third review"

## What

`docs/security-audit.md` records two reviews, at 0.1.3 and 0.1.4, and says 0.1.5
changed no behaviour. 0.1.6, 0.1.7 and 0.1.8 are not in it.

Two passes over the same surface, with different questions. The **security
review** asks what a request or a file can cause, and is written up. The **deep
code read** asks about correctness, drift and dead ends, and produces issues and
fixes rather than a second document.

**This is written last.** It reviews the release it ships in, so it runs after
01–08 have landed.

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

- [ ] `docs/security-audit.md` carries `## 0.1.9 — third review` in the house
  shape, with its scope stated even where it found nothing
- [ ] every item in "Scope — what is reviewed" is accounted for in the write-up,
  as a finding or as looked-at-and-left-alone with a reason
- [ ] every finding is fixed here or has an issue number and a reason for
  waiting
- [ ] every fix has an assertion that fails without it
- [ ] `## Residual risks` and `## Validation` reflect this release, updated in
  place
- [ ] the deep code read's findings are issues or fixes, and no second document
  was created
- [ ] `docs/security.md` and CONTEXT.md still describe what the code does, and
  the Editor paragraph in particular was tested rather than taken on trust
- [ ] `php bin/test` green, with the assertion count noted
- [ ] the probe green in a browser, with its count noted
