<?php
declare(strict_types=1);

/**
 * The only PHP entry point on the public origin.
 *
 * It reads markdown from content/ and writes HTML. It never writes a file,
 * opens a socket, reads a cookie, starts a session, or executes anything from
 * the request. See docs/security.md.
 */

use TerminalCms\Highlighter;
use TerminalCms\Page;
use TerminalCms\Router;

/**
 * The built-in development server routes every request through this script,
 * including real files. Apache and nginx serve those before PHP is reached
 * (see public/.htaccess); here we have to say so. Returning false hands the
 * request back to the server's static file handler.
 *
 * Dev-only path, but still resolved and contained rather than trusted.
 */
if (PHP_SAPI === 'cli-server') {
    $path = (string) (parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/');
    $real = realpath(__DIR__ . '/' . ltrim(rawurldecode($path), '/'));
    if ($real !== false
        && is_file($real)
        && str_starts_with($real, __DIR__ . DIRECTORY_SEPARATOR)
        && basename($real) !== 'index.php'
    ) {
        return false;
    }
}

$root = dirname(__DIR__);

require $root . '/src/bootstrap.php';

$configFile = $root . '/site.php';
if (!is_file($configFile)) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit("site.php is missing — copy site.php.example to site.php and edit it.\n");
}

/** @var array<string,mixed> $site */
$site = require $configFile;

Highlighter::load($root . '/shared/langs.json');

$router = new Router($site, $root . '/content');
$result = $router->route($_SERVER['REQUEST_URI'] ?? '/');

/* The page has two inline points — the accent style block and the enhancement
   script — and they name this nonce instead of the policy naming
   'unsafe-inline'. One value per request, so a nonce a page carries is no use
   to the next request. */
$nonce = base64_encode(random_bytes(16));

http_response_code($result['status']);
header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
header("Content-Security-Policy: default-src 'none'; img-src 'self'; style-src 'self' 'nonce-$nonce'; script-src 'nonce-$nonce'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");

echo Page::html($site, $result, $nonce);
