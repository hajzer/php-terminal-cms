<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * URL -> content.
 *
 * The request string never becomes a filesystem path. The category must be
 * identical to one declared in site.php, and a Sub-category to one declared
 * inside it — and Site has already dropped any declaration that is not one
 * segment of a URL; the slug is compared for equality against the real
 * filenames in that one directory, so a path traversal has no expression here
 * rather than being filtered out.
 *
 * A page's address with `.zip` on its last segment is the page's Bundle: the
 * rest is resolved exactly as the page is, and is a 404 where the page would
 * be one or where it does not offer its Bundle.
 */
final class Router
{
    /**
     * @param array<string,mixed> $site
     * @param BasePath $at where the site begins, which every address the
     *        router writes into a page is written under
     */
    public function __construct(
        private readonly array $site,
        private readonly string $contentDir,
        private readonly BasePath $at = new BasePath(),
    ) {
    }

    /** @return array{status:int, title:string, body:string, active:?string, lang:string, meta?:array<string,string>, bundle?:Bundle} */
    public function route(string $uri): array
    {
        /* parse_url returns false, not null, for a request line it cannot read
           at all — "//" is one, and a client may send it */
        $uri = trim((string) (parse_url($uri, PHP_URL_PATH) ?: ''), '/');

        $zip = str_ends_with($uri, '.zip');
        if ($zip) {
            $uri = substr($uri, 0, -strlen('.zip'));
        }

        if ($uri === '' || $uri === 'index') {
            return $zip ? $this->notFound() : $this->home();      /* the homepage has no Bundle */
        }

        /* at most three segments — a Category, a Sub-category of it, and a
           Document; anything deeper is not a shape we serve */
        $parts = explode('/', $uri);
        if (count($parts) > 3) {
            return $this->notFound();
        }

        /* Only a Category and a Sub-category become directory names, and each
           does so only by being identical to one declared in site.php — which
           Site has already held to the shape of one. The last segment, when it
           is a Document, is compared for equality against the real file names
           in that directory, so a shape rule on it would not keep anything
           out; it would only make a document whose file name is spelled
           unusually unreachable while the listing still linked to it. */
        $category = self::declared(Site::categories($this->site), $parts[0]);
        if ($category === null) {
            return $this->notFound();
        }
        if (count($parts) === 1) {
            return $this->category($category, $zip);
        }

        /* the second segment is a Sub-category's page when one is declared by
           that name — a Document of the same name in the parent is shadowed —
           and a Document in the Category otherwise */
        $sub = self::declared($category['categories'], $parts[1]);

        if (count($parts) === 2) {
            return $sub !== null
                ? $this->category($sub, $zip)
                : $this->document($category['path'], $parts[1], $zip);
        }

        return $sub !== null
            ? $this->document($sub['path'], $parts[2], $zip)
            : $this->notFound();
    }

    /**
     * The declaration in a list whose slug is identical to a segment of the
     * request, or null.
     *
     * @param list<array{slug:string, label:string, listing:bool, path:string, series:bool, categories:list<array<string,mixed>>}> $declared
     * @return array{slug:string, label:string, listing:bool, path:string, series:bool, categories:list<array<string,mixed>>}|null
     */
    private static function declared(array $declared, string $segment): ?array
    {
        foreach ($declared as $c) {
            if ($c['slug'] === $segment) {
                return $c;
            }
        }
        return null;
    }

    /**
     * The only place a content path is built, and every component of it comes
     * from site.php or from scandir() — never from the request.
     *
     * A slug addresses a Document, not a file: the bare slug is the site's own
     * language and `<slug>-sk` is the Slovak of it, which is a 404 unless that
     * Slovak exists — one Document is never two addresses. A file whose name
     * carries no suffix is in the site's own language and answers to its own
     * name.
     *
     * @param string $category the path of a Category or Sub-category declared in
     *        site.php — `guides` or `guides/php` — or '' for the content root,
     *        which holds the homepage and nothing else
     * @return array{file:string, base:string, lang:string, languages:array<string,string>}|null
     */
    private function resolve(string $category, string $slug): ?array
    {
        $dir = $category === '' ? $this->contentDir : $this->contentDir . '/' . $category;

        if (!is_dir($dir)) {
            return null;      /* a category declared in site.php with nothing behind it */
        }

        $codes    = Site::languages($this->site);
        $default  = $codes[0];
        [$base, $want] = Language::split($slug, $codes);

        /* the site's own language is the bare slug, and only that: a file
           named with its suffix answers there, as the listing says it does,
           and not at a second address as well */
        if ($want === $default) {
            return null;
        }

        $variants = Listing::variants($dir, $base, $codes);
        if ($variants === []) {
            return null;
        }

        if (isset($variants[$want])) {
            $code = $want;
        } elseif ($want !== '') {
            return null;      /* a language this document was never written in */
        } elseif (isset($variants[$default])) {
            /* the bare slug is the site's own language, on a site where every
               file carries a suffix — including that one */
            $code = $default;
        } else {
            return null;      /* written, but not in the language asked for */
        }

        return [
            'file'  => $dir . '/' . $variants[$code],
            'base'  => $base,
            'lang'  => Language::code($code, $default),
            'languages' => count($variants) > 1
                ? Language::addresses($base, $variants, $category, $default, $this->at)
                : [],
        ];
    }

