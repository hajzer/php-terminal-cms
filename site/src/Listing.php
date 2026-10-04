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
 */
final class Entry
{
    /**
     * @param string $slug the address of the language this entry is printed in
     * @param string $lang the code of that language, '' when the site has one
     * @param array<string,string> $languages code => URL, in the declared order —
     *        empty unless this document exists in more than one language
     * @param BasePath $at where the site begins, which the URLs are written under
     */
    public function __construct(
        public readonly string $category,
        public readonly string $slug,
        public readonly string $title,
        public readonly string $date,
        public readonly string $lang = '',
        public readonly array $languages = [],
        private readonly BasePath $at = new BasePath(),
    ) {
    }

    public function url(): string
    {
        return $this->at->page($this->category . '/' . $this->slug);
    }
}

final class Listing
{
    /**
     * Every language one document exists in, in the order the site declares
     * them. The key is the code, or '' for a file with no suffix; the value is
     * the file name. A base with no file at all is an empty array.
     *
     * @param list<string> $codes
     * @return array<string,string>
     */
    public static function variants(string $dir, string $base, array $codes): array
    {
        return self::group($dir, $codes)[$base] ?? [];
    }

    /**
     * Every document in a directory, by the document it is a version of.
     *
     * @param list<string> $codes
     * @return array<string, array<string,string>> base => code => file name,
     *         the codes in the declared order and '' — a file with no suffix —
     *         first
     */
    private static function group(string $dir, array $codes): array
    {
        $found = [];
        foreach (scandir($dir) ?: [] as $name) {
            if (!str_ends_with($name, '.md')) {
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
     * on its own page.
     *
     * @param string $category the Category's path under content/, as
     *        Site::categories() declares it
     * @param list<string> $codes the declared languages, the site's own first
     * @param BasePath $at where the site begins, which the entries' URLs are
     *        written under
     * @return list<Entry>
     */
    public static function forCategory(
        string $contentDir,
        string $category,
        array $codes = [],
        BasePath $at = new BasePath(),
    ): array {
        $dir = $contentDir . '/' . $category;
        if (!is_dir($dir)) {
            return [];
        }
        $default = $codes[0] ?? Site::LANG;

        $entries = [];
        foreach (self::group($dir, $codes) as $base => $variants) {
            $base = (string) $base;    /* a name that is all digits is a string here */
            /* index.md is the category's own introduction, in any language */
            if ($base === 'index') {
                continue;
            }

            /* printed in the site's own language, and in whatever it was
               written in when that language is not one of them */
            $code = isset($variants['']) ? '' : (isset($variants[$default]) ? $default : array_key_first($variants));
            $meta = Document::peekMeta($dir . '/' . $variants[$code]);

            $addresses = Language::addresses($base, $variants, $category, $default, $at);
            $one   = count($addresses) < 2;

            $entries[] = new Entry(
                $category,
                Language::slug($base, (string) $code, $default),
                $meta['title'] ?? $base,
                $meta['date'] ?? '',
                $one ? '' : Language::code((string) $code, $default),
                $one ? [] : $addresses,
                $at,
            );
        }

        usort($entries, static fn (Entry $a, Entry $b) => [$b->date, $b->slug] <=> [$a->date, $a->slug]);

        return $entries;
    }

    /**
     * Recent documents across every declared Category and Sub-category.
     *
     * @param list<array{path:string}> $categories as Site::everyCategory()
     *        returns them — malformed entries are gone
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
            foreach (self::forCategory($contentDir, $c['path'], $codes, $at) as $entry) {
                $all[] = $entry;
            }
        }
        usort($all, static fn (Entry $a, Entry $b) => [$b->date, $b->slug] <=> [$a->date, $a->slug]);

        return array_slice($all, 0, $limit);
    }
}
