# 09 — Publishing as static pages: the docs and the pipelines

Status: ready-for-agent
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

- [ ] the section exists, with both pipelines and the `.gitignore` change
- [ ] every flag and path the pipelines use exists in `bin/page-build` as
  written — checked against the code, not the spec
- [ ] the GitLab and GitHub syntax checked against their current documentation
  at the time of writing, with the pages consulted listed in the comments
- [ ] the README's *Documentation* list and the deploy section agree