    /**
     * A Document's page, or with $zip its Bundle.
     *
     * @return array{status:int, title:string, body:string, active:?string, lang:string, meta?:array<string,string>, bundle?:Bundle}
     */
    private function document(string $category, string $slug, bool $zip = false): array
    {
        $found = $this->resolve($category, $slug);
        if ($found === null) {
            return $this->notFound();
        }

        if ($zip) {
            $meta = Document::peekMeta($found['file']);
            return $this->offers($meta, $found['base'])
                ? $this->bundle(Bundle::document($this->contentDir, Site::languages($this->site), $category, $found['base']),
                                $category, $found['lang'])
                : $this->notFound();
        }

        $doc  = Document::load($found['file'], $category, $slug, $found['base']);
        $body = '<article class="doc">' . $doc->html($this->linkOpen(), $this->at) . '</article>'
              . $this->docFooter($doc, $found['lang'], $found['languages'], $this->offers($doc->meta, $found['base']));

        return ['status' => 200, 'title' => $doc->title(), 'body' => $body,
                'active' => $category, 'lang' => $found['lang'], 'meta' => $doc->meta];
    }

    /**
     * A Category's page, or a Sub-category's: its index.md or its label, the
     * Sub-categories it declares, the way to its Bundle, and its Listing.
     * Series are rows of that Listing, and not named above it. With $zip,
     * the Bundle. Whether it is offered is its index.md's to say, as the
     * rest of what the page does is.
     *
     * @param array{label:string, listing:bool, path:string, series:bool, categories:list<array{slug:string, label:string, path:string, series:bool}>} $declared
     *        as Site::categories() declares it
     * @return array{status:int, title:string, body:string, active:?string, lang:string, meta?:array<string,string>, bundle?:Bundle}
     */
    private function category(array $declared, bool $zip = false): array
    {
        $path  = $declared['path'];
        $label = $declared['label'];

        $intro = $this->resolve($path, 'index');
        if ($zip) {
            $meta = $intro === null ? [] : Document::peekMeta($intro['file']);
            return $this->offers($meta, Bundle::top($path))
                ? $this->bundle(Bundle::category($this->contentDir, Site::languages($this->site), $declared,
                                                 $meta['title'] ?? $label),
                                $path, $intro['lang'] ?? Site::lang($this->site))
                : $this->notFound();
        }

        $body = '';
        $meta = [];
        if ($intro !== null) {
            $doc  = Document::load($intro['file'], $path, 'index', $intro['base']);
            $meta = $doc->meta;
            $body .= '<article class="doc intro">' . $doc->html($this->linkOpen(), $this->at) . '</article>';
        } else {
            $body .= '<h1>' . e($label) . '</h1>';
        }

        $items = '';
        foreach ($declared['categories'] as $sub) {
            if (!$sub['series']) {
                $items .= '<li><a href="' . e($this->at->page($sub['path'])) . '">' . e($sub['label']) . '</a></li>';
            }
        }
        if ($items !== '') {
            $body .= '<ul class="sub-categories">' . $items . '</ul>';
        }

        if ($this->offers($meta, Bundle::top($path))) {
            $body .= '<p class="bundle">' . $this->bundleLink($path) . '</p>';
        }

        if ($declared['listing']) {
            $body .= $this->listing(Listing::forPage($this->contentDir, $declared, Site::languages($this->site), $this->at));
        }

        return ['status' => 200, 'title' => $label, 'active' => $path, 'body' => $body,
                'lang' => $intro['lang'] ?? Site::lang($this->site), 'meta' => $meta];
    }

