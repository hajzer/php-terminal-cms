<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * The language a Document is written in, which it carries in its own file name.
 *
 * `what-it-is-sk.md` is the Slovak of `what-it-is`. Nothing else in the system
 * records a language: there is no meta line, and no state beside the Document.
 * A name with no suffix is in the site's own language.
 *
 * A suffix is a language only if site.php declared it. `what-it-is` ends in
 * `-is` and `install-in-five-minutes` in `-es`, so a site that has not named
 * Icelandic or Spanish has two documents with long names, which is what they
 * are.
 */
final class Language
{
    /** The shape of a code: two or three letters, optionally a region. */
    public static function isCode(string $code): bool
    {
        return preg_match('~^[a-z]{2,3}(-[a-z]{2})?$~', $code) === 1;
    }

    /**
     * A slug read as a base and a language. The language is '' when the name
     * carries none, which is a Document in the site's own language.
     *
     * @param list<string> $codes the declared languages
     * @return array{0:string, 1:string}
     */
    public static function split(string $slug, array $codes): array
    {
        /* longest first, so a region reads as one code and not as its tail:
           'x-pt-br' is Brazilian x, not 'x-pt' in br */
        usort($codes, static fn (string $a, string $b) => strlen($b) <=> strlen($a));

        foreach ($codes as $code) {
            $suffix = '-' . $code;
            if (strlen($slug) > strlen($suffix) && str_ends_with($slug, $suffix)) {
                return [substr($slug, 0, -strlen($suffix)), $code];
            }
        }
        return [$slug, ''];
    }

    /**
     * The address of one language of a document. The site's own language is
     * the bare slug, so the URL a document had before it was translated is
     * still the URL it has.
     */
    public static function slug(string $base, string $code, string $default): string
    {
        return $code === '' || $code === $default ? $base : $base . '-' . $code;
    }

    /**
     * The language a file's suffix means. A file with no suffix is the site's
     * own language, which is the one thing this whole scheme rests on, so it
     * is spelled once, here.
     */
    public static function code(string $suffix, string $default): string
    {
        return $suffix === '' ? $default : $suffix;
    }

    /**
     * Where each language of one Document is read — code => URL, in the order
     * the languages were found.
     *
     * @param array<string,string> $variants code => file name, '' for a name
     *        with no suffix
     * @return array<string,string>
     */
    public static function addresses(string $base, array $variants, string $prefix, string $default): array
    {
        $out = [];
        foreach ($variants as $suffix => $file) {
            $suffix = (string) $suffix;
            $out[self::code($suffix, $default)] = $prefix . self::slug($base, $suffix, $default);
        }
        return $out;
    }

    /** The code as the indicator prints it. */
    public static function label(string $code): string
    {
        return strtoupper($code);
    }
}
