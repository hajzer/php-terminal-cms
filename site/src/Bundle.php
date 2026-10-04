<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * A Bundle: a Document, or a Category of them, as a slice of the repository a
 * reader can unzip and read or edit offline.
 *
 * One top directory holds a README.txt, the Editor under editor/, each
 * Document in each Language it is Published in under site/content/, and each
 * one's Media under site/public/media/ — the paths a checkout has, so
 * editor/index.html finds a Document's pictures the way it does in one. A file
 * whose own Meta says `bundle: false` is left out of every Bundle.
 *
 * It reads an Instance as one is laid out — content/, public/media/ and
 * editor/ side by side — and every path it reads is a Category path from Site
 * Config or a name scandir() gave. A symbolic link found on the way is not
 * followed, a dot file is not taken, and a name a ZIP cannot hold is left out
 * rather than refused half-way through a download.
 *
 *     $bundle = Bundle::document($contentDir, $codes, 'guides', 'install');
 *     $bundle->write(fopen('php://output', 'wb'));
 */
final class Bundle
{
    /**
     * @param array<string,string> $files name below the top directory => the
     *        file it is read from, in the order written
     */
    private function __construct(
        public readonly string $top,
        private readonly array $files,
        private readonly string $readme,
        private readonly int $time,
    ) {
    }

    /**
     * One Document: every Language of it that is Published, and its Media.
     * Its top directory is its base, and README.txt names it by the title
     * of the first of its Languages, so every Language's address answers the
     * same bytes.
     *
     * @param list<string> $codes the declared languages, the site's own first
     * @param string $category the Category path the Document is in
     * @param string $base the Name without its Language and .md
     */
    public static function document(string $contentDir, array $codes, string $category, string $base): self
    {
        $variants = Listing::variants($contentDir . '/' . $category, $base, $codes);
        $first = $variants === [] ? [] : Document::peekMeta($contentDir . '/' . $category . '/' . reset($variants));
        $parts = ['content' => [], 'media' => []];
        self::take($parts, $contentDir, $category, $base, $variants);
        return self::make($contentDir, $base, $parts, $first['title'] ?? $base);
    }

    /**
     * One Category or Sub-category: its index.md and its Documents, and its
     * Sub-categories' — each with its Media. A Document whose address one of
     * those Sub-categories answers is not read at it, and is not here. Its top
     * directory is its path, `/` written `-`.
     *
     * @param list<string> $codes the declared languages, the site's own first
     * @param array{path:string, categories:list<array{slug:string, path:string}>} $declared
     *        as Site::categories() declares it
     */
    public static function category(string $contentDir, array $codes, array $declared, string $title): self
    {
        $default = $codes[0] ?? Site::LANG;
        $subs = array_column($declared['categories'], 'slug');
        $parts = ['content' => [], 'media' => []];
        foreach ([$declared['path'], ...array_column($declared['categories'], 'path')] as $i => $path) {
            $dir = $contentDir . '/' . $path;
            if (!is_dir($dir)) {
                continue;
            }
            foreach (Listing::documents($dir, $codes) as $base => $variants) {
                $base = (string) $base;
                if ($i === 0) {
                    $variants = array_filter(
                        $variants,
                        static fn (string $code) => !in_array(Language::slug($base, $code, $default), $subs, true),
                        ARRAY_FILTER_USE_KEY,
                    );
                }
                self::take($parts, $contentDir, $path, $base, $variants);
            }
        }
        return self::make($contentDir, self::top($declared['path']), $parts, $title);
    }

    /** The top directory a Category's Bundle is named after: its path, `/` written `-`. */
    public static function top(string $categoryPath): string
    {
        return str_replace('/', '-', $categoryPath);
    }

    /**
     * The Bundle's entries: each name, and the file it is read from — null
     * for README.txt, which is written rather than read.
     *
     * @return list<array{0:string, 1:?string}>
     */
    public function entries(): array
    {
        $out = [[$this->top . '/README.txt', null]];
        foreach ($this->files as $name => $path) {
            $out[] = [$this->top . '/' . $name, $path];
        }
        return $out;
    }

    /** The name it downloads as. */
    public function filename(): string
    {
        return $this->top . '.zip';
    }

    /** The Content-Disposition it is sent with: a download, under its own
     *  name, spelled in ASCII and — when that loses anything — in UTF-8 too. */
    public function disposition(): string
    {
        $name = $this->filename();
        $ascii = (string) preg_replace('~[^A-Za-z0-9._-]~', '_', $name);
        return 'attachment; filename="' . $ascii . '"'
             . ($ascii === $name ? '' : "; filename*=UTF-8''" . rawurlencode($name));
    }

    /**
     * The Bundle as a ZIP, to a stream the caller owns. The same files write
     * the same bytes: each entry carries its file's mtime, and README.txt the
     * newest.
     *
     * @param resource $out
     */
    public function write($out): void
    {
        $zip = new Zip($out);
        $zip->data($this->top . '/README.txt', $this->readme, $this->time);
        foreach ($this->files as $name => $path) {
            $zip->file($this->top . '/' . $name, $path);
        }
        $zip->finish();
    }

    /**
     * One Document's files, those of its Languages that do not say
     * `bundle: false`, and its Media when any of them is taken.
     *
     * @param array{content:array<string,string>, media:array<string,string>} $parts
     * @param array<string,string> $variants code => file name
     */
    private static function take(array &$parts, string $contentDir, string $path, string $base, array $variants): void
    {
        $taken = false;
        foreach ($variants as $file) {
            $source = $contentDir . '/' . $path . '/' . $file;
            $name = 'site/content/' . $path . '/' . $file;
            if ((Document::peekMeta($source)['bundle'] ?? '') === 'false' || !Zip::isName($name)) {
                continue;
            }
            $parts['content'][$name] = $source;
            $taken = true;
        }
        if ($taken) {
            $media = $path . '/' . $base;
            self::tree(dirname($contentDir) . '/public/media/' . $media, 'site/public/media/' . $media, $parts['media']);
        }
    }

    /** @param array{content:array<string,string>, media:array<string,string>} $parts */
    private static function make(string $contentDir, string $top, array $parts, string $title): self
    {
        $files = [];
        self::tree(dirname($contentDir) . '/editor', 'editor', $files);
        $files += $parts['content'] + $parts['media'];

        $time = 0;
        foreach ($files as $path) {
            $time = max($time, (int) @filemtime($path));
        }

        $title = trim((string) preg_replace('~[\x00-\x1F\x7F]+~', ' ', $title));
        $readme = $title . " — the markdown is in site/content/, its pictures in site/public/media/.\n"
                . "Open editor/index.html in a browser and choose Open .md to read or edit a file offline.\n";

        return new self($top, $files, $readme, $time);
    }

    /**
     * Every file under a directory, named under a path below the top, in the
     * order scandir() gives them.
     *
     * @param array<string,string> $into name => file
     */
    private static function tree(string $dir, string $as, array &$into): void
    {
        if (is_link($dir) || !is_dir($dir)) {
            return;
        }
        foreach (scandir($dir) ?: [] as $name) {
            $path = $dir . '/' . $name;
            if (str_starts_with($name, '.') || is_link($path)) {
                continue;
            }
            if (is_dir($path)) {
                self::tree($path, $as . '/' . $name, $into);
            } elseif (is_file($path) && is_readable($path) && Zip::isName($as . '/' . $name)) {
                $into[$as . '/' . $name] = $path;
            }
        }
    }
}
