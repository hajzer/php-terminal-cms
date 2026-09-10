# Deploying

Two halves, two places, no connection between them.

## The site

Everything under `site/` goes on the web host. Only `site/public/` should be the
document root — `src/`, `content/` and `site.php` must sit **above** it.

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

Images live in `site/public/media/`. An `img` line's path is normalised to
`/media/<basename>`, so the file is reachable by its own name and nothing above
the document root is reachable at all. Copy images the same way you copy
documents — the software has no upload path and never writes one.

```console
$ rsync -az images/ deploy@example.com:/var/www/example.com/public/media/
```

## The editor

`editor/` is six static files. Three ways to run it, in increasing order of
exposure:

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

If you change `shared/theme.css` or `shared/langs.json`, run `php bin/build`
before deploying either half — both copies are generated.

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

## Upgrading

```console
$ php bin/test
$ rsync -az --exclude site.php php-terminal-cms-*/site/ deploy@example.com:/var/www/example.com/
```

`site.php` and `content/` are yours; everything else is replaceable. Excluding
`site.php` on the way up is the only thing to remember.

## Two instances

Deploy the same archive twice, into two directories under two vhosts, each with
its own `site.php` and `content/`. The code has no notion of which site it is
serving and no shared state between them — a page is rendered from its markdown
file on every request, so there is nothing generated for two instances to share
([ADR-0002](adr/0002-request-time-rendering.md)).
