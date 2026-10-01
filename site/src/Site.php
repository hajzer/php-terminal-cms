<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * Site Config, read once and read defensively.
 *
 * site.php is hand-written trusted configuration, but it is still the only
 * file an instance edits, and a page has to render when a key is missing, a
 * category entry is the wrong shape, or a Theme names no Theme. Every reader
 * of the config goes through here, so there is one answer to what a category
 * is and one place a malformed one is dropped — the router, the navigation and
 * the listings cannot disagree about it.
 */
final class Site
{
    /** What an entry point says, and does not go on from, when there is no site.php. */
    public const NO_CONFIG = 'site.php is missing — copy site.php.example to site.php and edit it.';

    /** The Theme a page is drawn in when neither its Document nor the
     *  instance names one that exists. */
    public const THEME = 'baseline';

    /** Where a Theme is: a name is one only if its stylesheet is here. */
    private const THEMES = __DIR__ . '/../public/themes';

    /** The two Palettes a Theme is drawn in. */
    private const PALETTES = ['light', 'dark'];

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
     * The Theme the instance names, or Baseline. A name is a Theme only when
     * it is slug-shaped and its stylesheet is in public/themes/, so a page
     * never links a sheet that is not there and never fails over a spelling.
     *
     * @param array<string,mixed> $site
     */
    public static function theme(array $site): string
    {
        return self::themeName($site['theme'] ?? null) ?? self::THEME;
    }

    /**
     * The Palette the instance opens its pages in: 'light', 'dark', or '' for
     * the reader's browser's preference — which is also what anything else
     * the instance names is.
     *
     * @param array<string,mixed> $site
     */
    public static function palette(array $site): string
    {
        return self::paletteWord($site['palette'] ?? null) ?? '';
    }

    /**
     * The Theme a page is drawn in: its Document's `theme:` Meta, else the
     * instance's, else Baseline. Each is read the same way, and one that is
     * not a Theme is passed over for the next.
     *
     * @param array<string,mixed> $site
     * @param array<string,string> $meta the Document's Meta; none for a page
     *        with no Document behind it
     */
    public static function themeFor(array $site, array $meta): string
    {
        return self::themeName($meta['theme'] ?? null) ?? self::theme($site);
    }

    /**
     * The Palette a page opens in: its Document's `palette:` Meta, else the
     * instance's, else '' — the reader's browser's. It is only how the page
     * opens: the reader's own choice, once made, is the script's to apply.
     *
     * @param array<string,mixed> $site
     * @param array<string,string> $meta the Document's Meta, as themeFor()
     */
    public static function paletteFor(array $site, array $meta): string
    {
        return self::paletteWord($meta['palette'] ?? null) ?? self::palette($site);
    }

    /** A value as a Theme's name, or null when it names none. */
    private static function themeName(mixed $name): ?string
    {
        return is_string($name) && self::isSlug($name = trim($name)) && is_file(self::THEMES . '/' . $name . '.css')
            ? $name : null;
    }

    /** A value as a Palette, or null when it is neither word. */
    private static function paletteWord(mixed $word): ?string
    {
        return is_string($word) && in_array($word = trim($word), self::PALETTES, true) ? $word : null;
    }

    /** One URL segment, and one directory name under content/. */
    public static function isSlug(string $slug): bool
    {
        return preg_match('~^[a-z0-9][a-z0-9_-]*$~', $slug) === 1;
    }
}
