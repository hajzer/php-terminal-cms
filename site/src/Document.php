<?php
declare(strict_types=1);

namespace TerminalCms;

final class Document
{
    /** @param array<string,string> $meta @param list<Line> $lines */
    private function __construct(
        public readonly string $category,
        public readonly string $slug,
        public readonly string $base,
        public readonly array $meta,
        public readonly array $lines,
    ) {
    }

    /**
     * @param string $category the Category path, '' for the content root
     * @param string $slug the address the Document was asked for
     * @param string $base the Name without its Language and .md, which every
     *        Language of the Document shares
     */
    public static function load(string $file, string $category, string $slug, string $base): self
    {
        $raw = file_get_contents($file);
        [$meta, $lines] = Markdown::parse($raw === false ? '' : $raw);

        return new self($category, $slug, $base, $meta, $lines);
    }

    public function title(): string
    {
        return $this->meta['title'] ?? $this->slug;
    }

    public function date(): string
    {
        return $this->meta['date'] ?? '';
    }

    /**
     * Where the Document's pictures are, under media/: its path under
     * content/ without the Language — `about/what-it-is`, `index` for the
     * homepage, `about/index` for a Category's page.
     */
    public function media(): string
    {
        return ltrim($this->category . '/' . $this->base, '/');
    }

    /**
     * @param string $linkOpen where a link to another site opens — Renderer::inline()
     * @param BasePath $at where the site begins — Renderer::render()
     */
    public function html(string $linkOpen = 'here', BasePath $at = new BasePath()): string
    {
        return Renderer::render($this->lines, true, $linkOpen, $at, $this->media());
    }

    /**
     * Whether a file is Published: its Meta names no `published`, or names
     * exactly `true`. This is the one setting that fails closed: a file with
     * any other word is not, a misspelling included, and nor is a file that
     * cannot be read.
     */
    public static function published(string $file): bool
    {
        if (!is_file($file) || !is_readable($file)) {
            return false;
        }
        $meta = self::peekMeta($file);
        return !array_key_exists('published', $meta) || $meta['published'] === 'true';
    }

    /**
     * Read only the frontmatter of a file — listings need a title and a date,
     * not the body. The file is read in pieces until the closing delimiter is,
     * and that much is read as Markdown::parse() reads it, so this is the Meta
     * the page has: a line ends at \r\n, \r or \n, and the frontmatter is as
     * long as it is.
     *
     * @return array<string,string>
     */
    public static function peekMeta(string $file): array
    {
        $fh = @fopen($file, 'rb');
        if ($fh === false) {
            return [];
        }

        $head  = '';
        $tail  = '';      /* the last line read, which may go on in the next piece */
        $whole = 0;       /* the lines read to their end */
        while (!feof($fh) && ($piece = fread($fh, 8192)) !== false) {
            $head .= $piece;
            $lines = preg_split('~\r\n|\r|\n~', $tail . $piece) ?: [''];
            $tail  = (string) array_pop($lines);
            foreach ($lines as $line) {
                $delimiter = rtrim($line) === '---';
                if ($whole++ === 0 ? !$delimiter : $delimiter) {
                    break 2;      /* no frontmatter, which only opens a file — or its end */
                }
            }
        }
        fclose($fh);

        return Markdown::parse($head)[0];
    }
}
