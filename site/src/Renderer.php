<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * Lines -> HTML.
 *
 * The security property of this class: it never puts file bytes into its output.
 * It matches a line to a known type and emits tags it chose itself, with the
 * text escaped. Raw HTML in a document is not sanitised — it cannot be expressed.
 */
final class Renderer
{
    /**
     * Meta lines are the document's frontmatter, not part of its body — they
     * are printed once, under the title, and never in the flow.
     *
     * @param list<Line> $lines
     */
    public static function render(array $lines, bool $withMeta = true): string
    {
        $html = [];
        $body = array_values(array_filter($lines, static fn (Line $l) => $l->type !== 'meta'));
        $seen = [];

        $meta    = $withMeta ? self::meta($lines) : '';
        $pending = $meta;

        $runs = Markdown::runs($body);
        $n    = count($runs);

        for ($k = 0; $k < $n; $k++) {
            $run   = $runs[$k];
            $first = $run[0];

            switch ($first->type) {
                case 'h1':
                    $html[] = '<h1>' . self::inline($first->text) . '</h1>';
                    if ($pending !== '') {
                        $html[]  = $pending;
                        $pending = '';
                    }
                    break;
                case 'h2':
                case 'h3':
                    $tag    = $first->type;
                    $id     = self::anchor($first->text, $seen);
                    $html[] = "<$tag id=\"$id\">" . self::inline($first->text) . "</$tag>";
                    break;
                case 'p':
                    $html[] = '<p>' . self::inline($first->text) . '</p>';
                    break;
                case 'rule':
                    $html[] = '<hr>';
                    break;
                case 'img':
                    $alt    = $first->sub ?? '';
                    $html[] = '<figure><img src="' . e(self::mediaUrl($first->text)) . '" alt="' . e($alt) . '">'
                            . ($alt !== '' ? '<figcaption>' . e($alt) . '</figcaption>' : '')
                            . '</figure>';
                    break;
                case 'list':
                    $items  = array_map(static fn (Line $l) => '<li>' . self::inline($l->text) . '</li>', $run);
                    $html[] = '<ul>' . implode('', $items) . '</ul>';
                    break;
                case 'quote':
                    $parts  = array_map(static fn (Line $l) => self::inline($l->text), $run);
                    $html[] = '<blockquote>' . implode('<br>', $parts) . '</blockquote>';
                    break;
                case 'note':
                    $parts  = array_map(static fn (Line $l) => self::inline($l->text), $run);
                    $html[] = '<div class="note"><span class="note-tag">note</span>'
                            . implode(' ', $parts) . '</div>';
                    break;
                case 'table':
                    $html[] = self::table($run);
                    break;
                case 'code':
                case 'cli': {
                    $block = self::block($run);
                    if (isset($runs[$k + 1]) && $runs[$k + 1][0]->type === 'out') {
                        $block .= self::output($runs[$k + 1]);
                        $k++;
                    }
                    $html[] = '<div class="block">' . $block . '</div>';
                    break;
                }
                case 'out':
                    $html[] = '<div class="block">' . self::output($run) . '</div>';
                    break;
            }
        }

        /* a document with no h1 has nowhere to put the meta under, so it goes
           where the title would have been */
        if ($pending !== '') {
            array_unshift($html, $pending);
        }

        return implode("\n", $html);
    }

    /**
     * The document's own metadata, printed under its title. `title:` is left
     * out: it is the title, and the title is already there.
     *
     * @param list<Line> $lines
     */
    private static function meta(array $lines): string
    {
        $parts = [];
        foreach ($lines as $line) {
            if ($line->type !== 'meta' || str_starts_with($line->text, 'title:')) {
                continue;
            }
            $parts[] = e($line->text);
        }

        return $parts === [] ? '' : '<div class="doc-meta">' . implode(' · ', $parts) . '</div>';
    }

    /** @param list<Line> $run */
    private static function block(array $run): string
    {
        $first = $run[0];
        $lang  = $first->sub ?? 'text';

        if ($first->type === 'code') {
            $code = implode("\n", array_map(
                static fn (Line $l) => Highlighter::highlight($l->text, $l->sub),
                $run
            ));
            $pre = '<pre class="code">' . $code . '</pre>';
        } else {
            $prompt = Line::PROMPTS[$first->sub ?? 'bash'] ?? '$';
            $code   = implode("\n", array_map(
                static fn (Line $l) => '<span class="pr">' . e($prompt) . '</span> '
                    . Highlighter::highlight($l->text, $l->sub),
                $run
            ));
            $pre = '<pre class="cli">' . $code . '</pre>';
        }

        return '<div class="block-bar"><span class="lang">' . e($lang) . '</span></div>' . $pre;
    }

    /** @param list<Line> $run — folded by default, native <details>, no script */
    private static function output(array $run): string
    {
        $n    = count($run);
        $text = implode("\n", array_map(static fn (Line $l) => e($l->text), $run));

        return '<details class="outsec"><summary>output <i>' . $n . ' line'
             . ($n > 1 ? 's' : '') . '</i></summary><pre class="outp">' . $text . '</pre></details>';
    }

