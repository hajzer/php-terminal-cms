<?php
declare(strict_types=1);

/** The only escaping function in the codebase. Everything user-visible goes through it. */
function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

const NS = 'TerminalCms\\';

spl_autoload_register(static function (string $class): void {
    if (!str_starts_with($class, NS)) {
        return;
    }
    $file = __DIR__ . '/' . substr($class, strlen(NS)) . '.php';
    if (is_file($file)) {
        require $file;
    }
});
