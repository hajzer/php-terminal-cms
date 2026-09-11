<?php
declare(strict_types=1);

namespace TerminalCms;

final class Document
{
    /** @param array<string,string> $meta @param list<Line> $lines */
    private function __construct(
        public readonly string $category,
        public readonly string $slug,
        public readonly array $meta,
        public readonly array $lines,
    ) {
    }

    public static function load(string $file, string $category, string $slug): self
    {
        $raw = file_get_contents($file);
        [$meta, $lines] = Markdown::parse($raw === false ? '' : $raw);

        return new self($category, $slug, $meta, $lines);
    }

    public function title(): string
    {
        return $this->meta['title'] ?? $this->slug;
    }

    public function date(): string
    {
        return $this->meta['date'] ?? '';
    }

    /** @param string $linkOpen where a link to another site opens — Renderer::inline() */
    public function html(string $linkOpen = 'here'): string
    {
        return Renderer::render($this->lines, true, $linkOpen);
    }

    /**
     * Read only the frontmatter of a file — listings need a title and a date,
     * not the body. Stops at the closing delimiter.
     *
     * @return array<string,string>
     */
    public static function peekMeta(string $file): array
    {
        $fh = @fopen($file, 'rb');
        if ($fh === false) {
            return [];
        }

        $meta  = [];
        $first = fgets($fh);
        if ($first === false || rtrim($first) !== '---') {
            fclose($fh);
            return [];
        }
        $guard = 0;
        while (($line = fgets($fh)) !== false && $guard++ < 50) {
            $line = rtrim($line);
            if ($line === '---') {
                break;
            }
            if (str_contains($line, ':')) {
                [$k, $v] = explode(':', $line, 2);
                $meta[trim($k)] = trim($v);
            }
        }
        fclose($fh);

        return $meta;
    }
}
