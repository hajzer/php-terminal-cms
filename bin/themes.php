<?php
/**
 * The files the Themes make — read by bin/build which writes them and by
 * bin/test which checks they are current.
 *
 * Every shared/themes/<name>.json becomes editor/themes/<name>.css and
 * site/public/themes/<name>.css: its notice in the first comment, its
 * once-only tokens and light Palette under [data-theme="<name>"], and its
 * dark Palette under data-palette="dark" and again, for a page with no
 * data-palette, under a browser that prefers dark. editor/themes.js lists
 * them all as window.THEMES, in file order. The directory is the list.
 *
 * @return callable(string $root): array<string,string> the generated path
 *         under $root, with a leading slash, -> what it holds
 */
declare(strict_types=1);

return static function (string $root): array {
    /* a value lands in a declaration and the notice in a comment; nothing in
       either may end the one or the other */
    $safe = static function (string $where, string $v, string $refused): string {
        if (preg_match($refused, $v) === 1) {
            throw new RuntimeException("$where cannot hold " . json_encode($v));
        }
        return $v;
    };
    $block = static function (string $selector, array $tokens, string $indent, string $file) use ($safe): string {
        $out = "$indent$selector {\n";
        foreach ($tokens as $k => $v) {
            $out .= "$indent  $k: " . $safe("$file $k", (string) $v, '~[{};]|/\*|\*/~') . ";\n";
        }
        return $out . "$indent}\n";
    };

    $out  = [];
    $list = [];
    foreach (glob($root . '/shared/themes/*.json') ?: [] as $file) {
        $rel   = 'shared/themes/' . basename($file);
        $theme = json_decode((string) file_get_contents($file), true);
        if (!is_array($theme)) {
            throw new RuntimeException("$rel is not a JSON object");
        }
        $name  = basename($file, '.json');
        if (preg_match('~^[a-z0-9]+(?:-[a-z0-9]+)*$~', $name) !== 1) {
            throw new RuntimeException("$rel is not named like a slug");
        }
        $label = (string) ($theme['label'] ?? $name);
        $src   = (array) ($theme['source'] ?? []);
        foreach (['repo', 'author', 'license', 'copyright'] as $k) {
            if (!is_string($src[$k] ?? null)) {
                throw new RuntimeException("$rel has no source.$k");
            }
        }
        $once  = array_filter($theme, static fn ($k): bool => str_starts_with((string) $k, '--'), ARRAY_FILTER_USE_KEY);
        $sel   = '[data-theme="' . $name . '"]';

        $notice = $safe("$rel notice",
            "$label, from {$src['repo']} by {$src['author']}, {$src['license']}\n   {$src['copyright']}",
            '~\*/~');
        $css = "/* GENERATED from $rel by bin/build — do not edit.\n   $notice */\n\n"
             . $block($sel, $once + (array) ($theme['light'] ?? []), '', $rel) . "\n"
             . $block($sel . '[data-palette="dark"]', (array) ($theme['dark'] ?? []), '', $rel) . "\n"
             . "@media (prefers-color-scheme: dark) {\n"
             . $block($sel . ':not([data-palette="light"])', (array) ($theme['dark'] ?? []), '  ', $rel)
             . "}\n";

        $out['/editor/themes/' . $name . '.css']      = $css;
        $out['/site/public/themes/' . $name . '.css'] = $css;
        $list[] = ['name' => $name, 'label' => $label];
    }
    $out['/editor/themes.js'] = "/* GENERATED from shared/themes/ by bin/build — do not edit. */\n"
        . 'window.THEMES = ' . json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ";\n";
    return $out;
};
