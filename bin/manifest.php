<?php
/**
 * What a release archive is made of — the single list, read by bin/package
 * which copies it and by bin/test which checks nothing has fallen off it.
 *
 * The archive is the repository, so that unpacking one can seed a fresh git
 * repository unchanged. `repo` below is the only exception: paths that are
 * tracked on purpose and shipped on purpose never.
 */
declare(strict_types=1);

return [
    /* copied into the archive, in this order */
    'include' => [
        'README.md', 'LICENSE', 'VERSION', 'CONTEXT.md', 'CHANGELOG.md', 'AGENTS.md',
        '.gitignore',
        'docs/adr', 'docs/agents', 'docs/line-types.md', 'docs/keymap.md',
        'docs/format.md', 'docs/config.md', 'docs/deploy.md', 'docs/security.md',
        'docs/security-audit.md', 'docs/media',
        'shared', 'editor', 'site', 'bin', 'tests',
    ],

    /* pruned again afterwards, because they sit inside a directory that is
       copied whole: one instance's own configuration, and build output */
    'exclude' => ['site/site.php', 'dist', 'node_modules'],

    /* tracked in git, deliberately not in a release: the issue tracker's
       working directory is this repository's own process, not the software */
    'repo' => ['.scratch'],
];
