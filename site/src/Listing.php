<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * An entry in a category or homepage listing.
 *
 * Its category is the path of the Category the Document is in — `guides`, or
 * `guides/php` for a Sub-category's — which is what the row names and what
 * its address begins with.
 *
 * One entry is one Document, not one file: a document that exists in three
 * languages is one line in the listing, printed in the site's own language,
 * with the three addresses beside it.
 *
 * A Series' entry is its index.md's: its category is the Series' path, its
 * slug the Series' own, and it leads to the Series' page rather than to the
 * index.md as a Document.
 */
final class Entry
{
    /**
     * @param string $slug the address of the language this entry is printed in
     * @param string $lang the code of that language, '' when the site has one
     * @param array<string,string> $languages code => URL, in the declared order —
     *        empty unless this document exists in more than one language
     * @param BasePath $at where the site begins, which the URLs are written under
     * @param ?string $page the path of the page the entry leads to, when that
     *        is not its Document's own
     */
    public function __construct(
        public readonly string $category,
        public readonly string $slug,
        public readonly string $title,
        public readonly string $date,
        public readonly string $lang = '',
        public readonly array $languages = [],
        private readonly BasePath $at = new BasePath(),
        private readonly ?string $page = null,
    ) {
    }

    public function url(): string
    {
        return $this->at->page($this->page ?? $this->category . '/' . $this->slug);
    }
}

final class Listing
{
    /**
     * Every language one document is Published in, in the order the site
     * declares them. The key is the code, or '' for a file with no suffix;
     * the value is the file name. A base with no such file is an empty array.
     *
     * @param list<string> $codes
     * @return array<string,string>
     */
    public static function variants(string $dir, string $base, array $codes): array
    {
        return self::documents($dir, $codes)[$base] ?? [];
    }

    /**
     * Every Published document in a directory, by the document it is a
     * version of. A file that is not Published is not here, so it is in no
     * Listing, at no address, and no other Language of it names it.
     *
     * @param list<string> $codes
     * @return array<string, array<string,string>> base => code => file name,
     *         the codes in the declared order and '' — a file with no suffix —
     *         first
     */
    public static function documents(string $dir, array $codes): array
    {
        $found = [];
        foreach (scandir($dir) ?: [] as $name) {
            if (!str_ends_with($name, '.md') || !Document::published($dir . '/' . $name)) {
                continue;
            }
            [$base, $code] = Language::split(substr($name, 0, -3), $codes);
            $found[$base][$code] = $name;
        }

        $out = [];
        foreach ($found as $base => $files) {
            foreach (array_merge([''], $codes) as $code) {
                if (isset($files[$code])) {
                    $out[(string) $base][$code] = $files[$code];
                }
            }
        }
        return $out;
    }

    /**
     * Every document in one Category or Sub-category, newest first. index.md is
     * the category's own introduction, not an entry in its own listing — in any
     * language. A Sub-category's directory is not read here: its Documents are
     * on its own page. Nor is a Document whose address a Sub-category of the
     * same name answers, since a row for it would lead to that Sub-category.
     *
     * @param string $category the Category's path under content/, as
     *        Site::categories() declares it
     * @param list<string> $codes the declared languages, the site's own first
     * @param BasePath $at where the site begins, which the entries' URLs are
     *        written under
     * @param list<string> $subCategories the slugs of the Sub-categories the
     *        Category declares
     * @return list<Entry>
     */
    public static function forCategory(
        string $contentDir,
        string $category,
        array $codes = [],
        BasePath $at = new BasePath(),
        array $subCategories = [],
    ): array {
        return self::newestFirst(array_values(self::entries($contentDir, $category, $codes, $at, $subCategories)));
    }

    /**
     * The Listing a Category's page prints, or a Sub-category's. A Series'
     * is its Parts by Name, ascending, whatever their dates. A Category
     * whose Sub-categories are Series lists each as one row among its own
     * Documents, newest first; any other page's is forCategory().
     *
     * @param array{path:string, series:bool, categories:list<array{slug:string, label:string, path:string, series:bool}>} $declared
     *        as Site::categories() declares it
     * @param list<string> $codes the declared languages, the site's own first
     * @param BasePath $at where the site begins — forCategory()
     * @return list<Entry>
     */
    public static function forPage(string $contentDir, array $declared, array $codes, BasePath $at = new BasePath()): array
    {
        $entries = self::entries($contentDir, $declared['path'], $codes, $at, array_column($declared['categories'], 'slug'));
        if ($declared['series']) {
            ksort($entries, SORT_STRING);
            return array_values($entries);
        }

        $entries = array_values($entries);
        foreach ($declared['categories'] as $sub) {
            $row = $sub['series'] ? self::series($contentDir, $sub, $codes, $at) : null;
            if ($row !== null) {
                $entries[] = $row;
            }
        }
        return self::newestFirst($entries);
    }

