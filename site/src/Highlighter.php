<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * The same tokenizer as the editor's, reading the same shared/langs.json.
 * Deliberately tiny: it classifies tokens and never passes input through
 * unescaped — highlighting adds spans around escaped text, nothing more.
 */
final class Highlighter
{
    /** @var array<string, array<string, mixed>>|null */
    private static ?array $langs = null;

    public static function load(string $path): void
    {
        $json = file_get_contents($path);
        $data = $json === false ? null : json_decode($json, true);
        self::$langs = is_array($data) ? $data : [];
    }

    public static function highlight(string $code, ?string $lang): string
    {
        $L = self::$langs[$lang ?? ''] ?? null;
        /* a dialect may borrow another's tables with "like" — psql is sql,
           node is js. One level only: an alias never points at another alias. */
        if (is_array($L) && isset($L['like'])) {
            $L = self::$langs[$L['like']] ?? null;
        }
        if (!is_array($L)) {
            return e($code);
        }

        $kw = array_map('strtolower', $L['kw'] ?? []);
        $bi = array_map('strtolower', $L['bi'] ?? []);

        /* order matters: comments and strings win over everything inside them */
        $pats = [
            ['com', $L['com'] ?? null],
            ['str', $L['str'] ?? null],
            ['var', $L['var'] ?? null],
            ['num', '0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?'],
            ['w',   '[A-Za-z_#<?][\w?-]*'],
            ['ws',  '\s+'],
        ];

        $out = '';
        $i   = 0;
        $len = strlen($code);

        while ($i < $len) {
            $hit = false;
            foreach ($pats as [$cls, $src]) {
                if ($src === null) {
                    continue;
                }
                if (preg_match('~' . $src . '~A', $code, $m, 0, $i) !== 1 || $m[0] === '') {
                    continue;
                }
                $tok = $m[0];
                if ($cls === 'w') {
                    $lo  = strtolower($tok);
                    $cls = in_array($lo, $kw, true) ? 'kw'
                         : (in_array($lo, $bi, true) ? 'bi' : null);
                }
                $out .= ($cls !== null && $cls !== 'ws')
                    ? '<span class="tk-' . $cls . '">' . e($tok) . '</span>'
                    : e($tok);
                $i  += strlen($tok);
                $hit = true;
                break;
            }
            if (!$hit) {
                /* Nothing classified this. Step over one whole character, not
                   one byte: half of a multibyte character is not text, and the
                   editor's tokenizer — which walks characters — would then
                   disagree with this one about the same line. */
                $chr = preg_match('~.~su', $code, $m, 0, $i) === 1 && $m[0] !== ''
                    ? $m[0]
                    : $code[$i];
                $out .= e($chr);
                $i   += strlen($chr);
            }
        }

        return $out;
    }
}
