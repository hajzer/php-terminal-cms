# Deploying

Two halves, two places, no connection between them.

## The site

Everything under `site/` goes on the web host. Only `site/public/` should be the
document root — `src/`, `content/`, `editor/` and `site.php` must sit **above** it.

`site/editor/` is a copy of the Editor that `php bin/build` makes, for a Bundle
to carry; the site reads it and never serves it. Above the document root no
address reaches it. The Editor you run yourself is the top-level `editor/` —
see [below](#the-editor).

```console
$ tar xzf php-terminal-cms-*.tar.gz
$ rsync -az php-terminal-cms-*/site/ deploy@example.com:/var/www/example.com/
$ ssh deploy@example.com 'cd /var/www/example.com && cp site.php.example site.php'
```

```output
sent 61,204 bytes  received 1,118 bytes  41,548.00 bytes/sec
```

Then edit `site.php` — see [config.md](config.md).

### Apache

```output
<VirtualHost *:443>
    ServerName example.com
    DocumentRoot /var/www/example.com/public

    <Directory /var/www/example.com/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

The bundled `public/.htaccess` sends anything that is not a real file to
`index.php` and denies `.md`, `.json` and `.example` directly. `AllowOverride
All` is what lets it work; if you would rather not, move those rules into the
vhost and set `AllowOverride None`.

### nginx

```output
server {
    server_name example.com;
    root /var/www/example.com/public;

    location / { try_files $uri $uri/ /index.php; }
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root/index.php;
    }
}
```

### PHP

Two settings, once, in the pool or the vhost:

```output
display_errors = Off
expose_php = Off
```

Nothing else is needed. There is no extension to install, no `composer install`
to run, and no writable directory to arrange.

### Permissions

The web user needs to **read** the tree and nothing more. Nothing in the system
writes a file at request time, so no directory needs to be writable — if one is,
that is a mistake worth fixing.

```console
$ sudo chown -R root:www-data /var/www/example.com
$ sudo find /var/www/example.com -type d -exec chmod 750 {} +
$ sudo find /var/www/example.com -type f -exec chmod 640 {} +
```

### Media

A Document's pictures live in its own directory under `site/public/media/`:
its path under `content/`, without the language and the `.md` —
`content/guides/php/intro.md` keeps its pictures in
`site/public/media/guides/php/intro/`, and `content/index.md` in
`site/public/media/index/`. An `img` line's bare file name is a file there; an
absolute path such as `/media/logo.png` names that path, and the site's logo
is one. Any src is reduced to a file name in a directory the site chose, so
nothing above the document root is reachable at all. See
[format.md](format.md#media). Copy pictures the same way you copy documents —
the software has no upload path and never writes one.

```console
$ rsync -az site/public/media/ deploy@example.com:/var/www/example.com/public/media/
```

## The editor

`editor/` is ten static files and a `themes/` directory of one stylesheet
per Theme. Three ways to run it, in increasing order of exposure:

1. **From the filesystem.** Open `editor/index.html`. No server, nothing
   published, works offline. This is the recommended default.
2. **On a private host** — a subdomain behind basic auth, a VPN, or bound to
   localhost.
3. **Public on `editor.example.com`.** It has no endpoints, so there is nothing
   to attack beyond the static file server, but there is also no reason to
   publish it unless you want it reachable from other machines.

```console
$ rsync -az php-terminal-cms-*/editor/ deploy@example.com:/var/www/editor.example.com/
```

If you change `shared/theme.css`, a Theme in `shared/themes/` or
`shared/langs.json`, run `php bin/build` before deploying either half — both
copies are generated, and so is `site/editor/`, from `editor/`.

## Publishing a document

1. Write it in the editor.
2. `E`, then **download .md** (or copy the markdown).
3. Put the file at `content/<category>/<slug>.md` and move it:

```console
$ git add content/guides/my-post.md && git commit -m 'post: my post' && git push
$ rsync -az content/ deploy@example.com:/var/www/example.com/content/
```

It is live on arrival — there is no build to run and no cache to clear.

To revise: drop the `.md` back onto the editor, edit, export, copy over.

### From a Bundle

A Bundle — the `↓ bundle` link under a document or on a category page — is the
same slice of the repository, so an edited one goes back with the same `rsync`.
Unzip it, open `editor/index.html`, **Open .md** a file under `site/content/`,
edit, **download .md**, and put the file back where it was opened from:

```console
$ unzip -q what-it-is.zip
$ mv ~/Downloads/what-it-is.md what-it-is/site/content/about/what-it-is.md
$ rsync -a what-it-is/site/ deploy@example.com:/var/www/example.com/
```

`<bundle>/site/` holds `content/` and `public/media/` and nothing else, so it
lands on an Instance's own directories; a picture you added under
`site/public/media/` goes with it. Never `--delete` here: the Bundle is a slice,
and that would remove everything it does not hold. Each file in a Bundle carries its
time on the server, so with an `unzip` that restores it, `rsync` skips the
files you did not touch.

The site answers a Bundle at a page's address with `.zip` on it, through
`index.php`, as it answers the page: neither the `.htaccess` nor the nginx
`try_files` above needs anything added.

## Publishing as static pages

A Page Build renders every page of the Instance to files ahead of time, with
the same Router, Renderer and page shell that answer a request, so that a host
which serves files and runs no PHP can serve the site. Choose it when your
content already lives in a GitLab or GitHub repository and Pages is the host you
have. Choose a PHP host when you have one: there a document is live the moment
it is copied, while a Page Build is live only once its pipeline has run. With
either pipeline below, publishing a document is `git push`, and the pipeline
renders every page again. The output is plain files, so any static host serves
it — give `--base-url` the address the host serves the site from.

### A local preview

```console
$ php bin/page-build --output=dist/pages
$ php -S localhost:8080 -t dist/pages
```

```output
built /home/you/example/dist/pages
[Wed Sep 30 10:12:44 2026] PHP 8.3.31 Development Server (http://localhost:8080) started
```

Open <http://localhost:8080>. A server is needed, because from `file://` a
directory does not open its `index.html`. Without `--base-url` the site begins
at the host's root. To see it from a subpath, the way a project page is
served, put the output in a directory below the one you serve:

```console
$ php bin/page-build --output=dist/serve/proj --base-url=http://localhost:8080/proj/
$ php -S localhost:8080 -t dist/serve
```

A Page Build replaces its output only when that output is absent, empty, or
an earlier Page Build, and never writes into the repository's root, `site/` or
`content/`. If any page fails, the previous output is left as it was.

### What an Instance repository must change

`.gitignore` keeps `site/site.php` out of the repository, because on a PHP host
it is the one file you copy by hand. A pipeline has only what is committed, so
delete the `site/site.php` line from `.gitignore` and commit the file:

```console
$ git add .gitignore site/site.php && git commit -m 'site: site.php is committed, for the Page Build'
```

It holds nothing secret — what the site is called, how it looks and what it
lists, which the pages themselves show. `bin/page-build` refuses to run without
it, deliberately, rather than publish the example's title and footer as yours.

### The pipelines

Both are written against the GitLab and GitHub documentation as of September
2026 and are not run by the suite. Neither runs `php bin/build`: the files it
generates are committed beside their sources, and `php bin/test` is what keeps
them true. Both hosts serve the output's `404.html` for an address that is
nothing.

A custom domain, or GitLab's unique domain, serves the site from the host's
root, so its Base Path is empty. On GitHub, and on a GitLab unique domain, the
URL the pipeline passes already says so. On a GitLab custom domain it does not,
because `$CI_PAGES_URL` is always an address on the Pages domain (`gitlab.io`
on GitLab.com): replace `--base-url="$CI_PAGES_URL"` with the address readers
use, such as `--base-url=https://example.com`, or leave the flag out.

### GitLab Pages

`.gitlab-ci.yml` at the root of the repository, for GitLab 17.10 or newer:

```yaml
page-build:
  image: php:8.3-cli
  stage: deploy
  script:
    - php bin/page-build --output=public --base-url="$CI_PAGES_URL"
    - test -s public/index.html
  pages:
    publish: public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

On a project page without a unique domain, `$CI_PAGES_URL` is
`https://<namespace>.gitlab.io/<project>`, which makes `/<project>` the Base
Path.

### GitHub Pages

In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
Then add `.github/workflows/pages.yml`, naming your default branch if it is not
`main`:

```yaml
name: Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v7
      - id: pages
        uses: actions/configure-pages@v6
      - run: php bin/page-build --output=dist/pages --base-url="$BASE_URL"
        env:
          BASE_URL: ${{ steps.pages.outputs.base_url }}
      - run: test -s dist/pages/index.html
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist/pages
      - id: deployment
        uses: actions/deploy-pages@v5
```

`base_url` is `https://<owner>.github.io/<repository>` on a project page and
the custom domain when there is one. The `ubuntu-latest` image comes with PHP,
so there is no step to install it.

## Upgrading

```console
$ php bin/test
$ rsync -az --exclude site.php php-terminal-cms-*/site/ deploy@example.com:/var/www/example.com/
```

`site.php` and `content/` are yours; everything else is replaceable. Excluding
`site.php` on the way up is the only thing to remember.

### From 0.2.0: each Document's own Media

Until 0.3.0 a bare file name in an Image Line — `![x](shot.png)`, or
`./shot.png`, or anything else that is not an absolute path — named a file in
`site/public/media/` itself. It now names a file in the Document's own
directory, and the site does not look in the old place. An Image Line that
writes an absolute path, `/media/shot.png`, is unchanged and needs nothing.

For each Document whose Image Lines write a bare name, make its directory and
move each picture it names there. For `content/guides/php/intro.md` showing
`shot.png`:

```console
$ mkdir -p site/public/media/guides/php/intro
$ git mv site/public/media/shot.png site/public/media/guides/php/intro/
```

The directory is the Document's path under `content/` without `.md`, and
without a language: `intro-sk.md` shares `intro/`. A Category's `index.md` is
`<category>/index`, the homepage's `index`. A picture two Documents both name
is copied into each. To find the lines that need it:

```console
$ grep -rnE '^!\[[^]]*\]\([^/)][^)]*\)$' site/content
```

## Two instances

Deploy the same archive twice, into two directories under two vhosts, each with
its own `site.php` and `content/`. The code has no notion of which site it is
serving and no shared state between them — a page is rendered from its markdown
file on every request, so there is nothing generated for two instances to share
([ADR-0002](adr/0002-request-time-rendering.md)).
