<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * Site Config, read once and read defensively.
 *
 * site.php is hand-written trusted configuration, but it is still the only
 * file an instance edits, and a page has to render when a key is missing, a
 * category entry is the wrong shape, or a colour is not a colour. Every reader
 * of the config goes through here, so there is one answer to what a category
 * is and one place a malformed one is dropped — the router, the navigation and
 * the listings cannot disagree about it.
 */
final class Site
{
    /** The accent an instance that names none, or names one that is not a colour, gets. */
    public const ACCENT = '#d9a05f';


    /** The default language an instance that names none, or names something
     *  that is not a code, gets. */
    public const LANG = 'en';

    /**
     * The language the site is written in — the one a document with no suffix
     * on its name is in, and the one the pages declare.
     *
     * @param array<string,mixed> $site
     */
    public static function lang(array $site): string
    {
        $lang = strtolower(trim((string) ($site['lang'] ?? self::LANG)));
        return Language::isCode($lang) ? $lang : self::LANG;
    }

    /**
     * Every language a document may be written in, the site's own first.
     *
     * This is the list a file name's suffix is checked against, so a language
     * nobody declared is part of the name rather than a translation — see
     * Language::split(). Duplicates and codes that are not codes are dropped.
     *
     * @param array<string,mixed> $site
     * @return list<string>
     */
    public static function languages(array $site): array
    {
        $out = [self::lang($site)];
        foreach ((array) ($site['languages'] ?? []) as $code) {
            if (!is_string($code)) {
                continue;
            }
            $code = strtolower(trim($code));
            if (Language::isCode($code) && !in_array($code, $out, true)) {
                $out[] = $code;
            }
        }
        return $out;
    }

    /**
     * The declared categories, in order, without the entries that are not
     * categories. A slug is one segment of a URL and one directory name under
     * content/, so anything else is ignored rather than turned into a path.
     *
     * @param array<string,mixed> $site
     * @return list<array{slug:string, label:string, listing:bool}>
     */
    public static function categories(array $site): array
    {
        $out = [];
        foreach ((array) ($site['categories'] ?? []) as $c) {
            if (!is_array($c) || !isset($c['slug']) || !is_string($c['slug']) || !self::isSlug($c['slug'])) {
                continue;
            }
            $label = isset($c['label']) && is_scalar($c['label']) ? (string) $c['label'] : $c['slug'];
            $out[] = [
                'slug'    => $c['slug'],
                'label'   => $label,
                'listing' => ($c['listing'] ?? true) !== false,
            ];
        }
        return $out;
    }

    /**
     * Whether an index page prints the documents below it. A site.php that
     * does not name the setting gets it on.
     *
     * @param array<string,mixed> $site
     */
    public static function lists(array $site): bool
    {
        return ($site['listing'] ?? true) !== false;
    }

    /**
     * The accent, as six hex digits and nothing else. It is the one config
     * value that reaches the page as CSS rather than as text, and escaping is
     * not a way of validating CSS — a colour either is one or the default is.
     *
     * @param array<string,mixed> $site
     */
    public static function accent(array $site): string
    {
        $accent = (string) ($site['accent'] ?? self::ACCENT);
        return preg_match('~^#[0-9a-fA-F]{6}$~', $accent) === 1 ? $accent : self::ACCENT;
    }

    /** One URL segment, and one directory name under content/. */
    public static function isSlug(string $slug): bool
    {
        return preg_match('~^[a-z0-9][a-z0-9_-]*$~', $slug) === 1;
    }
}
