<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * The Content-Security-Policy every page is read under, and the one place it
 * is written.
 *
 * Nothing may run on a page but what carries its nonce: the accent style
 * block, the enhancement script, and on a page with a Diagram the Mermaid
 * script and the stylesheet the drawing places. The request-time entry point
 * sends the policy as a header with a nonce per request. A built page names it
 * in a <meta> with a nonce per Page Build, since a static host sends no header
 * the site chooses — and a <meta> cannot carry frame-ancestors, so that one
 * directive is the header's alone.
 */
final class Policy
{
    /** What the page's nonce stands in for in the directives. */
    private const NONCE = '{nonce}';

    /** The directive a <meta> policy is not allowed to carry. */
    private const HEADER_ONLY = 'frame-ancestors';

    private const DIRECTIVES = [
        "default-src 'none'",
        "img-src 'self'",
        "style-src 'self' 'nonce-" . self::NONCE . "'",
        "script-src 'nonce-" . self::NONCE . "'",
        "base-uri 'none'",
        "form-action 'none'",
        self::HEADER_ONLY . " 'none'",
    ];

    /** A fresh nonce: sixteen random bytes, base64. */
    public static function nonce(): string
    {
        return base64_encode(random_bytes(16));
    }

    /** The policy as the Content-Security-Policy header sends it. */
    public static function forHeader(string $nonce): string
    {
        return self::spell(self::DIRECTIVES, $nonce);
    }

    /** The policy as a page's own <meta> names it: the header's, but for frame-ancestors. */
    public static function forMeta(string $nonce): string
    {
        return self::spell(array_filter(
            self::DIRECTIVES,
            static fn (string $d) => !str_starts_with($d, self::HEADER_ONLY . ' ')
        ), $nonce);
    }

    /** @param array<string> $directives */
    private static function spell(array $directives, string $nonce): string
    {
        return str_replace(self::NONCE, $nonce, implode('; ', $directives));
    }
}