    /** @return array{status:int, title:string, body:string, active:?string, lang:string, meta?:array<string,string>} */
    private function home(): array
    {
        $body = '';
        $meta = [];
        $intro = $this->resolve('', 'index');
        if ($intro !== null) {
            $doc  = Document::load($intro['file'], '', 'index', $intro['base']);
            $meta = $doc->meta;
            $body .= '<article class="doc intro">' . $doc->html($this->linkOpen(), $this->at) . '</article>';
        } else {
            $body .= '<h1>' . e($this->title()) . '</h1>';
        }

        if (Site::lists($this->site)) {
            $body .= $this->listing(Listing::recent(
                $this->contentDir,
                Site::everyCategory($this->site),
                Site::languages($this->site),
                Site::listingMax($this->site),
                $this->at,
            ));
        }

        return ['status' => 200, 'title' => $this->title(), 'body' => $body, 'active' => null,
                'lang' => $intro['lang'] ?? Site::lang($this->site), 'meta' => $meta];
    }

    /**
     * Whether a page offers its Bundle: what Site::bundles() says for its
     * Meta, and only when the name the Bundle unpacks under is one a ZIP
     * can hold.
     *
     * @param array<string,string> $meta
     */
    private function offers(array $meta, string $top): bool
    {
        return Site::bundles($this->site, $meta) && Zip::isName($top);
    }

    /** @return array{status:int, title:string, body:string, active:?string, lang:string, bundle:Bundle} */
    private function bundle(Bundle $bundle, string $active, string $lang): array
    {
        return ['status' => 200, 'title' => $bundle->filename(), 'body' => '', 'active' => $active,
                'lang' => $lang, 'bundle' => $bundle];
    }

    /** The way to a page's Bundle, from the page's path. */
    private function bundleLink(string $path): string
    {
        return '<a href="' . e($this->at->bundle($path)) . '">↓ bundle</a>';
    }

    private function title(): string
    {
        return (string) ($this->site['title'] ?? 'php-terminal-cms');
    }

    /** Where a link to another site opens, for every document this router renders. */
    private function linkOpen(): string
    {
        return Site::linkOpen($this->site);
    }

    /** @return array{status:int, title:string, body:string, active:?string, lang:string, meta?:array<string,string>} */
    private function notFound(): array
    {
        return [
            'status' => 404,
            'title'  => 'not found',
            'active' => null,
            'lang'   => Site::lang($this->site),
            'body'   => '<article class="doc"><h1>404</h1>'
                      . '<p>No document at that address.</p>'
                      . '<p><a href="' . e($this->at->page('')) . '">back to the index</a></p></article>',
        ];
    }

    /** @param list<Entry> $entries */
    private function listing(array $entries): string
    {
        if ($entries === []) {
            return '<p class="empty">Nothing here yet.</p>';
        }

        $rows = '';
        foreach ($entries as $entry) {
            $rows .= '<li><a class="row" href="' . e($entry->url()) . '">'
                   . '<time>' . e($entry->date ?: '—') . '</time>'
                   . '<span class="t">' . e($entry->title) . '</span>'
                   . '<span class="c">' . e($entry->category) . '</span>'
                   . '</a>' . self::languages($entry->languages, $entry->lang) . '</li>';
        }

        return '<ul class="listing">' . $rows . '</ul>';
    }

    /**
     * The languages one document exists in — the one being read, and the way
     * to each of the others. A document that exists in one language has no
     * indicator, which is every document on a site that has never translated
     * anything.
     *
     * @param array<string,string> $languages code => URL, in the declared order
     */
    private static function languages(array $languages, string $current): string
    {
        if (count($languages) < 2) {
            return '';
        }

        $parts = [];
        foreach ($languages as $code => $url) {
            $on = (string) $code === $current ? ' class="on"' : '';
            $parts[] = '<a href="' . e($url) . '"' . $on . '>' . e(Language::label((string) $code)) . '</a>';
        }

        return '<span class="languages">(' . implode(' <i>|</i> ', $parts) . ')</span>';
    }

    /** The way back to the category, the way to the Document's Bundle, and the
     *  way across to another language. The date is under the title, with the
     *  rest of the document's meta.
     *
     * @param array<string,string> $languages */
    private function docFooter(Document $doc, string $lang, array $languages, bool $bundle): string
    {
        return '<div class="doc-foot">'
             . '<a href="' . e($this->at->page($doc->category)) . '">← ' . e($doc->category) . '</a>'
             . ($bundle ? $this->bundleLink($doc->category . '/' . $doc->slug) : '')
             . self::languages($languages, $lang)
             . '</div>';
    }
}