    /**
     * A Series' one row: its Published index.md's title, date and Languages,
     * in the Language any row is printed in, leading to the Series' page.
     * The site's own Language of it is read on that page, and each other at
     * the address the index.md has as a Document. Null for a Series with no
     * Published index.md, which no Listing names.
     *
     * @param array{slug:string, label:string, path:string} $declared the Series, as
     *        Site::categories() declares it
     * @param list<string> $codes the declared languages, the site's own first
     * @param BasePath $at where the site begins — forCategory()
     */
    public static function series(string $contentDir, array $declared, array $codes, BasePath $at = new BasePath()): ?Entry
    {
        $path = $declared['path'];
        $dir  = $contentDir . '/' . $path;
        $variants = is_dir($dir) ? self::variants($dir, 'index', $codes) : [];
        if ($variants === []) {
            return null;
        }
        $default = $codes[0] ?? Site::LANG;
        $code = self::printed($variants, $default);
        $meta = Document::peekMeta($dir . '/' . $variants[$code]);

        $addresses = Language::addresses('index', $variants, $path, $default, $at);
        if (isset($addresses[$default])) {
            $addresses[$default] = $at->page($path);
        }
        $one = count($addresses) < 2;

        return new Entry(
            $path,
            $declared['slug'],
            $meta['title'] ?? $declared['label'],
            $meta['date'] ?? '',
            $one ? '' : Language::code($code, $default),
            $one ? [] : $addresses,
            $at,
            $path,
        );
    }

    /**
     * Every Document in one directory as an entry, by its Name without its
     * Language, in no order — what forCategory() describes, before it is
     * sorted.
     *
     * @param list<string> $codes
     * @param list<string> $subCategories
     * @return array<string,Entry>
     */
    private static function entries(string $contentDir, string $category, array $codes, BasePath $at, array $subCategories): array
    {
        $dir = $contentDir . '/' . $category;
        if (!is_dir($dir)) {
            return [];
        }
        $default = $codes[0] ?? Site::LANG;

        $entries = [];
        foreach (self::documents($dir, $codes) as $base => $variants) {
            $base = (string) $base;    /* a name that is all digits is a string here */
            /* index.md is the category's own introduction, in any language */
            if ($base === 'index') {
                continue;
            }

            $code = self::printed($variants, $default);
            $slug = Language::slug($base, $code, $default);
            if (in_array($slug, $subCategories, true)) {
                continue;
            }
            $meta = Document::peekMeta($dir . '/' . $variants[$code]);

            $addresses = Language::addresses($base, $variants, $category, $default, $at);
            $one   = count($addresses) < 2;

            $entries[$base] = new Entry(
                $category,
                $slug,
                $meta['title'] ?? $base,
                $meta['date'] ?? '',
                $one ? '' : Language::code($code, $default),
                $one ? [] : $addresses,
                $at,
            );
        }
        return $entries;
    }

    /**
     * The Language a row is printed in: the site's own, and whatever the
     * Document was written in when that is not one of them.
     *
     * @param non-empty-array<string,string> $variants code => file name, as documents() returns them
     */
    private static function printed(array $variants, string $default): string
    {
        return isset($variants['']) ? '' : (isset($variants[$default]) ? $default : (string) array_key_first($variants));
    }

    /**
     * @param list<Entry> $entries
     * @return list<Entry>
     */
    private static function newestFirst(array $entries): array
    {
        usort($entries, static fn (Entry $a, Entry $b) => [$b->date, $b->slug] <=> [$a->date, $a->slug]);
        return $entries;
    }

    /**
     * Recent documents across every declared Category and Sub-category. A
     * Series gives its one row, and none of its Parts.
     *
     * @param list<array{label:string, path:string, series:bool, categories:list<array{slug:string}>}> $categories
     *        as Site::everyCategory() returns them — malformed entries are gone
     * @param list<string> $codes
     * @param ?int $limit how many to print — null is every one there is, which
     *        is what Site::listingMax() answers for an instance that asked for
     *        all of them
     * @param BasePath $at where the site begins — forCategory()
     * @return list<Entry>
     */
    public static function recent(
        string $contentDir,
        array $categories,
        array $codes,
        ?int $limit,
        BasePath $at = new BasePath(),
    ): array {
        $all = [];
        foreach ($categories as $c) {
            if ($c['series']) {
                $row = self::series($contentDir, $c, $codes, $at);
                if ($row !== null) {
                    $all[] = $row;
                }
                continue;
            }
            $subs = array_column($c['categories'], 'slug');
            array_push($all, ...self::forCategory($contentDir, $c['path'], $codes, $at, $subs));
        }

        return array_slice(self::newestFirst($all), 0, $limit);
    }
}
