# ADR-0027 — A Migration adds and never removes

**Status**: accepted · 2026-10-04 · related to ADR-0024

## Context

An upgrade replaces the code: `site/` is copied over the old one, and
`site.php`, `content/` and the Instance's Media are left as they were. Until
0.3.0 that was all an upgrade was. ADR-0024 is the first decision that breaks
an Instance's own files — a bare file name in an Image Line now names a file
in the Document's own directory under `media/`, and the site no longer looks
in the flat one — and the release notes could only describe the move as
`mkdir` and `git mv` by hand, Document by Document. Later releases will want
to reorder an Instance's files again.

An Instance does not know what version it is: `VERSION` is at the
repository's root and only `site/` is deployed. Some hosts have no shell; a
Page Build Instance is a checkout that CI builds.

## Decision

**A Migration is a step that brings an Instance's own files into the shape a
release reads them in, and it adds and never removes.**

- **It detects, it is not told.** No version is recorded. Every Migration
  the code carries runs every time, in version order, and each looks at what
  the Instance holds and does only what is left — so a second run does
  nothing, and an Instance restored from any earlier release migrates.
- **It is frozen at its release.** A Migration carries its own copy of the
  rules it migrates to and never loads `site/src`: a later release that moves
  the same files again must not change what an earlier Migration does. A
  released Migration is never edited.
- **It describes; the runner acts.** A Migration returns a list of actions,
  and the runner prints the list or, with `--apply`, performs it — the report
  and the change are one list. The actions are a closed set, and all of them
  add: copy a file to a path that does not exist, insert a block into
  `site.php` before its closing `];`, note a line in the report. Anything
  else is refused by the runner.
- **A moved file is copied.** The original stays where it was, and the report
  names the ones nothing names any more, for the operator to delete.
- **Site Config gains what it lacks, switched off.** Every top-level key
  `site.php.example` declares and `site.php` does not is inserted with its
  documentation and the example's value, commented out, so no value the site
  runs on changes. A key the example does not declare is named in the report
  as not read, and left where it is.
- **It reports by default.** `php site/migrate [<site-dir>]` says what it
  would do; `--apply` does it. The runner sits in `site/`, so it arrives with
  the release, and takes the Instance's `site/` as an argument, so it can run
  before the new code replaces the old — what it adds is invisible to the old
  code.

## Consequences

- An upgrade has no moment in which the pictures are broken: the Migration
  runs first, and the old code ignores everything it adds.
- An Instance accumulates what a Migration leaves behind — the flat
  originals, a retired key — until its operator removes it. The report says
  which.
- Each Migration repeats the few rules it needs from `site/src`. `bin/test`
  holds them to the current code end to end: after the whole chain runs over
  a 0.2.0-shaped fixture, the current Renderer finds every picture. When a
  release moves files without a Migration, that test fails.
- A future release that has to change a file in place — rewrite an Image Line,
  rename a key — adds an action to the runner, deliberately.

## Rejected

**A version stamp** in the Instance, with only the newer Migrations run. A
fourth file the operator owns, which a copy can carry wrong and a restore can
lose; with a wrong stamp the runner skips work or repeats it.

**Migrations that call `site/src`.** They cannot disagree with today's
Renderer, and they mean something different after every release that touches
the same rules — an old Migration would carry out a new layout under its
own name.

**Moving a file, deleting the original once nothing names it.** Tidier, and a
picture disappears the first time the scan for "does anything still name it"
misses a Link, a Footer or a logo.

**Rewriting `site.php` from the example** with the operator's values. It
loses their comments and order, and turns an expression such as `getenv()`
into the value it had on the day of the upgrade.

**Running on the first request after an upgrade.** The web server's user
would move the operator's files, a half-done move would be broken pages, and
the report would reach nobody.
