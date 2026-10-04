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
    'theme'       => 'baseline',
    'palette'     => '',
    'listing'     => true,
    'listing_max' => 15,
    'link_open'   => 'here',
    'bundle'      => true,
    'logo'        => '/media/logo.png',
    'favicon'     => '/favicon.ico',
    'footer'      => [
        '[php-terminal-cms](https://example.com/) · [write to me](mailto:you@example.com)',
        'Written in the editor, published by copying a file.',
    ],
    'categories'  => [
        ['slug' => 'about',  'label' => 'about',  'listing' => true],
        ['slug' => 'guides', 'label' => 'guides', 'listing' => true, 'categories' => [
            ['slug' => 'hosting', 'label' => 'hosting', 'listing' => true],
        ]],
    ],
];
```

| key | does |
| --- | --- |
| `title` | brand in the top bar, `<title>` suffix, homepage heading |
| `tagline` | beside the brand in the top bar, and `<meta name="description">` |
| `lang` | the language the site is written in — see below |
| `languages` | the other languages a document may be written in — see below |
| `theme` | the Theme every page is drawn in, unless its Document names one — see below |
| `palette` | `light` or `dark`: how a page opens for a reader who has never chosen — see below |
| `listing` | whether the homepage lists documents — see below |
| `listing_max` | how many documents the homepage lists — see below |
| `link_open` | whether a link that leaves the site opens in a new tab — see below |
| `bundle` | whether pages offer their Bundle, the ZIP of their source — see below |
| `logo` | a picture in the brand link, in front of the title — see below |
| `favicon` | the icon in the reader's tab — see below |
| `footer` | the whole footer — see below |
| `categories` | see below |

A release that reads a new key does not need this file rewritten. `php
site/migrate` inserts each key the release's example declares and this file
lacks, with its documentation and commented out, and names each key the file
sets that the release does not read — see
[deploy.md](deploy.md#upgrading).

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
lists recent documents from every category and sub-category, and a category
page lists its own. A [Series](#series) is the exception: it is one row in
place of its documents, and its own page lists them by name.
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

## Bundles

A Document page carries `↓ bundle` in its foot, and a category page carries it
under its Sub-categories. It is a plain link to the page's own address with
`.zip` on it — `/guides/install.zip`, `/guides.zip`, `/guides/php.zip` — and
the ZIP there is a **Bundle**: one directory, named after the document or the
category path (`guides-php`), holding

```output
README.txt
editor/                          the Editor, from site/editor/
site/content/<path>.md           each document, in every language it is Published in
site/public/media/<path>/        each document's pictures
```

A category's Bundle holds its `index.md`, its documents and its
Sub-categories' documents, each with its pictures. Unzipped, `editor/index.html`
opens any of the `.md` files with **Open .md** and shows its pictures, offline.
The homepage has no Bundle.

```php
'bundle' => false,     /* true, or no key at all, is the default */
```

`false` turns Bundles off: no page carries the link, and every `.zip` address
is a 404. A document's own `bundle:` Meta beats it either way, so one document
can be offered on an instance that offers none, or held back on one that offers
all — see [format.md](format.md#bundle). A category's page follows its
`index.md`'s `bundle:`. Any value but `false` here, and any word but `true` or
`false` in the Meta, is no choice and falls through to the next.

A Bundle carries only what a reader can already read: nothing that is not
Published, no undeclared directory, and no document whose own Meta says
`bundle: false` — not even inside its category's Bundle. It is written as it is
sent, stored rather than compressed, and needs no PHP extension. Expect about
4 MB, most of it the Editor's copy of Mermaid.

## The logo

`logo` puts a picture in the brand link, in front of the title:

```php
'logo' => '/media/logo.png',
```

The file lives in `site/public/media/`, and the src is read the way a document's
image src is read, with no Document to own it: a local absolute path is used as
it stands, and anything else — a relative path, another origin, a climb out of
the root — is reduced to the file it names in `/media/` itself. The page's
Content-Security-Policy allows images from this site and nowhere else, so a logo
that named another origin would not have loaded even if it had been written out
— the reduction is what makes it a picture instead of a broken one. See
[security.md](security.md#the-renderer).

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

### Sub-categories

A category entry may carry `categories` of its own: its **Sub-categories**, one
level down, each a directory inside its parent's and declared exactly as a
category is — a `slug` spelled the same way, a `label`, a `listing`.

```php
'categories' => [
    ['slug' => 'guides', 'label' => 'guides', 'categories' => [
        ['slug' => 'php',   'label' => 'PHP'],
        ['slug' => 'shell', 'label' => 'the shell', 'listing' => false],
    ]],
],
```

`site/content/guides/php/intro.md` is read at `/guides/php/intro`, and says
`category: guides/php` in its Meta. `/guides/php` is the Sub-category's page:
its `index.md`, or its label as the heading, then its own documents.
`/guides` prints its `index.md`, then names its Sub-categories, then lists the
documents in `guides/` itself — a parent keeps documents of its own beside its
Sub-categories' directories, and each page lists only its own directory. The
homepage lists from every level, and a row names a Sub-category's document as
`guides/php`.

- There is **one level**: a Sub-category's own `categories` is ignored, and any
  address deeper than `/<category>/<sub-category>/<document>` is a 404.
- The **navigation names top-level categories only**; on a Sub-category's page
  and its documents, the parent is the one marked.
- A directory inside a category that is not declared here is a 404, exactly as
  an undeclared directory under `content/` is.
- A Sub-category whose slug is also a document's name in its parent **hides
  that document**: `/guides/php` is the Sub-category's page, and no listing
  names the document. `php bin/test`
  prints a `warn` line naming the hidden file, for the configuration in
  `site.php.example` and in `site.php`.

### Series

Some writing is one thing in several documents: a solution with its design
chapters, a subject with its lessons. A category that says `'series' => true`
makes each of its Sub-categories a **Series**, and each document in one a
**Part**:

```php
['slug' => 'solutions', 'label' => 'solutions', 'series' => true, 'categories' => [
    ['slug' => 'vault',  'label' => 'Vault'],
    ['slug' => 'consul', 'label' => 'Consul'],
]],
```

with `content/solutions/vault/index.md`, `01-use-cases.md`, `02-design.md`
and so on. A Series is a Sub-category in everything but how it is listed:

- **A Series is one row**, wherever a listing would have taken its Parts. The
  row is the Series' `index.md`: its `title`, its `date` and its languages.
  It leads to the Series' page, `/solutions/vault`, and names
  `solutions/vault`. Adding a Part does not move the row — the date is the
  `index.md`'s, and yours to change.
- **The homepage** lists that row and none of the Parts.
- **The category's page** lists its Series as rows among the documents it
  holds itself, by date, and does not name them above the listing. With
  `'listing' => false` it prints its `index.md` and nothing else.
- **The Series' page** lists its Parts **by name, ascending** — `01-…`,
  `02-…` is the reading order, whatever the dates say. Names are compared
  character by character, so `10-…` comes before `2-…`: write `02-…`. Its
  own `'listing' => false` still turns that listing off.
- **A Series with no published `index.md` has no row anywhere.** Its page and
  its Parts still answer at their addresses; nothing lists them. `php
  bin/test` prints a `warn` line naming the Series, for the configuration in
  `site.php.example` and in `site.php`.

The parent says it for all of its Sub-categories: a category does not mix
Series with ordinary Sub-categories, and `series` on a Sub-category's own
entry means nothing. Only exactly `true` makes Series; without the key, or
with any other value, the Sub-categories are listed as they are above.

Addresses, pictures, Bundles and `published` are a Sub-category's. Turning a
flat category into Series is moving files into directories, so a Part's
address changes — `/solutions/vault-01-use-cases` becomes
`/solutions/vault/01-use-cases` — and nothing redirects the old one.

### Published

A category entry, or a Sub-category's, may say `'published' => false`:

```php
['slug' => 'guides', 'label' => 'guides', 'categories' => [
    ['slug' => 'php', 'label' => 'PHP', 'published' => false],
]],
```

A category that is not Published is as if it were not declared: its page and
every document in it are a 404, the navigation and the listings leave it out,
its parent does not name it, no Bundle carries it, and a Page Build does not
write it. A top-level
category takes its Sub-categories with it, whatever they say.

Only no `published` at all, or exactly `true`, publishes. **Every other value
does not** — `false`, `0`, `null`, and the strings `'no'` and `'true'` alike.
It is the one setting here that fails closed, where every other key falls
back to its default: a mistake should keep a section off the site, not
release it.

A Sub-category that is not Published no longer takes its address from its
parent: a document in the parent with the same name, which the Sub-category
had shadowed, is read there again and listed.

Not Published is not secret: the files are still under `content/` on the
server and in the repository, and anyone who can read either reads them. A
single document says it is not Published in its own `published:` Meta — see
[format.md](format.md#published).

A fresh installation ships with `about` and `guides`, and `hosting` inside
`guides`, each holding example documents about the software itself. Delete them
once you have your own — they are content, not code.

## Themes

There are twelve Themes, each drawn in two Palettes, light and dark;
[themes.md](themes.md) lists them and where each comes from. A page is drawn
in one Theme and opens in one Palette, and each is decided by the first party
that names a real one:

- **Theme**: the Document's `theme:` Meta, else `theme` here, else `baseline`.
  The reader has no Theme control.
- **Palette**: the reader's own choice, made with the light/dark button and
  remembered in their browser; else the Document's `palette:` Meta; else
  `palette` here; else whatever the reader's browser asks for through
  `prefers-color-scheme`.

`theme` is a Theme's name as its file in `site/public/themes/` is named —
`things`, `shimmering-focus` — and `palette` is `light` or `dark`. A name that
is no Theme, or a word that is neither, is not a choice: the next party
decides, silently, and a page never fails over a spelling. `''` or no
`palette` at all leaves the Palette to the reader's browser.

A 404 and a Category with no `index.md` have no Document, and take what this
file says. An `accent` left in a `site.php` from before the Themes is
ignored like any key this file does not list: a Theme owns its colours.
`php site/migrate` names it as not read.

A Theme's colours, faces, corner and heading weight are in
`shared/themes/<name>.json`; `php bin/build` writes it into a stylesheet for
both the site and the editor. `shared/theme.css` is the structure every Theme
draws, and the tokens a Theme defines are listed at the top of it.

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
the file belongs in: `category: guides/php` is `content/guides/php/`.
Getting the slug right is the writer's job, the same as getting the title right,
and the site 404s a category it does not have.

The starter document it opens with is the `<script type="text/markdown">` block
at the bottom of `editor/index.html`. Replace it with whatever your writers
should see on a blank page.

Everything the editor remembers — Palette, content size, which pane layout
you left it in — lives in the browser's `localStorage`, per browser, and never
travels anywhere.
