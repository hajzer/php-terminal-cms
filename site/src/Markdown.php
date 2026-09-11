<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * Markdown -> lines. Reads back exactly the subset the editor emits; anything
 * else degrades to a paragraph rather than being interpreted.
 *
 * The format is documented in docs/format.md. This implementation and
 * editor/editor.js must agree — bin/test asserts that they do.
 */
final class Markdown
{
    /** @return array{0: array<string,string>, 1: list<Line>} [meta, lines] */
    public static function parse(string $md): array
    {
        /* The three line breaks a file can be written with, and nothing else.
           PCRE's \R without the u modifier matches the single byte 0x85, which
           is the continuation byte of every UTF-8 character whose code point
           ends in 0x05 — '★' (U+2605), 'х' (U+0445) — so a document could be
           cut through the middle of a character and lose the byte. This is the
           same set editor/editor.js splits on, so both halves agree. */
        $raw   = preg_split('~\r\n|\r|\n~', $md) ?: [];
        $meta  = [];
        $lines = [];
        $i     = 0;
        $n     = count($raw);

        /* frontmatter, only when it opens the file */
        if ($n > 0 && rtrim($raw[0]) === '---') {
            $i = 1;
            while ($i < $n && rtrim($raw[$i]) !== '---') {
                $t = trim($raw[$i]);
                if ($t !== '') {
                    $lines[] = new Line('meta', $t);
                    if (str_contains($t, ':')) {
                        [$k, $v] = explode(':', $t, 2);
                        $meta[trim($k)] = trim($v);
                    }
                }
                $i++;
            }
            $i++; // closing ---
        }

        for (; $i < $n; $i++) {
            $line = rtrim($raw[$i], "\r");
            $t    = trim($line);

            if ($t === '') {
                continue;
            }

            /* fenced blocks: ```<dialect> code, ```console CLI, ```output output */
            if (preg_match('~^```([A-Za-z0-9_-]*)\s*$~', $t, $m)) {
                $info = strtolower($m[1]);
                $body = [];
                $i++;
                while ($i < $n && rtrim(trim($raw[$i])) !== '```') {
                    $body[] = rtrim($raw[$i], "\r");
                    $i++;
                }
                foreach (self::fenceToLines($info, $body) as $l) {
                    $lines[] = $l;
                }
                continue;
            }

            /* headings */
            if (preg_match('~^(\#{1,3})\s+(.*)$~', $t, $m)) {
                $lines[] = new Line('h' . strlen($m[1]), trim($m[2]));
                continue;
            }

            /* thematic break */
            if (preg_match('~^(-{3,}|\*{3,}|_{3,})$~', $t)) {
                $lines[] = new Line('rule', '');
                continue;
            }

            /* image on its own line */
            if (preg_match('~^!\[([^\]]*)\]\(([^)]+)\)$~', $t, $m)) {
                $lines[] = new Line('img', trim($m[2]), $m[1] !== '' ? $m[1] : null);
                continue;
            }

            /* table row — the alignment row is the one written out of dashes.
               A row whose cells are all empty is a row, and reads back as one. */
            if (preg_match('~^\|(.+)\|$~', $t, $m)) {
                $cells = trim($m[1]);
                if (!preg_match('~^[\s:|-]*-[\s:|-]*$~', $cells)) {
                    $lines[] = new Line('table', self::normaliseRow($cells));
                }
                continue;
            }

            /* list item */
            if (preg_match('~^[-*+]\s+(.*)$~', $t, $m)) {
                $lines[] = new Line('list', trim($m[1]));
                continue;
            }

            /* blockquote — a leading [!NOTE] callout makes the run a note */
            if (str_starts_with($t, '>')) {
                $isNote = (bool) preg_match('~^>\s*\[!(NOTE|IMPORTANT|WARNING|TIP)\]\s*$~i', $t);
                if ($isNote) {
                    $i++;
                }
                for (; $i < $n; $i++) {
                    $q = trim(rtrim($raw[$i], "\r"));
                    if (!str_starts_with($q, '>')) {
                        break;
                    }
                    $body = trim(substr($q, 1));
                    if ($body !== '') {
                        $lines[] = new Line($isNote ? 'note' : 'quote', $body);
                    }
                }
                $i--;
                continue;
            }

            /* CommonMark: consecutive plain lines are one paragraph */
            $para = [$t];
            while ($i + 1 < $n) {
                $next = trim(rtrim($raw[$i + 1], "\r"));
                if ($next === '' || self::isConstruct($next)) {
                    break;
                }
                $para[] = $next;
                $i++;
            }
            $lines[] = new Line('p', implode(' ', $para));
        }

        return [$meta, $lines];
    }

