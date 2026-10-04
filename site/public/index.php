<?php
declare(strict_types=1);

/**
 * The only PHP entry point on the public origin.
 *
 * It reads markdown from content/ and writes HTML, or a Bundle's ZIP of what
 * it reads. It never writes a file, opens a socket, reads a cookie, starts a
 * session, or executes anything from the request. See docs/security.md.
 */

use TerminalCms\BasePath;
use TerminalCms\Highlighter;
use TerminalCms\Page;
use TerminalCms\Policy;
use TerminalCms\Router;
use TerminalCms\Site;

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
    exit(Site::NO_CONFIG . "\n");
}

/** @var array<string,mixed> $site */
$site = require $configFile;

Highlighter::load($root . '/shared/langs.json');

/* the site begins at the host's root, and a page's address ends where its
   name does */
$at = new BasePath('', false);

$router = new Router($site, $root . '/content', $at);
$result = $router->route($_SERVER['REQUEST_URI'] ?? '/');

/* The page has one inline point, the enhancement script, and it names this
   nonce instead of the policy naming 'unsafe-inline' — as do, on a page with
   a Diagram, the Mermaid script and the stylesheet the drawing places. One
   value per request, so a nonce a page carries is no use to the next
   request. */
$nonce = Policy::nonce();

http_response_code($result['status']);
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
header('Content-Security-Policy: ' . Policy::forHeader($nonce));

/* A Bundle is written as it is read, straight to the response: nothing
   holds the archive, and nothing buffers it on the way out. */
if (isset($result['bundle'])) {
    header('Content-Type: application/zip');
    header('Content-Disposition: ' . $result['bundle']->disposition());
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    $result['bundle']->write(fopen('php://output', 'wb'));
    exit;
}

header('Content-Type: text/html; charset=utf-8');
echo Page::html($site, $result, $nonce, $at);
