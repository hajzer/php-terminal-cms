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

    /** How many documents the homepage Listing prints for an instance that
     *  names no count, or names something that is not one. */
    public const LISTING_MAX = 15;

    /** Where a link to another site opens for an instance that does not say. */
    public const LINK_OPEN = 'here';

    /** The default language an instance that names none, or names something
     *  that is not a code, gets. */
    public const LANG = 'en';

    /** The icon a page carries for an instance that names none: a real file in
     *  public/, at the path a browser asks for without being told. */
    public const FAVICON = '/favicon.ico';

    /** What a file name says an icon's type is. An extension nobody
     *  recognises has no entry, and the link is emitted without a type
     *  rather than with a guess at one. */
    private const ICON_TYPES = [
        'ico'  => 'image/x-icon',
        'png'  => 'image/png',
        'svg'  => 'image/svg+xml',
        'gif'  => 'image/gif',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
    ];

    /**
     * The language the site is written in — the one a document with no suffix
     * on its name is in, and the one the pages declare.
     *
     * @param array<string,mixed> $site
     */
    public static function lang(array $site): string
    {
        $lang = $site['lang'] ?? self::LANG;
        $lang = is_string($lang) ? strtolower(trim($lang)) : '';
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
     * How many documents the homepage Listing prints — a whole number of them,
     * or null for every one there is. Only a whole number of at least one is a
     * count; 0 is how an instance asks for all of them, and anything that is
     * not a count at all — a negative, a fraction, a word, nothing — gets the
     * default rather than a homepage with no list on it.
     *
     * A category listing is not capped: a category is a finite thing an author
     * chose the size of, and cutting it off would hide documents that have
     * nowhere else to be listed.
     *
     * @param array<string,mixed> $site
     */
    public static function listingMax(array $site): ?int
    {
        $max = $site['listing_max'] ?? self::LISTING_MAX;
        if ($max === 0) {
            return null;
        }
        return is_int($max) && $max >= 1 ? $max : self::LISTING_MAX;
    }

    /**
     * Where a link to another site opens: 'here' in the tab the reader is in,
     * or 'tab' in a new one. 'tab' is the only value that changes anything, so
     * an instance that names something else gets the reader's tab kept.
     *
     * @param array<string,mixed> $site
     */
    public static function linkOpen(array $site): string
    {
        return ($site['link_open'] ?? null) === 'tab' ? 'tab' : self::LINK_OPEN;
    }

    /**
     * The picture in the brand link, or '' for an instance that has none. The
     * src is reduced exactly as an Image Line's src is, so a value that is not
     * a safe local path names a file under the media directory rather than
     * another origin.
     *
     * @param array<string,mixed> $site
     */
    public static function logo(array $site): string
    {
        $logo = $site['logo'] ?? '';
        $logo = is_string($logo) ? trim($logo) : '';
        return $logo === '' ? '' : Renderer::mediaUrl($logo);
    }

    /**
     * The icon in the reader's tab, or '' for an instance that wants none. The
     * src is reduced exactly as the logo's is, so a value that is not a safe
     * local path names a file under the media directory — and an absolute path
     * stands, which is how /favicon.ico at the document root is expressible.
     *
     * Naming nothing and naming none are different answers: a config without
     * the key gets the icon the archive ships, and one that names an empty
     * string — or anything that is not a path, as the logo reads it — gets no
     * icon link at all.
     *
     * @param array<string,mixed> $site
     */
    public static function favicon(array $site): string
    {
        if (!array_key_exists('favicon', $site)) {
            return self::FAVICON;
        }
        $icon = is_string($site['favicon']) ? trim($site['favicon']) : '';
        return $icon === '' ? '' : Renderer::mediaUrl($icon);
    }

    /**
     * The type the icon link declares, or '' when the file's extension is one
     * nothing here knows. An SVG icon wants the attribute; nothing wants a
     * type that was guessed from a name.
     */
    public static function faviconType(string $icon): string
    {
        $ext = strtolower(pathinfo($icon, PATHINFO_EXTENSION));
        return self::ICON_TYPES[$ext] ?? '';
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
        $accent = $site['accent'] ?? self::ACCENT;
        return is_string($accent) && preg_match('~^#[0-9a-fA-F]{6}$~', $accent) === 1
            ? $accent : self::ACCENT;
    }

    /** One URL segment, and one directory name under content/. */
    public static function isSlug(string $slug): bool
    {
        return preg_match('~^[a-z0-9][a-z0-9_-]*$~', $slug) === 1;
    }
}
