<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * The atomic unit of a document: one piece of text carrying exactly one type
 * and, for CODE and CLI only, one dialect.
 */
final class Line
{
    /** Types whose consecutive lines render as one block. */
    public const RUNS = ['list', 'quote', 'note', 'code', 'cli', 'out', 'table'];

    /**
     * Prompt shown for each CLI dialect, and the token that identifies it again
     * on import. Every prompt is unique — two dialects sharing one would make
     * the second unreadable — and the order is match order: no prompt may sit
     * behind a prompt it starts with. editor/editor.js holds the same table and
     * bin/test compares the two.
     */
    public const PROMPTS = [
        'powershell' => 'PS>', 'cmd' => 'C:\\>',
        'sqlite' => 'sqlite>', 'mysql' => 'mysql>', 'psql' => 'psql>', 'sql' => 'sql>',
        'python' => '>>>', 'node' => 'node>', 'irb' => 'irb>', 'php' => 'php>',
        'tcsh' => 'tcsh>', 'nu' => 'nu>', 'fish' => '~>', 'ksh' => 'ksh$', 'sh' => 'sh$',
        'zsh' => '%', 'bash' => '$',
    ];

    public function __construct(
        public readonly string $type,
        public readonly string $text,
        public readonly ?string $sub = null,
    ) {
    }

    public function isRun(): bool
    {
        return in_array($this->type, self::RUNS, true);
    }

    /** Do these two lines belong to the same run? */
    public function joins(Line $next): bool
    {
        return $this->isRun()
            && $next->type === $this->type
            && $next->sub === $this->sub;
    }
}
