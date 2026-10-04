<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * Where on its host the site begins, and how a page's address ends.
 *
 * Every local address the site writes — navigation, Listings, language links,
 * the back link, assets, and a Link's Href or an Image's src written from the
 * site's root — is written through one of these. The request-time site uses
 * the default, an empty path and no trailing slash. A Page Build uses the path
 * of the base URL it is given and a trailing slash, because each of its pages
 * is a directory's index.html.
 *
 * The two entry points make it; nothing reads it from Site Config.
 */
final class BasePath
{
    /**
     * @param string $path '' or one or more `/segment`s, with no trailing
     *        slash; a segment is never `.` or `..`, and holds no backslash,
     *        whitespace, control character, `?` or `#`
     * @param bool $slash whether a page's address ends in `/`
     */
    public function __construct(
        public readonly string $path = '',
        public readonly bool $slash = false,
    ) {
        if (preg_match('~^(?:/(?!\.\.?(?:/|$))[^/\\\\\x00-\x20\x7F?#]+)*$~', $path) !== 1) {
            throw new \InvalidArgumentException("not a Base Path: $path");
        }
    }

    /**
     * The Base Path a URL names: its path, without the trailing slash. A bare
     * host and `/` both name the host's root, which is an empty Base Path.
     */
    public static function fromUrl(string $url, bool $slash = true): self
    {
        /* parse_url() turns a control character into '_' rather than refuse it */
        $path = preg_match('~[\x00-\x20\x7F]~', $url) === 1 ? false : parse_url($url, PHP_URL_PATH);
        if ($path === false) {
            throw new \InvalidArgumentException("not a URL: $url");
        }
        return new self(rtrim((string) $path, '/'), $slash);
    }

    /**
     * The address of a page, from its path below the site's root: '' is the
     * homepage, 'guides' a Category, 'guides/install' a Document.
     */
    public function page(string $path): string
    {
        return $path === ''
            ? $this->path . '/'
            : $this->path . '/' . $path . ($this->slash ? '/' : '');
    }

    /**
     * The address of a page's Bundle: the page's path with `.zip` on it,
     * whether or not a page's own address ends in `/`.
     */
    public function bundle(string $path): string
    {
        return $this->path . '/' . $path . '.zip';
    }

    /**
     * An address as the site writes it. One written from the site's root is
     * moved under the Base Path; a fragment, another origin and a mailto:
     * address are not local, and are left as they are.
     */
    public function local(string $address): string
    {
        return str_starts_with($address, '/') && !str_starts_with($address, '//')
            ? $this->path . $address
            : $address;
    }
}
