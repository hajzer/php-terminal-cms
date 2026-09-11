---
title: Install in five minutes
category: guides
date: 2026-09-09
---

# Install in five minutes

There is no installer, because there is nothing to install. You copy a directory and point a web server at one subdirectory of it.

## Unpack and configure

```console
$ tar xzf php-terminal-cms-*.tar.gz
$ cd php-terminal-cms-*/
$ cp site/site.php.example site/site.php
```

`site/site.php` is the only file that differs between two installations. It holds the title, the tagline, the accent colour, the footer and the category list.

```php
<?php
return [
    'title'   => 'my notes',
    'tagline' => 'kept in the open',
    'lang'    => 'en',
    'accent'  => '#21e08a',
    'listing' => true,
    'footer'  => [
        '[my notes](https://example.com/) · [write to me](mailto:you@example.com)',
        'Kept in the open since forever.',
    ],
    'categories' => [
        ['slug' => 'about',  'label' => 'about',  'listing' => true],
        ['slug' => 'guides', 'label' => 'guides', 'listing' => true],
    ],
];
```

The title and the tagline are the top bar. The footer is the one place on the page you write yourself: each string is one line, written in the same inline markdown a document uses — `[text](url)`, `**bold**`, `*italic*` — and escaped the same way. Leave it out and the page has no footer.

`listing` decides whether an index page prints the documents below it. The one at the top is the homepage; the one inside a category is that category's page. Set it to `false` where you would rather write the page yourself, and `index.md` is all that appears.

> [!NOTE]
> A category slug must match a directory under `site/content/`. A URL segment that is not in this list is a 404 even if the directory exists. The editor is not told the list: it takes whatever the document's `category:` meta line says, so that line and this one have to agree.

## Run it

```console
$ php -S localhost:8080 -t site/public site/public/index.php
```

```output
PHP 8.3 Development Server (http://localhost:8080) started
```

Open [http://localhost:8080](http://localhost:8080). The two example categories are already filled with the documents you are reading now — delete them when you have your own.

## Put it on a real server

Point the document root at `site/public` and nothing else. Everything the visitor may see is inside it; `content/`, `src/` and `site.php` sit one level above, unreachable by URL.

```nginx
server {
    server_name example.com;
    root /var/www/example.com/site/public;
    index index.php;
    location / { try_files $uri /index.php$is_args$args; }
}
```

Apache needs no configuration at all — `site/public/.htaccess` ships with the same rule.

## Check it

```console
$ php bin/test | tail -2
```

```output
201 passed, 0 failed
```

`bin/test` checks the two halves still agree with each other: that the PHP renderer and the JavaScript one read the same markdown into the same lines, that nothing escapes the escaper, and that the router refuses every path it should.