    /** @param list<Line> $run — first line is the header row */
    private static function table(array $run): string
    {
        $rows = array_map(
            static fn (Line $l) => array_map('trim', explode('|', $l->text)),
            $run
        );
        $width = max(array_map('count', $rows));

        $out = '<div class="tablewrap"><table>';
        foreach ($rows as $k => $cells) {
            $cells = array_pad($cells, $width, '');
            $tag   = $k === 0 ? 'th' : 'td';
            $out  .= $k === 0 ? '<thead><tr>' : '<tr>';
            foreach ($cells as $c) {
                $out .= "<$tag>" . self::inline($c) . "</$tag>";
            }
            $out .= $k === 0 ? '</tr></thead><tbody>' : '</tr>';
        }
        return $out . '</tbody></table></div>';
    }

    /**
     * Inline markup. Everything is escaped first, so the replacements below can
     * only ever match text the author wrote — never markup they injected.
     */
    public static function inline(string $s): string
    {
        $s = e($s);
        $s = preg_replace('~`([^`]+)`~', '<code>$1</code>', $s) ?? $s;
        $s = preg_replace('~\*\*([^*]+)\*\*~', '<strong>$1</strong>', $s) ?? $s;
        $s = preg_replace('~\*([^*]+)\*~', '<em>$1</em>', $s) ?? $s;
        /* links: the href is rebuilt from an allowlist of schemes, never passed through */
        return preg_replace_callback(
            '~\[([^\]]+)\]\(([^)\s]+)\)~',
            static function (array $m): string {
                $href = self::rawHref($m[2]);
                if (!self::safeHref($href)) {
                    return $m[1];
                }
                $ext = preg_match('~^https?://~i', $href) === 1;
                return '<a href="' . e($href) . '"'
                     . ($ext ? ' rel="noopener noreferrer"' : '') . '>' . $m[1] . '</a>';
            },
            $s
        ) ?? $s;
    }

    /**
     * The link target as the author wrote it. inline() escapes before it
     * matches, so the five entities e() produces have to come back off before
     * the target can be judged — and numeric references come off with them,
     * because `&#47;&#47;evil.example` is a protocol-relative URL in disguise
     * and safeHref() has to see it as one. One pass, so `&amp;#47;` becomes
     * the text `&#47;` and stays a slash nobody smuggled.
     *
     * Only references below 128 are decoded: a scheme, a slash and a colon are
     * all ASCII, and anything above it is re-escaped on the way out anyway.
     * editor/editor.js does the same, and bin/test compares the two.
     */
    private static function rawHref(string $href): string
    {
        $href = preg_replace_callback(
            '~&#(?:x([0-9a-fA-F]+)|([0-9]+));~',
            static function (array $m): string {
                $n = ($m[1] ?? '') !== '' ? (int) hexdec($m[1]) : (int) $m[2];
                return $n > 0 && $n < 128 ? chr($n) : $m[0];
            },
            $href
        ) ?? $href;

        return strtr($href, [
            '&lt;' => '<', '&gt;' => '>', '&quot;' => '"', '&#039;' => "'", '&amp;' => '&',
        ]);
    }

    /**
     * Whether a link target is one this renderer will emit. A fragment and a
     * local absolute path are written out as they are; everything else has to
     * name http, https or mailto. The three shapes that look local and are not
     * are refused: `//host` is another origin in disguise, a backslash is a
     * path separator to some clients, and a control character can cut an
     * attribute short. None of the three is a link anybody writes on purpose.
     */
    private static function safeHref(string $href): bool
    {
        if ($href === '' || preg_match('~[\x00-\x20\x7F\\\\]~', $href) === 1) {
            return false;
        }
        if (str_starts_with($href, '#')) {
            return preg_match('~^#[A-Za-z0-9_-]*$~', $href) === 1;
        }
        if (str_starts_with($href, '/')) {
            return !str_starts_with($href, '//') && !str_contains($href, '..');
        }
        return preg_match('~^https?://[^/\\\\]~i', $href) === 1
            || preg_match('~^mailto:[^\s@]+@[^\s@]+$~i', $href) === 1;
    }

    /** Documents reference media absolutely; a relative ./media/x.png is normalised. */
    private static function mediaUrl(string $src): string
    {
        /* a query or a fragment is not part of a file name */
        $src = preg_replace('~[?#].*$~', '', $src) ?? $src;
        $src = ltrim($src, '.');

        /* An absolute path addresses the document root. Everything else — a
           relative path, a protocol-relative URL, a backslash, a control
           character, a climb out of the root — is reduced to the file it
           names, under media/, which is the only place images live. */
        if (str_starts_with($src, '/')
            && !str_starts_with($src, '//')
            && !str_contains($src, '..')
            && preg_match('~[\x00-\x1F\x7F\\\\]~', $src) !== 1
        ) {
            return $src;
        }
        return '/media/' . basename(str_replace('\\', '/', $src));
    }

    /**
     * The id a heading is linkable by. Two headings with the same words would
     * otherwise share one id, and a link to the second would land on the first.
     *
     * @param array<string,int> $seen
     */
    private static function anchor(string $text, array &$seen): string
    {
        $a = strtolower(preg_replace('~[^A-Za-z0-9]+~', '-', $text) ?? '');
        $a = trim($a, '-') ?: 'section';

        $seen[$a] = ($seen[$a] ?? 0) + 1;
        return $seen[$a] > 1 ? $a . '-' . $seen[$a] : $a;
    }
}
