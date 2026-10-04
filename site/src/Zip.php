<?php
declare(strict_types=1);

namespace TerminalCms;

/**
 * A ZIP archive, written as it goes to a stream the caller owns.
 *
 * Every entry is stored (method 0): the bytes go in as they are, so nothing is
 * needed beyond PHP itself, and a file is read through once to take its CRC and
 * once more to copy it, never held whole. Names are flagged UTF-8. An entry's
 * time is the DOS time of its file's mtime in UTC, and the archive carries no
 * other time, so the same files give the same bytes on any host.
 *
 * No ZIP64: an entry of 4 GiB or more, an archive whose central directory
 * would start or end there, or 65535 entries or more, is refused rather than
 * written wrong — those are the sizes at which a field holds its ZIP64 marker.
 *
 *     $zip = new Zip(fopen('php://output', 'wb'));
 *     $zip->file('top/site/content/index.md', $path);
 *     $zip->data('top/README.txt', $text, $mtime);
 *     $zip->finish();
 */
final class Zip
{
    private const CHUNK = 65536;
    /** the ZIP64 markers: a 32-bit field and the entry count may not reach them */
    private const FIELD_LIMIT = 0xFFFFFFFF;
    private const COUNT_LIMIT = 0xFFFF;

    /** Each entry's central directory record, in the order written. @var list<string> */
    private array $central = [];
    /** @var array<string,true> */
    private array $names = [];
    private int $written = 0;
    private bool $finished = false;

    /** @param resource $out where the archive goes; finish() leaves it open */
    public function __construct(private $out)
    {
    }

    /** One file from disk, under the name it has in the archive. */
    public function file(string $name, string $path): void
    {
        $this->claim($name);
        clearstatcache(true, $path);
        $in = @fopen($path, 'rb');
        $mtime = @filemtime($path);
        $crc = @hash_file('crc32b', $path);
        if ($in === false || $mtime === false || $crc === false) {
            throw new \RuntimeException("cannot read $path");
        }
        $size = (int) fstat($in)['size'];
        try {
            $this->header($name, (int) hexdec($crc), $size, $mtime);
            $copiedCrc = hash_init('crc32b');
            $copied = 0;
            while (!feof($in)) {
                $chunk = fread($in, self::CHUNK);
                if ($chunk === false) {
                    break;
                }
                hash_update($copiedCrc, $chunk);
                $this->put($chunk);
                $copied += strlen($chunk);
            }
        } finally {
            fclose($in);
        }
        if ($copied !== $size || hash_final($copiedCrc) !== $crc) {
            throw new \RuntimeException("$path changed while it was written");
        }
    }

    /** Bytes that are not a file, with the time they are to carry. */
    public function data(string $name, string $bytes, int $mtime): void
    {
        $this->claim($name);
        $this->header($name, (int) hexdec(hash('crc32b', $bytes)), strlen($bytes), $mtime);
        $this->put($bytes);
    }

    /** The central directory and the end record. Nothing can be added after. */
    public function finish(): void
    {
        $this->open();
        $this->finished = true;
        $offset = $this->written;
        $size = array_sum(array_map('strlen', $this->central));
        if ($offset + $size >= self::FIELD_LIMIT) {
            throw new \LengthException('a central directory past 4 GiB needs ZIP64');
        }
        foreach ($this->central as $record) {
            $this->put($record);
        }
        $this->put(pack('VvvvvVVv',
            0x06054b50, 0, 0,                      // this disk, the directory's disk
            count($this->central), count($this->central),
            $this->written - $offset, $offset,
            0                                      // no comment
        ));
    }

    private function open(): void
    {
        if ($this->finished) {
            throw new \LogicException('the archive is already finished');
        }
    }

    /** Takes a name for the next entry: one a reader can unpack inside the
     *  directory it unpacks into, and not one it already has. */
    private function claim(string $name): void
    {
        $this->open();
        $segment = '[^/\\\\\x00-\x1F\x7F]+';
        if (preg_match('~^' . $segment . '(?:/' . $segment . ')*$~u', $name) !== 1
            || preg_match('~(?:^|/)\.\.?(?:/|$)~', $name) === 1
            || strlen($name) > 0xFFFF) {
            throw new \InvalidArgumentException('not a relative path of UTF-8 segments: ' . $name);
        }
        if (isset($this->names[$name])) {
            throw new \InvalidArgumentException("already in the archive: $name");
        }
        if (count($this->names) + 1 >= self::COUNT_LIMIT) {
            throw new \LengthException('65535 entries need ZIP64');
        }
        $this->names[$name] = true;
    }

    /** The local header, and the central record that will point back at it. */
    private function header(string $name, int $crc, int $size, int $mtime): void
    {
        if ($size >= self::FIELD_LIMIT || $this->written >= self::FIELD_LIMIT) {
            throw new \LengthException("$name is past 4 GiB, which needs ZIP64");
        }
        [$time, $date] = self::dos($mtime);
        /* needs 1.0, UTF-8 name, stored: the same in both records */
        $common = pack('vvvvvVVVv', 10, 0x0800, 0, $time, $date, $crc, $size, $size, strlen($name));
        $this->central[] = pack('Vv', 0x02014b50, 0x0314)   // made by: Unix, 2.0
            . $common
            . pack('vvvvVV', 0, 0, 0, 0, 0100644 << 16, $this->written)  // a plain rw-r--r-- file
            . $name;
        $this->put(pack('V', 0x04034b50) . $common . pack('v', 0) . $name);
    }

    /** @return array{0:int, 1:int} the DOS time and date, UTC, from 1980 to 2107 */
    private static function dos(int $t): array
    {
        $t = min(max($t, 315532800), 4354819198);
        [$y, $mo, $d, $h, $mi, $s] = array_map('intval', explode(' ', gmdate('Y n j G i s', $t)));
        return [($h << 11) | ($mi << 5) | intdiv($s, 2), (($y - 1980) << 9) | ($mo << 5) | $d];
    }

    private function put(string $bytes): void
    {
        $left = $bytes;
        while ($left !== '') {
            $n = fwrite($this->out, $left);
            if ($n === false || $n === 0) {
                throw new \RuntimeException('the archive could not be written');
            }
            $left = substr($left, $n);
        }
        $this->written += strlen($bytes);
    }
}
