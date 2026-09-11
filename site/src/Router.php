<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * URL -> content.
 *
 * The request string never becomes a filesystem path. The category must be
 * identical to one declared in site.php — and Site has already dropped any
 * declaration that is not one segment of a URL; the slug is compared for
 * equality against the real filenames in that one directory, so a path
 * traversal has no expression here rather than being filtered out.
 */
final class Router
{
    /** @param array<string,mixed> $site */
    public function __construct(
        private readonly array $site,
        private readonly string $contentDir,
    ) {
    }

    /** @return array{status:int, title:string, body:string, active:?string, lang:string} */
    public function route(string $uri): array
    {
        /* parse_url returns false, not null, for a request line it cannot read
           at all — "//" is one, and a client may send it */
        $uri = trim((string) (parse_url($uri, PHP_URL_PATH) ?: ''), '/');

        if ($uri === '' || $uri === 'index') {
            return $this->home();
        }

        /* at most two segments; anything deeper is not a shape we serve */
        $parts = explode('/', $uri);
        if (count($parts) > 2) {
            return $this->notFound();
        }

        /* Only the category is checked for shape, because only the category
           becomes a directory name — and it does so only after matching one
           declared in site.php. The slug is compared for equality against the
           real file names in that directory, so a shape rule on it would not
           keep anything out; it would only make a document whose file name is
           spelled unusually unreachable while the listing still linked to it. */
        [$category, $slug] = [$parts[0], $parts[1] ?? null];

        if (!$this->isCategory($category)) {
            return $this->notFound();
        }

        return $slug === null
            ? $this->category($category)
            : $this->document($category, $slug);
    }

    private function isCategory(string $candidate): bool
    {
        return $this->categoryConfig($candidate) !== null;
    }

    /** @return array{slug:string, label:string, listing:bool}|null */
    private function categoryConfig(string $slug): ?array
    {
        foreach (Site::categories($this->site) as $c) {
            if ($c['slug'] === $slug) {
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
     * @param string $category one declared in site.php, or '' for the content
     *        root, which holds the homepage and nothing else
     * @return array{file:string, lang:string, languages:array<string,string>}|null
     */
    private function resolve(string $category, string $slug): ?array
    {
        $dir       = $category === '' ? $this->contentDir : $this->contentDir . '/' . $category;
        $urlPrefix = $category === '' ? '/' : '/' . $category . '/';

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
            'lang'  => Language::code($code, $default),
            'languages' => count($variants) > 1
                ? Language::addresses($base, $variants, $urlPrefix, $default)
                : [],
        ];
    }

    /** @return array{status:int, title:string, body:string, active:?string, lang:string} */
    private function document(string $category, string $slug): array
    {
        $found = $this->resolve($category, $slug);
        if ($found === null) {
            return $this->notFound();
        }

        $doc  = Document::load($found['file'], $category, $slug);
        $body = '<article class="doc">' . $doc->html($this->linkOpen()) . '</article>'
              . $this->docFooter($doc, $found['lang'], $found['languages']);

        return ['status' => 200, 'title' => $doc->title(), 'body' => $body,
                'active' => $category, 'lang' => $found['lang']];
    }

    /** @return array{status:int, title:string, body:string, active:?string, lang:string} */
    private function category(string $category): array
    {
        /* route() only gets here for a declared category, so the fallback is
           for a direct call, not for a request */
        $config = $this->categoryConfig($category) ?? ['label' => $category, 'listing' => true];
        $label  = $config['label'];

        $body = '';
        $intro = $this->resolve($category, 'index');
        if ($intro !== null) {
            $doc  = Document::load($intro['file'], $category, 'index');
            $body .= '<article class="doc intro">' . $doc->html($this->linkOpen()) . '</article>';
        } else {
            $body .= '<h1>' . e($label) . '</h1>';
        }

        if ($config['listing']) {
            $body .= $this->listing(Listing::forCategory($this->contentDir, $category, Site::languages($this->site)));
        }

        return ['status' => 200, 'title' => $label, 'active' => $category, 'body' => $body,
                'lang' => $intro['lang'] ?? Site::lang($this->site)];
    }

    /** @return array{status:int, title:string, body:string, active:?string, lang:string} */
    private function home(): array
    {
        $body = '';
        $intro = $this->resolve('', 'index');
        if ($intro !== null) {
            $doc  = Document::load($intro['file'], '', 'index');
            $body .= '<article class="doc intro">' . $doc->html($this->linkOpen()) . '</article>';
        } else {
            $body .= '<h1>' . e($this->title()) . '</h1>';
        }

        if (Site::lists($this->site)) {
            $body .= $this->listing(Listing::recent(
                $this->contentDir,
                Site::categories($this->site),
                Site::languages($this->site),
                Site::listingMax($this->site),
            ));
        }

        return ['status' => 200, 'title' => $this->title(), 'body' => $body, 'active' => null,
                'lang' => $intro['lang'] ?? Site::lang($this->site)];
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

    /** @return array{status:int, title:string, body:string, active:?string, lang:string} */
    private function notFound(): array
    {
        return [
            'status' => 404,
            'title'  => 'not found',
            'active' => null,
            'lang'   => Site::lang($this->site),
            'body'   => '<article class="doc"><h1>404</h1>'
                      . '<p>No document at that address.</p>'
                      . '<p><a href="/">back to the index</a></p></article>',
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

    /** The way back to the category, and the way across to another language.
     *  The date is under the title, with the rest of the document's meta.
     *
     * @param array<string,string> $languages */
    private function docFooter(Document $doc, string $lang, array $languages): string
    {
        return '<div class="doc-foot">'
             . '<a href="/' . e($doc->category) . '">← ' . e($doc->category) . '</a>'
             . self::languages($languages, $lang)
             . '</div>';
    }
}
