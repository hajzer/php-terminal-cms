<?php
/**
 * 0.3.0: each Document's own Media.
 *
 * Until 0.3.0 an Image Line whose src is not an absolute local path named a
 * file in public/media/ itself. From 0.3.0 it names a file in the Document's
 * own directory under public/media/ — the Document's path under content/,
 * without .md and without its Language — and nothing looks in the old place.
 * For each such line, the file it showed is copied to where it is now looked
 * for. The original stays where it is.
 *
 * This file carries its own copy of the rules it migrates by, as they were in
 * 0.3.0, and reads site.php for the languages alone: it is never edited, and
 * a later release that moves the same files again does so in a Migration of
 * its own.
 */
declare(strict_types=1);

return static function (string $site): array {
    $content = $site . '/content';
    $media   = 'public/media';

    /* the languages a file name's suffix may name: the site's own and every
       other one declared, each a code; the longest first, so a region reads
       as one code and not as its tail */
    $config = (static fn (): mixed => require $site . '/site.php')();
    $config = is_array($config) ? $config : [];
    $isCode = static fn (mixed $c): bool => is_string($c) && preg_match('~^[a-z]{2,3}(-[a-z]{2})?$~', $c) === 1;
    $lang   = is_string($config['lang'] ?? null) ? strtolower(trim($config['lang'])) : '';
    $codes  = [$isCode($lang) ? $lang : 'en'];
    foreach ((array) ($config['languages'] ?? []) as $code) {
        $code = is_string($code) ? strtolower(trim($code)) : '';
        if ($isCode($code) && !in_array($code, $codes, true)) {
            $codes[] = $code;
        }
    }
    usort($codes, static fn (string $a, string $b): int => strlen($b) <=> strlen($a));

    /* every file under a directory, in name order, a directory a link leads
       back into read once */
    $walk = static function (string $dir, string $rel, array $seen) use (&$walk): array {
        $real = (string) realpath($dir);
        if (in_array($real, $seen, true)) {
            return [];
        }
        $names = array_diff(scandir($dir) ?: [], ['.', '..']);
        sort($names, SORT_STRING);
        $out = [];
        foreach ($names as $name) {
            $path = $rel === '' ? $name : "$rel/$name";
            if (is_dir("$dir/$name")) {
                array_push($out, ...$walk("$dir/$name", $path, [...$seen, $real]));
            } elseif (is_file("$dir/$name")) {
                $out[] = $path;
            }
        }
        return $out;
    };
    $files = $walk($content, '', []);

    /* the Image Lines of a Document, by line number: an image alone on its
       line, outside the frontmatter and outside a fence */
    $images = static function (string $md): array {
        $raw = preg_split('~\r\n|\r|\n~', $md) ?: [];
        $out = [];
        $i   = 0;
        $n   = count($raw);
        if ($n > 0 && rtrim($raw[0]) === '---') {
            for ($i = 1; $i < $n && rtrim($raw[$i]) !== '---'; $i++) {
            }
            $i++;
        }
        for (; $i < $n; $i++) {
            $t = trim($raw[$i]);
            if (preg_match('~^```([A-Za-z0-9_-]*)\s*$~', $t) === 1) {
                for ($i++; $i < $n && rtrim(trim($raw[$i])) !== '```'; $i++) {
                }
            } elseif (preg_match('~^!\[([^\]]*)\]\(([^)]+)\)$~', $t, $m) === 1) {
                $out[$i + 1] = trim($m[2]);
            }
        }
        return $out;
    };

    /* the file name 0.2.0 reduced a src to, or null for a src that is an
       absolute local path and names that path, then as now */
    $reduce = static function (string $src): ?string {
        $src = preg_replace('~[?#].*$~', '', $src) ?? $src;
        $src = preg_replace('~^\./~', '', $src) ?? $src;
        if (str_starts_with($src, '/')
            && !str_starts_with($src, '//')
            && !str_contains($src, '..')
            && preg_match('~[\x00-\x1F\x7F\\\\]~', $src) !== 1
        ) {
            return null;
        }
        return basename(str_replace('\\', '/', $src));
    };

    $actions = [];
    $planned = [];                /* each target a copy is already listed for */
    $sources = [];                /* each flat file an Image Line showed */
    foreach ($files as $file) {
        if (!str_ends_with($file, '.md')) {
            continue;
        }
        /* the Document's Media: its path under content/, without .md and
           without a Language its name ends in */
        $name = basename($file, '.md');
        foreach ($codes as $code) {
            if (strlen($name) > strlen($code) + 1 && str_ends_with($name, '-' . $code)) {
                $name = substr($name, 0, -strlen($code) - 1);
                break;
            }
        }
        if ($name === '') {
            $actions[] = ['note', "content/$file has no name its Media could be kept under — left as it is"];
            continue;
        }
        $path = (dirname($file) === '.' ? '' : dirname($file) . '/') . $name;

        foreach ($images((string) file_get_contents("$content/$file")) as $line => $src) {
            $at       = "content/$file:$line";
            $basename = $reduce($src);
            if ($basename === null) {
                continue;
            }
            if ($basename === '' || $basename === '.' || $basename === '..' || str_starts_with($basename, '.')) {
                $actions[] = ['note', "$at: \"$src\" names no file a Document's Media can hold — left as it is"];
                continue;
            }
            $flat   = "$media/$basename";
            $target = "$media/$path/$basename";
            if (is_file("$site/$flat")) {
                $sources[$basename] = true;
            }
            if (file_exists("$site/$target")) {
                if (is_file("$site/$flat") && (!is_file("$site/$target")
                        || hash_file('sha256', "$site/$target") !== hash_file('sha256', "$site/$flat"))) {
                    $actions[] = ['note', "$at: $target is there already, and differs from $flat — left as it is"];
                }
            } elseif (isset($planned[$target])) {
                continue;
            } elseif (is_file("$site/$flat")) {
                $actions[] = ['copy', $flat, $target];
                $planned[$target] = true;
            } else {
                $actions[] = ['note', "$at: $basename is in neither $media/$path/ nor $media/ — a broken picture"];
            }
        }
    }

    /* a flat file that was shown, and that nothing names by its absolute
       path, is left for its operator to delete */
    $named = (string) file_get_contents("$site/site.php");
    foreach ($files as $file) {
        $named .= "\n" . file_get_contents("$content/$file");
    }
    $unused = array_keys($sources);
    sort($unused, SORT_STRING);
    foreach ($unused as $basename) {
        if (!str_contains($named, "/media/$basename")) {
            $actions[] = ['note', "$media/$basename: nothing in content/ or site.php names /media/$basename — unused, yours to delete"];
        }
    }

    return $actions;
};
