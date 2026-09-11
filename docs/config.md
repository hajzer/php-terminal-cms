# Configuration

One file per instance: `site/site.php`. Copy it from `site/site.php.example` and
edit. It is the only file that differs between two installations of the same
code, and it is deliberately excluded from the repository and the package.

```php
<?php
return [
    'title'       => 'php-terminal-cms',
    'tagline'     => 'a document is an ordered sequence of typed lines',
    'lang'        => 'en',
    'languages'   => ['sk'],
    'accent'      => '#d9a05f',
    'listing'     => true,
    'listing_max' => 15,
    'link_open'   => 'here',
    'logo'        => '/media/logo.png',
    'favicon'     => '/favicon.ico',
    'footer'      => [
        '[php-terminal-cms](https://example.com/) · [write to me](mailto:you@example.com)',
        'Written in the editor, published by copying a file.',
    ],
    'categories'  => [
        ['slug' => 'about',  'label' => 'about',  'listing' => true],
        ['slug' => 'guides', 'label' => 'guides', 'listing' => true],
    ],
];
```

| key | does |
| --- | --- |
| `title` | brand in the top bar, `<title>` suffix, homepage heading |
| `tagline` | beside the brand in the top bar, and `<meta name="description">` |
| `lang` | the language the site is written in — see below |
| `languages` | the other languages a document may be written in — see below |
| `accent` | one `#rrggbb` colour: links, prompts, the active nav item, note borders — see below |
| `listing` | whether the homepage lists documents — see below |
| `listing_max` | how many documents the homepage lists — see below |
| `link_open` | whether a link that leaves the site opens in a new tab — see below |
| `logo` | a picture in the brand link, in front of the title — see below |
| `favicon` | the icon in the reader's tab — see below |
| `footer` | the whole footer — see below |
| `categories` | see below |

## The tagline

`tagline` is one line of description. It sits beside the title in the top bar,
where a reader sees it on every page, and it is the page's
`<meta name="description">`. A narrow screen drops it and keeps the navigation.

An instance that leaves it out has neither: no second line in the top bar, and
no description element.

## Languages

`lang` is the language the site is written in. It is the `<html lang>` of a
page, and it is the language of every document whose file name carries no
suffix.

`languages` is every other language a document may be written in. A document's
language is the suffix on its file name:

```
content/about/what-it-is.md        English, because 'lang' => 'en'
content/about/what-it-is-sk.md     the Slovak of the same document
```

Those two files are one document. The listing prints it once, in the site's own
language, with the languages it exists in beside it:

```
2026-09-07  What php-terminal-cms is   about   (EN | SK)
```

The one being read is marked; the others are links. A document that exists in
one language has no indicator at all, which is every document on a site that
has never translated anything.

The addresses follow the names: `/about/what-it-is` is the English and
`/about/what-it-is-sk` the Slovak. A language a document was not written in is
a 404 — one document has one address per language and no others.

A suffix is a language **only if it is declared here**. `what-it-is` ends in
`-is`, which is Icelandic, and `install-in-five-minutes` ends in `-es`: a site
that has not named those languages has documents with long names, which is what
they are. Leave `languages` out and a site has one language and file names mean
what they always did.

A category's `index.md` is its introduction, in any language: `index-sk.md` is
read on a Slovak site and never listed.

Do not write both `hello.md` and `hello-en.md` on a site whose `lang` is `en`.
They are two files claiming one language: they stay one document, and the name
without the suffix is the one the address belongs to.

## The listings

An index page ends with the documents below it, newest first — the homepage
lists recent documents from every category, and a category page lists its own.
`listing` turns that off:

```php
'listing' => false,                                     /* the homepage */
'categories' => [
    ['slug' => 'about',  'label' => 'about', 'listing' => false],
    ['slug' => 'guides', 'label' => 'guides'],          /* left on */
],
```

The top-level key is the homepage's; the one inside a category entry is that
category's page. They are independent — a homepage that only says what the site
is can sit above categories that all list, and one category can be a hand-written
page while its neighbour lists.

Switched off, the index page is its `index.md` and nothing else: no list, and no
"nothing here yet" where the list would have been. The documents are still
routable and still reachable by any link written to them; only the automatic list
is gone.

A `site.php` that does not name the setting gets it on.

### How many the homepage lists

`listing_max` is the length of the homepage list:

```php
'listing_max' => 15,     /* the default */
'listing_max' => 5,      /* the five newest, from every category */
'listing_max' => 0,      /* every document there is */
```

A whole number of at least one prints that many documents; `0` prints all of
them. Anything that is not a count — a negative, a fraction, a word — prints
fifteen, because a homepage with no list on it is not what any of them asked
for.

A **category page is never capped**: it prints its whole category. A category is
a finite thing an author chose the size of, and a document cut off a category
listing has nowhere else to be listed. `listing_max` also does nothing when
`listing` is `false`, because there is no list to be the length of.

## Where a link opens

A link that leaves the site can open in the reader's tab or in a new one:

```php
'link_open' => 'tab',     /* 'here' is the default */
```

`'tab'` puts `target="_blank"` on every link whose target names `http` or
`https` — the same links that already carry `rel="noopener noreferrer"`. A local
path, a fragment and a `mailto:` address never open a new tab, whatever the
setting says. It is the scheme that is judged and not the host, because the site
is never told its own name: a link written as a full `https://` address to this
very site is a link that leaves, and opens like one. Any value other than
`'tab'`, named or not, is `'here'`.

The editor is never told this. Its preview shows the `'here'` rendering, which
is the same markup with one attribute fewer.

## The logo

`logo` puts a picture in the brand link, in front of the title:

```php
'logo' => '/media/logo.png',
```

The file lives in `site/public/media/`, and the src is read the way a document's
image src is read: a local absolute path is used as it stands, and anything else
— a relative path, another origin, a climb out of the root — is reduced to the
file it names under `/media/`. The page's Content-Security-Policy allows images
from this site and nowhere else, so a logo that named another origin would not
have loaded even if it had been written out — the reduction is what makes it a
picture instead of a broken one. See [security.md](security.md#the-renderer).

`title` is unchanged and still does everything it did: it fills `<title>`, it is
the writing in the brand link beside the picture, it is the homepage heading,
and it is the logo's `alt` — so an instance is named whether or not the picture
loads. The height is capped in CSS to the top bar's line, so a file of any size
fits.

Leave `logo` out and the brand link is the title alone, byte for byte as before.

## The favicon

`favicon` is the icon a browser shows in the tab:

```php
'favicon' => '/favicon.ico',
```

The src is read the way `logo`'s is, by the one rule this software has about
what a configured path may be: an absolute path addresses the document root and
stands as it is, and anything else — a relative path, another origin, a climb
out of the root — is reduced to the file it names under `/media/`. That is why
`/favicon.ico` is expressible: it is the file every browser asks for whether or
not a page names one, it sits at the document root, and the web server hands it
back as a static file with no PHP in the path.

The link carries a `type` when the file's extension is one of `.ico`, `.png`,
`.svg`, `.gif`, `.jpg`, `.jpeg` or `.webp` — an SVG icon wants one. An extension
this software does not know emits the link without a type rather than guessing
at one.

Saying nothing and saying none are different answers:

- leave `favicon` out and a page carries `/favicon.ico`, the icon the archive
  ships in `site/public/`, so a fresh installation has one without being
  configured;
- name an empty string and a page carries no `<link rel="icon">` at all.

One icon, one link. There are no touch icons, no manifest and no per-page
override, and the software never generates, resizes or converts the file — the
icon a page names is the file you put there.

## The footer

`footer` is the only writing on the page that is not a document, and it is the
only thing in the footer: the title and the tagline are in the top bar and are
not repeated at the foot. The lines are centred.

One string is one line; a list is several lines, in order:

```php
'footer' => [
    '[my notes](https://example.com/) is powered by **[php-terminal-cms](https://example.com/cms)**',
    '© 2026 · [imprint](/about/imprint) · [write to me](mailto:you@example.com)',
],
```

Each line is written in the same inline markdown a document uses —
`[text](url)`, `**bold**`, `*italic*`, `` `code` `` — and goes through the same
escaping and the same link allowlist (`http://`, `https://`, `mailto:` to an
address, a local absolute path, a fragment). A footer cannot put markup on the
page any more than a document can, so `<a href=…>` written by hand appears as
text, not as a link — and neither can it reach another origin through a target
that only looks local, such as `//example.com`. See
[security.md](security.md#the-renderer).

Leave `footer` out, or set it to `''`, and the page has no footer element at
all — no empty rule across the bottom of the page.

## Categories

`categories` is **both** the navigation and the routable surface. A URL segment
that is not a `slug` in this list is a 404 even when the directory exists — so
an unfinished category can sit in `content/` unlisted and unreachable until you
add it here.

Each `slug` must match a directory under `site/content/`, so it is spelled like
a directory name: lower case, starting with a letter or a digit, then letters,
digits, `-` and `_`. An entry that is not that shape is not a category — it
disappears from the navigation and its address is a 404, rather than becoming a
path. The `label` is where the writing goes: it can differ from the slug, and
can be anything, which is how a `/coffee` category can display as
*ranná káva*.

A slug with no directory behind it is navigable but empty: the category page
says there is nothing there, and every document address under it is a 404.

A fresh installation ships with `about` and `guides`, each holding example
documents about the software itself. Delete them once you have your own — they
are content, not code.

## The accent

`accent` is one colour, written as six hexadecimal digits: `#d9a05f`,
`#3f7cac`, `#ABCDEF`. It is the only setting that reaches the page as CSS
rather than as writing, so it is the only one with a shape it has to keep —
`red`, `#fff` and `rgb(217,160,95)` are all rejected in favour of the default.
Everything else in the file is text, and text is escaped.

## Themes

Two, normal and dark. There is no third "follow the system" setting to
configure: a visitor who has expressed no preference gets whichever their OS
asks for via `prefers-color-scheme`, and the toggle in the top bar overrides
that and is remembered in their browser.

To change the palette, edit `shared/theme.css` and run `php bin/build` — it is
the single source for both the site and the editor. The custom properties are at
the top of the file; everything below them is structure.

## The editor

The editor has no configuration at all: it is a static page, with nothing to
read a config from and nothing an instance needs to tell it. The version in its
top bar is the one in `VERSION`, written into `editor/index.html`; `bin/test`
fails if the two ever disagree.

Its mark and the icon in its tab are files beside it — `editor/logo.png` and
`editor/favicon.ico` — rather than settings, because an instance has an identity
of its own and the editor has none to have. Both are named by a relative path,
so they resolve when the page is opened from the filesystem; changing either is
replacing the file.

It does not know the category list — a document's category is a `category:`
meta line like any other, and the editor only reads it to say which directory
the file belongs in.
Getting the slug right is the writer's job, the same as getting the title right,
and the site 404s a category it does not have.

The starter document it opens with is the `<script type="text/markdown">` block
at the bottom of `editor/index.html`. Replace it with whatever your writers
should see on a blank page.

Everything the editor remembers — theme, content size, which pane layout
you left it in — lives in the browser's `localStorage`, per browser, and never
travels anywhere.
