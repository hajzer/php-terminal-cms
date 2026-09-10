<?php
declare(strict_types=1);

namespace TerminalCms;

/** The HTML shell. One template, no engine. */
final class Page
{
    /**
     * @param array<string,mixed> $site
     * @param array{status:int,title:string,body:string,active:?string,lang?:string} $r
     * @param string $nonce the request's CSP nonce, which the two inline
     *        points on the page — the accent style block and the enhancement
     *        script — have to carry to run at all. A caller with no policy to
     *        satisfy passes none and gets the page without the attributes.
     */
    public static function html(array $site, array $r, string $nonce = ''): string
    {
        /* every key here is optional: a site.php that names none of them
           still has to render a page */
        $name  = (string) ($site['title'] ?? 'php-terminal-cms');
        $title = $r['title'] === $name ? $name : $r['title'] . ' · ' . $name;

        /* the page is in the language of the document it is showing, which is
           the site's own unless that document was written in another */
        $lang = $r['lang'] ?? '';
        if (!Language::isCode($lang)) {
            $lang = Site::lang($site);
        }

        $nav = '';
        foreach (Site::categories($site) as $c) {
            $on   = $c['slug'] === $r['active'] ? ' class="on"' : '';
            $nav .= '<a href="/' . e($c['slug']) . '"' . $on . '>' . e($c['label']) . '</a>';
        }

        $accent = Site::accent($site);
        /* the tagline is read in the top bar and indexed as the description */
        $tagline = trim((string) ($site['tagline'] ?? ''));
        $footer  = self::footer($site['footer'] ?? '');

        return '<!doctype html>
<html lang="' . e($lang) . '">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>' . e($title) . '</title>' .
($tagline !== '' ? "\n" . '<meta name="description" content="' . e($tagline) . '">' : '') . '
<link rel="stylesheet" href="/theme.css">
<link rel="stylesheet" href="/site.css">
<style' . self::nonceAttr($nonce) . '>:root{--accent:' . e($accent) . '}</style>
</head>
<body class="reader">
<div class="topbar">
  <a class="brand" href="/">' . e($name) . '</a>' .
($tagline !== '' ? "\n" . '  <span class="tagline">' . e($tagline) . '</span>' : '') . '
  <nav>' . $nav . '</nav>
  <div class="host">
    <button type="button" id="smaller" hidden title="smaller text">A&minus;</button>
    <button type="button" id="bigger" hidden title="bigger text">A+</button>
    <button type="button" id="theme" hidden>theme</button>
  </div>
</div>

<main class="reader-page">
' . $r['body'] . '
</main>

' . $footer . '
' . self::enhancement($nonce) . '
</body>
</html>
';
    }

    /**
     * The site footer, and the only thing in it: whatever site.php says. One
     * string is one line; a list is several. Each line is written in the same
     * inline markdown a document uses — [text](url), **bold**, *italic*,
     * `code` — and goes through the same escaping, so a footer cannot put
     * markup on the page any more than a document can.
     *
     * Nothing is added around it. A footer nobody configured is no footer.
     */
    private static function footer(mixed $config): string
    {
        $lines = [];
        foreach (is_array($config) ? $config : [$config] as $line) {
            if (!is_scalar($line)) {
                continue;
            }
            $line = trim((string) $line);
            if ($line !== '') {
                $lines[] = '<span>' . Renderer::inline($line) . '</span>';
            }
        }
        if ($lines === []) {
            return '';
        }

        return '<footer class="reader-page site-foot">' . implode('', $lines) . '</footer>';
    }

    /**
     * The attribute that lets one of the page's two inline points run under
     * the Content-Security-Policy the entry point sends.
     */
    private static function nonceAttr(string $nonce): string
    {
        return $nonce !== '' ? ' nonce="' . e($nonce) . '"' : '';
    }

    /**
     * The page is complete and readable with this script blocked or disabled:
     * it only adds a copy button to code blocks, a theme toggle and a text-size
     * control. No content depends on it, nothing is fetched, and it is inline so
     * there is no third-party origin to trust. Remove it and you lose three
     * conveniences, not any words.
     */
    private static function enhancement(string $nonce): string
    {
        /* a nowdoc, so that not one character of the script below is read as
           PHP: a heredoc would interpolate a `$` and eat a `\` */
        return '<script' . self::nonceAttr($nonce) . '>' . <<<'HTML'

(function () {
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var t = get('tcms-theme');
  if (t) document.documentElement.setAttribute('data-theme', t);
  var b = document.getElementById('theme');
  b.hidden = false;
  b.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    if (!cur) cur = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'normal';
    var next = cur === 'dark' ? 'normal' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    set('tcms-theme', next);
  });

  var scale = parseFloat(get('tcms-scale')) || 1;
  function size(d) {
    scale = Math.min(2, Math.max(0.7, Math.round((scale + d) * 100) / 100));
    document.documentElement.style.setProperty('--doc-scale', scale);
    set('tcms-scale', scale);
  }
  size(0);
  [['smaller', -0.1], ['bigger', 0.1]].forEach(function (pair) {
    var el = document.getElementById(pair[0]);
    el.hidden = false;
    el.addEventListener('click', function () { size(pair[1]); });
  });
  addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === '+' || e.key === '=') size(0.1);
    else if (e.key === '-' || e.key === '_') size(-0.1);
    else if (e.key === '0') { scale = 1; size(0); }
  });
  document.querySelectorAll('.block-bar').forEach(function (bar) {
    var pre = bar.parentNode.querySelector('pre.code, pre.cli');
    if (!pre) return;
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'copy'; btn.textContent = 'copy';
    btn.addEventListener('click', function () {
      /* the prompt is presentation: it is a span the renderer added, so take
         the span out rather than guessing at which prefixes are prompts.
         The editor does the same in editor/ui.js — see the note there. */
      var copy = pre.cloneNode(true);
      copy.querySelectorAll('.pr').forEach(function (p) { p.remove(); });
      var text = copy.textContent.replace(/^ /gm, '');
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'copied';
        setTimeout(function () { btn.textContent = 'copy'; }, 1200);
      });
    });
    bar.appendChild(btn);
  });
})();
</script>
HTML;
    }
}
