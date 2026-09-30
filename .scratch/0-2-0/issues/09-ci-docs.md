# 09 — Publishing as static pages: the docs and the pipelines

Status: done
Spec: ../spec.md
Blocked by: 07, 08

## What

`docs/deploy.md` gains **Publishing as static pages**, with a GitLab pipeline
and a GitHub workflow an Instance can copy. The YAML lives in the docs only.

## Scope

- What a Page Build is, in a paragraph, and when to choose it over a PHP host.
- The local preview: `php bin/page-build --output=dist/pages` then
  `php -S localhost:8080 -t dist/pages`.
- **What an Instance repository must change**: delete `site/site.php` from
  `.gitignore` and commit it; it holds nothing secret. The build refuses
  without it, deliberately.
- **GitLab** `.gitlab-ci.yml`: image `php:8.3-cli`, stage `deploy`,
  `php bin/page-build --output=public --base-url="$CI_PAGES_URL"`,
  `test -s public/index.html`, `pages: publish: public`, default branch only.
- **GitHub** workflow: `actions/checkout`, `actions/configure-pages` with its
  `base_url` output passed to `--base-url`, the build, then
  `actions/upload-pages-artifact` and `actions/deploy-pages`, with the
  permissions and environment Pages requires.
- Neither runs `php bin/build`, and the section says why in one sentence.
- Both are labelled as written against current GitLab and GitHub syntax and not
  run by the suite.
- A custom domain or unique Pages domain is an empty Base Path — say so.
- `docs/config.md` is untouched: the Base Path is not Site Config.

## Out

Pipeline files in the repository. Other hosts beyond a sentence saying the
output is plain files any static host serves.

## Acceptance

- [x] the section exists, with both pipelines and the `.gitignore` change
- [x] every flag and path the pipelines use exists in `bin/page-build` as
  written — checked against the code, not the spec
- [x] the GitLab and GitHub syntax checked against their current documentation
  at the time of writing, with the pages consulted listed in the comments
- [x] the README's *Documentation* list and the deploy section agree

## Comments

- 2026-09-30, agent: how it is written.
  - `docs/deploy.md` has **Publishing as static pages** between *Publishing a
    document* and *Upgrading*:
    - what a Page Build is and when to choose it;
    - a local preview, plus one under a subpath;
    - the `.gitignore` change;
    - the pipelines, with the "not run by the suite" label, the one sentence on
      `bin/build`, and the empty Base Path for a custom or unique domain;
    - one `###` each for GitLab Pages and GitHub Pages.
  - The README's *Documentation* line now reads "installing both halves,
    publishing (also as static pages on GitLab or GitHub), upgrading", which
    is the order of the sections.
  - GitLab: the job is named `page-build` and marked with the `pages:`
    keyword, because a job named `pages` is deprecated as the trigger.
    `pages.publish` is added to `artifacts:paths` by GitLab from 17.10, so the
    section says 17.10 or newer.
  - GitHub:
    - `on: push: branches: [main]`, with a note to name the default branch
      if it differs.
    - The `base_url` output reaches the command through `env:` rather than
      `${{ }}` in the script.
    - `ubuntu-latest` ships PHP: 8.3.6 on 24.04, and 8.5.4 on 26.04, which
      becomes `ubuntu-latest` from 2026-10-19. No setup step.
    - `workflow_dispatch`, `concurrency` and a `test -s` step follow GitHub's
      starter workflow and the GitLab job.
    - `upload-pages-artifact` v4+ leaves out dotfiles, so `.page-build` and
      `media/.gitkeep` do not reach the host. Neither is needed there.
  - Checked against the code, on a fresh clone of HEAD:
    - Without `site/site.php`, the build refuses with `Site::NO_CONFIG`.
    - With it, `--output=public --base-url="$CI_PAGES_URL"` (set to
      `https://group.gitlab.io/project`) builds for `/project/`, and
      `test -s public/index.html` passes.
    - `--output=dist/pages --base-url=https://octocat.github.io/my-repo`
      builds for `/my-repo/`.
    - A unique-domain URL (`https://project-f85695.gitlab.io`) gives an empty
      Base Path.
    - `php -S localhost:8093 -t dist/pages` answers 200 for `/`, a Category,
      a Document and `theme.css`.
  - Checked against the syntax:
    - The GitHub workflow passes actionlint 1.7.12.
    - The GitLab job validates against GitLab's own `ci.json` schema, which
      rejects a misspelled `pages` key.
- 2026-09-30, agent: the pages consulted.
  - GitLab:
    - <https://docs.gitlab.com/ci/yaml/#pages>: `pages`, `pages.publish`,
      and the deprecation of `pages` as a job name (from
      `gitlab-org/gitlab` `doc/ci/yaml/_index.md`, master).
    - <https://docs.gitlab.com/ci/variables/predefined_variables/>:
      `CI_PAGES_URL` is "always a subdomain of `CI_PAGES_DOMAIN`".
    - <https://docs.gitlab.com/user/project/pages/#unique-domains>, and
      <https://docs.gitlab.com/user/project/pages/getting_started_part_one/>
      for the default domain names. New projects use unique domains by
      default.
    - `app/assets/javascripts/editor/schema/ci.json` in `gitlab-org/gitlab`,
      master.
  - GitHub:
    - <https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages>
    - `actions/starter-workflows` `pages/static.yml`
    - Latest releases, each `action.yml` read on main: `actions/checkout`
      v7.0.1, `actions/configure-pages` v6.0.0 (`base_url` output),
      `actions/upload-pages-artifact` v5.0.0 (`path` input),
      `actions/deploy-pages` v5.0.1 (`page_url` output).
    - `actions/runner-images`: the Ubuntu 24.04 and 26.04 readmes, and issue
      #14748.
- 2026-09-30, agent: after the two-axis review.
  - Changed:
    - A bare "build" is now "Page Build" or "the output", as `CONTEXT.md`
      asks. One sentence had put it beside `php bin/build`.
    - `site.php`'s contents are described, not listed wrongly.
    - `$CI_PAGES_URL` is "an address on the Pages domain (`gitlab.io` on
      GitLab.com)", which also holds for self-managed instances.
    - The project-page example says "without a unique domain".
    - The only `####` headings in the docs are now `###`, and the bold terms
      are plain.
    - The README line was reworded.
  - Left as they are:
    - *Two instances* still says nothing is generated. It is about the PHP
      host, and 11's words pass reads the docs against ADR-0017.
    - The Base Path is explained in the preview, the domain paragraph and
      under each pipeline. Each place says what that one URL holds.
    - The reviewer's worry that a release's `.gitignore` brings the
      `site/site.php` line back: a tracked file stays tracked whatever
      `.gitignore` says, so a pipeline still has it.