    /** Does this line open something that is not a paragraph? */
    private static function isConstruct(string $t): bool
    {
        return $t === ''
            || str_starts_with($t, '```')
            || str_starts_with($t, '>')
            || preg_match('~^\#{1,3}\s~', $t) === 1
            || preg_match('~^(-{3,}|\*{3,}|_{3,})$~', $t) === 1
            || preg_match('~^!\[[^\]]*\]\([^)]+\)$~', $t) === 1
            || preg_match('~^\|(.+)\|$~', $t) === 1
            || preg_match('~^[-*+]\s~', $t) === 1;
    }

    /** @param list<string> $body @return list<Line> */
    private static function fenceToLines(string $info, array $body): array
    {
        if ($info === 'output' || $info === 'text' || $info === '') {
            return array_map(static fn (string $b) => new Line('out', $b), $body);
        }

        /* a console fence is a CLI run; the prompt names the dialect */
        if ($info === 'console' || $info === 'shell-session' || $info === 'terminal') {
            $out = [];
            foreach ($body as $b) {
                $dialect = 'bash';
                $text    = $b;
                foreach (Line::PROMPTS as $d => $p) {
                    if (str_starts_with(ltrim($b), $p)) {
                        $dialect = $d;
                        $text    = ltrim(substr(ltrim($b), strlen($p)));
                        break;
                    }
                }
                $out[] = new Line('cli', $text, $dialect);
            }
            return $out;
        }

        return array_map(static fn (string $b) => new Line('code', $b, $info), $body);
    }

    /** "a | b " -> "a | b" with single spaces around the separators */
    private static function normaliseRow(string $cells): string
    {
        return implode(' | ', array_map('trim', explode('|', $cells)));
    }

    /** lines -> markdown. The inverse of parse(); bin/test asserts the round trip. */
    public static function toMarkdown(array $lines): string
    {
        $out  = [];
        $meta = array_values(array_filter($lines, static fn (Line $l) => $l->type === 'meta'));
        if ($meta !== []) {
            $out[] = '---';
            foreach ($meta as $m) {
                $out[] = $m->text;
            }
            $out[] = '---';
            $out[] = '';
        }

        $body = array_values(array_filter($lines, static fn (Line $l) => $l->type !== 'meta'));
        foreach (self::runs($body) as $run) {
            $first = $run[0];
            switch ($first->type) {
                case 'h1': $out[] = '# ' . $first->text; $out[] = ''; break;
                case 'h2': $out[] = '## ' . $first->text; $out[] = ''; break;
                case 'h3': $out[] = '### ' . $first->text; $out[] = ''; break;
                case 'p':  $out[] = $first->text; $out[] = ''; break;
                case 'rule': $out[] = '---'; $out[] = ''; break;
                case 'img':
                    $out[] = '![' . ($first->sub ?? 'figure') . '](' . $first->text . ')';
                    $out[] = '';
                    break;
                case 'list':
                    foreach ($run as $l) { $out[] = '- ' . $l->text; }
                    $out[] = '';
                    break;
                case 'quote':
                    foreach ($run as $l) { $out[] = '> ' . $l->text; }
                    $out[] = '';
                    break;
                case 'note':
                    $out[] = '> [!NOTE]';
                    foreach ($run as $l) { $out[] = '> ' . $l->text; }
                    $out[] = '';
                    break;
                case 'code':
                    $out[] = '```' . ($first->sub ?? '');
                    foreach ($run as $l) { $out[] = $l->text; }
                    $out[] = '```';
                    $out[] = '';
                    break;
                case 'cli':
                    $out[] = '```console';
                    foreach ($run as $l) {
                        $out[] = (Line::PROMPTS[$l->sub ?? 'bash'] ?? '$') . ' ' . $l->text;
                    }
                    $out[] = '```';
                    $out[] = '';
                    break;
                case 'out':
                    $out[] = '```output';
                    foreach ($run as $l) { $out[] = $l->text; }
                    $out[] = '```';
                    $out[] = '';
                    break;
                case 'table':
                    $rows  = array_map(static fn (Line $l) => array_map('trim', explode('|', $l->text)), $run);
                    $width = max(array_map('count', $rows));
                    foreach ($rows as $k => $cells) {
                        $cells = array_pad($cells, $width, '');
                        $out[] = '| ' . implode(' | ', $cells) . ' |';
                        if ($k === 0) {
                            $out[] = '|' . str_repeat(' --- |', $width);
                        }
                    }
                    $out[] = '';
                    break;
            }
        }

        return rtrim(preg_replace('~\n{3,}~', "\n\n", implode("\n", $out)) ?? '') . "\n";
    }

    /** Group consecutive lines of the same type (and dialect) into runs.
     *  @param list<Line> $lines @return list<list<Line>> */
    public static function runs(array $lines): array
    {
        $runs = [];
        $i    = 0;
        $n    = count($lines);
        while ($i < $n) {
            $run = [$lines[$i]];
            $i++;
            while ($i < $n && $run[0]->joins($lines[$i])) {
                $run[] = $lines[$i];
                $i++;
            }
            $runs[] = $run;
        }
        return $runs;
    }
}
