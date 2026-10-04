<?php
declare(strict_types=1);

namespace TerminalCms;

/** The HTML shell. One template, no engine. */
final class Page
{
    /**
     * Where a page with a Diagram loads Mermaid from: its own copy, beside the
     * stylesheets. The one address the enhancement script can ask for, and
     * the one place it is written.
     */
    private const MERMAID = '/mermaid.min.js';

    /**
     * @param array<string,mixed> $site
     * @param array{status:int,title:string,body:string,active:?string,lang?:string,meta?:array<string,string>} $r
     *        meta is the Meta of the Document the page shows, which may name
     *        its Theme and Palette; a page with no Document has none
     * @param string $nonce the page's CSP nonce, one per request or one per
     *        Page Build, which the page's one inline point — the enhancement
     *        script — has to carry to run at all. A caller with no policy to
     *        satisfy passes none and gets the page without the attribute.
     * @param BasePath $at where the site begins, which every local address in
     *        the shell is written under. The Router that made $r is given the
     *        same one.
     * @param bool $ownPolicy whether the page names its policy itself, in a
     *        <meta> ahead of everything the policy governs, for a host that
     *        sends no header of the site's. A page served with the header
     *        does not; one that does has to have a base64 nonce to name.
     */
    public static function html(
        array $site,
        array $r,
        string $nonce = '',
        BasePath $at = new BasePath(),
        bool $ownPolicy = false,
    ): string {
        /* the policy is written into the page as it reads, unescaped: its
           directives are Policy's own, and a base64 nonce holds no character
           an attribute would have to escape */
        if ($ownPolicy && preg_match('~^[A-Za-z0-9+/]+={0,2}$~', $nonce) !== 1) {
            throw new \InvalidArgumentException('a page that names its policy needs a base64 nonce');
        }

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

        /* the navigation names top-level Categories, and a Sub-category's page
           and its Documents have their parent on */
        $active = explode('/', (string) $r['active'])[0];
        $nav = '';
        foreach (Site::categories($site) as $c) {
            $on   = $c['slug'] === $active ? ' class="on"' : '';
            $nav .= '<a href="' . e($at->page($c['slug'])) . '"' . $on . '>' . e($c['label']) . '</a>';
        }

        $theme   = Site::themeFor($site, $r['meta'] ?? []);
        $palette = Site::paletteFor($site, $r['meta'] ?? []);
        /* the tagline is read in the top bar and indexed as the description */
        $tagline = trim((string) ($site['tagline'] ?? ''));
        /* a footer that disagreed with the body about where a link opens would
           be the same instance answering the same question two ways */
        $footer  = self::footer($site['footer'] ?? '', Site::linkOpen($site), $at);

        /* the picture is in the brand link, in front of the words it is the
           picture of — so the instance is named whether or not it loads */
        $logo = Site::logo($site);
        $brand = ($logo !== '' ? '<img class="logo" src="' . e($at->local($logo)) . '" alt="' . e($name) . '">' : '')
               . e($name);

        /* the icon in the reader's tab, which a browser asks for whether or
           not the page names one — so naming it is how the answer stops being
           a rendered 404. The type is the file's where the extension says so */
        $iconLink = '';
        $icon = Site::favicon($site);
        if ($icon !== '') {
            $type = Site::faviconType($icon);
            $iconLink = "\n" . '<link rel="icon" href="' . e($at->local($icon)) . '"'
                      . ($type !== '' ? ' type="' . e($type) . '"' : '') . '>';
        }

        return '<!doctype html>
<html lang="' . e($lang) . '" data-theme="' . e($theme) . '"' .
($palette !== '' ? ' data-palette="' . e($palette) . '"' : '') . '>
<head>' .
($ownPolicy ? "\n" . '<meta http-equiv="Content-Security-Policy" content="' . Policy::forMeta($nonce) . '">' : '') . '
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>' . e($title) . '</title>' .
($tagline !== '' ? "\n" . '<meta name="description" content="' . e($tagline) . '">' : '') .
$iconLink . '
<link rel="stylesheet" href="' . e($at->local('/theme.css')) . '">
<link rel="stylesheet" href="' . e($at->local('/themes/' . $theme . '.css')) . '">
<link rel="stylesheet" href="' . e($at->local('/site.css')) . '">
</head>
<body class="reader">
<div class="topbar">
  <a class="brand" href="' . e($at->page('')) . '">' . $brand . '</a>' .
($tagline !== '' ? "\n" . '  <span class="tagline">' . e($tagline) . '</span>' : '') . '
  <nav>' . $nav . '</nav>
  <div class="host">
    <button type="button" id="smaller" hidden title="smaller text">A&minus;</button>
    <button type="button" id="bigger" hidden title="bigger text">A+</button>
    <button type="button" id="palette" hidden>light/dark</button>
  </div>
</div>

<main class="reader-page">
' . $r['body'] . '
</main>

' . $footer . '
' . self::enhancement($nonce, self::hasDiagram($r['body']) ? $at->local(self::MERMAID) : '',
                      self::hasImage($r['body'])) . '
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
     *
     * @param string $linkOpen where a link to another site opens — Renderer::inline()
     * @param BasePath $at where the site begins — Renderer::inline()
     */
    private static function footer(mixed $config, string $linkOpen, BasePath $at): string
    {
        $lines = [];
        foreach (is_array($config) ? $config : [$config] as $line) {
            if (!is_scalar($line)) {
                continue;
            }
            $line = trim((string) $line);
            if ($line !== '') {
                $lines[] = '<span>' . Renderer::inline($line, $linkOpen, $at) . '</span>';
            }
        }
        if ($lines === []) {
            return '';
        }

        return '<footer class="reader-page site-foot">' . implode('', $lines) . '</footer>';
    }

    /**
     * The attribute that lets the page's inline script run under the page's
     * Content-Security-Policy.
     */
    private static function nonceAttr(string $nonce): string
    {
        return $nonce !== '' ? ' nonce="' . e($nonce) . '"' : '';
    }

    /**
     * Whether the body holds a Diagram: a code block the Renderer wrote in the
     * mermaid Dialect. The tags are the Renderer's own — a writer's text that
     * spells them out arrives escaped, so it cannot make a page load anything.
     */
    private static function hasDiagram(string $body): bool
    {
        return str_contains($body, '<div class="block-bar"><span class="lang">mermaid</span></div><pre class="code">');
    }

    /** Whether the body holds an Image, by the Renderer's own tag, as hasDiagram(). */
    private static function hasImage(string $body): bool
    {
        return str_contains($body, '<figure><img src="');
    }

    /**
     * The page is complete and readable with this script blocked or disabled:
     * on every page it adds a copy button to code blocks, a Palette toggle and a
     * text-size control, and it is inline so there is no third-party origin to
     * trust. No content depends on it. Remove it and you lose those
     * conveniences, not any words.
     *
     * On a page with a Diagram, and only there, it also draws each one over
     * its code block with the Mermaid copy served beside the stylesheets. The
     * tag then names that address, and the script loads it carrying the nonce
     * it read off its own tag, so the policy names nothing new.
     *
     * On a page with an Image or a Diagram it also adds the Full View. On
     * every other page the script is the three conveniences alone and fetches
     * nothing.
     *
     * @param string $mermaid where Mermaid is served, under the Base Path, on a
     *        page with a Diagram; '' on every other page
     * @param bool $image whether the page has an Image
     */
    private static function enhancement(string $nonce, string $mermaid, bool $image): string
    {
        /* nowdocs, so that not one character of the script below is read as
           PHP: a heredoc would interpolate a `$` and eat a `\` */
        return '<script' . self::nonceAttr($nonce)
             . ($mermaid !== '' ? ' data-mermaid="' . e($mermaid) . '"' : '') . '>'
             . <<<'HTML'

(function () {
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* the Palette: the reader's own choice, and until there is one the one
     the page opened in — its Document's or the instance's, or with no
     attribute at all the browser's preference, which the sheet answers */
  var p = get('tcms-palette');
  if (p === 'light' || p === 'dark') document.documentElement.setAttribute('data-palette', p);
  var b = document.getElementById('palette');
  b.hidden = false;
  b.addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-palette');
    if (!cur) cur = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-palette', next);
    set('tcms-palette', next);
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

HTML
             . ($mermaid !== '' || $image ? self::FULL_VIEW : '')
             . ($mermaid !== '' ? self::DRAWING : '') . '</script>';
    }

    /**
     * The Full View, the part of the script a page with an Image or a Diagram
     * gets. Each picture is given a glass, a button in its corner, that opens
     * it alone in one <dialog>: fitted to the screen, or at its own size to be
     * scrolled, a tap on it or the 1:1 button apart. Esc, × or a tap beside
     * the picture close it, and focus goes back to the glass.
     *
     * An Image is shown as a second <img> of the same address and saved from
     * that address. A Diagram is moved into the dialog and back again, since a
     * copy would lose the styles placed on it through the CSSOM; while it is
     * away an empty <svg> of its size keeps its place. It saves as the SVG
     * being looked at, its stylesheet inside it without the nonce, and as its
     * source, each a Blob URL let go of once the download has it. The saved
     * SVG is a file read under no policy, so it is written without anything
     * that would run or fetch when it is opened.
     *
     * The drawing announces each picture it places with a tcms-drawn event on
     * the Diagram's block, the first time and after every redraw, carrying the
     * source and the Diagram's place on the page.
     */
    private const FULL_VIEW = <<<'HTML'
(function () {
  var view, stage, saves, oneToOne, shut, returnTo, placeholder = null;

  /* the magnifying glass, parsed as markup so that the parser gives the
     icon its namespace */
  var GLASS = '<svg viewBox="0 0 16 16" aria-hidden="true">'
            + '<circle cx="6.5" cy="6.5" r="4.5"></circle><path d="M10 10l4.5 4.5"></path></svg>';
  function glass(label, open) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'full';
    btn.setAttribute('aria-label', label);
    btn.appendChild(document.importNode(
      new DOMParser().parseFromString(GLASS, 'text/html').querySelector('svg'), true));
    btn.addEventListener('click', open);
    return btn;
  }

  function control(text, act) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = text;
    btn.addEventListener('click', act);
    return btn;
  }

  function build() {
    view = document.createElement('dialog');
    view.className = 'full-view';
    view.setAttribute('aria-label', 'full view');
    var bar = document.createElement('div');
    bar.className = 'full-bar';
    saves = document.createElement('span');
    oneToOne = control('1:1', function () { actual(!view.classList.contains('actual')); });
    shut = control('×', function () { view.close(); });
    shut.setAttribute('aria-label', 'close');
    bar.append(oneToOne, saves, shut);
    stage = document.createElement('div');
    stage.className = 'full-stage';
    view.append(bar, stage);
    document.body.appendChild(view);

    /* a tap on the picture is one size or the other, kept under the finger;
       a tap beside it closes */
    stage.addEventListener('click', function (e) {
      var pic = stage.firstElementChild;
      if (e.target === stage) { view.close(); return; }
      var was = pic.getBoundingClientRect();
      var x = (e.clientX - was.left) / was.width, y = (e.clientY - was.top) / was.height;
      actual(!view.classList.contains('actual'));
      var now = pic.getBoundingClientRect();
      stage.scrollLeft += now.left + x * now.width - e.clientX;
      stage.scrollTop += now.top + y * now.height - e.clientY;
    });
    view.addEventListener('close', closed);
  }

  function actual(on) {
    view.classList.toggle('actual', on);
    oneToOne.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  /* a drawing has no size of its own but the one its viewBox names, which
     the sheet reads off the stage */
  function open(pic, saving, w, h) {
    if (!view) build();
    returnTo = document.activeElement;
    if (w) {
      stage.style.setProperty('--full-w', w + 'px');
      stage.style.setProperty('--full-h', h + 'px');
    }
    stage.appendChild(pic);
    saves.replaceChildren.apply(saves, saving);
    actual(false);
    view.showModal();
    shut.focus();
  }

  function closed() {
    var pic = stage.firstElementChild;
    if (placeholder) { placeholder.replaceWith(pic); placeholder = null; } else if (pic) pic.remove();
    saves.replaceChildren();
    if (returnTo && returnTo.isConnected) returnTo.focus();
  }

  /* a download is an anchor the page clicks: on the Image's own address, or
     on a Blob URL made for it and let go of once the click has it */
  function save(href, name) {
    var a = document.createElement('a');
    a.href = href; a.download = name;
    a.click();
  }
  function saveText(text, type, name) {
    var url = URL.createObjectURL(new Blob([text], { type: type }));
    save(url, name);
    URL.revokeObjectURL(url);
  }

  document.querySelectorAll('main figure > img').forEach(function (img) {
    var at = document.createElement('div');
    at.className = 'full-at';
    img.replaceWith(at);
    at.appendChild(img);
    at.appendChild(glass('full view of the picture', function () {
      var big = document.createElement('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      open(big, [control('save', function () { save(big.src, ''); })]);
    }));
  });

  /* what a page's Diagrams are saved as: the last part of the page's
     address, and the Diagram's place on it */
  var base = location.pathname.replace(/\/+$/, '').replace(/^.*\//, '').replace(/\.html?$/, '') || 'index';

  document.addEventListener('tcms-drawn', function (e) {
    var block = e.target, n = e.detail.n, src = e.detail.src;
    if (block.querySelector(':scope > .full')) return;
    block.appendChild(glass('full view of the diagram', function () {
      var svg = block.querySelector(':scope > svg');
      var box = svg.viewBox.baseVal, size = svg.getBoundingClientRect();
      placeholder = document.createElementNS(svg.namespaceURI, 'svg');
      placeholder.setAttribute('aria-hidden', 'true');
      placeholder.style.setProperty('width', size.width + 'px');
      placeholder.style.setProperty('height', size.height + 'px');
      svg.replaceWith(placeholder);
      open(svg, [
        control('svg', function () {
          saveText(drawing(stage.firstElementChild), 'image/svg+xml', base + '-' + n + '.svg');
        }),
        control('mmd', function () { saveText(src, 'text/plain', base + '-' + n + '.mmd'); })
      ], box && box.width ? box.width : size.width, box && box.height ? box.height : size.height);
    }));
  });

  /* the drawing as the reader sees it: on the ground it is shown on, which
     its colours were chosen for, its own stylesheet inside it, and without
     the nonce, which belongs to this page and to no other. The copy is never
     in the page, so nothing in it is read as a stylesheet.

     The file is opened under no policy, so the copy loses what the page's
     policy refused the drawing: every element and attribute that could run
     or load something, and every address but a link's — in an attribute,
     a presentation attribute included, in a declaration and in the
     stylesheet. A reference into the drawing itself, #…, stays. */
  var GONE = /^(script|iframe|object|embed|video|audio|source|track|link|meta|base|form|set|animate|animatemotion|animatetransform)$/;
  var ASKS = /^(src|srcset|poster|data|action|formaction|background|ping|href)$/;
  var FETCHES = /(?:url|src)\(\s*(?!["']?#)|image-set\(/i;
  var drop = Element.prototype.remove;
  function drawing(svg) {
    var copy = svg.cloneNode(true);
    copy.querySelectorAll('*').forEach(function (el) {
      if (el instanceof HTMLFormElement || GONE.test(el.localName.toLowerCase())) { drop.call(el); return; }
      if (el.style) quiet(el.style);
      var anchor = el.localName === 'a';
      [].slice.call(el.attributes).forEach(function (attr) {
        var name = attr.localName.toLowerCase(), value = attr.value.trim();
        var link = anchor && name === 'href' && /^(https?:|mailto:)/i.test(value);
        if (/^on/.test(name) || (ASKS.test(name) && !link && value.charAt(0) !== '#')
            || FETCHES.test(value) || /\\.*\(/.test(value)) el.removeAttributeNode(attr);
      });
    });
    var sheet = new CSSStyleSheet();
    copy.querySelectorAll('style').forEach(function (el) {
      el.removeAttribute('nonce');
      sheet.replaceSync(el.textContent);
      quietRules(sheet);
      el.textContent = [].map.call(sheet.cssRules, function (rule) { return rule.cssText; }).join('\n');
    });
    copy.style.setProperty('background-color', getComputedStyle(view).backgroundColor);
    return new XMLSerializer().serializeToString(copy);
  }

  /* the browser's own reading of each declaration, so an address is judged
     as it is spelled back and not as it was written; a custom property is
     spelled back as written, and one with an escape in it goes */
  function quiet(style) {
    for (var i = style.length - 1; i >= 0; i--) {
      var name = style[i], value = style.getPropertyValue(name);
      if (FETCHES.test(value) || (name.indexOf('--') === 0 && value.indexOf('\\') >= 0)) style.removeProperty(name);
    }
  }
  function quietRules(sheet) {
    for (var i = sheet.cssRules.length - 1; i >= 0; i--) {
      var rule = sheet.cssRules[i];
      if (rule.style) quiet(rule.style);
      if (rule.cssRules) quietRules(rule);
      if (!rule.style && !rule.cssRules && !/^@namespace/i.test(rule.cssText) && FETCHES.test(rule.cssText)) sheet.deleteRule(i);
    }
  }
})();

HTML;

    /**
     * Drawing, the part of the script a page with a Diagram gets. Mermaid is
     * asked for a picture of each Diagram's source, and the picture is placed
     * over the code block by hand, because Mermaid writes a <style> element and
     * style attributes, both of which the nonce policy refuses. Its stylesheet
     * goes into one <style> made here with the nonce, and each style attribute
     * is taken off and written back through the CSSOM once the SVG is in the
     * page, a declaration at a time, which the policy permits. A source that does not parse keeps its
     * code block, and the page says nothing about it. The Palette toggle draws
     * every Diagram again in the new colours. Each picture placed is announced
     * to the Full View with a tcms-drawn event on its block.
     *
     * The Editor's read pane draws in editor/ui.js, its colours read off the
     * pane rather than the page. It keeps drawings between keystrokes and
     * prints the error for a writer, and a drawing's stylesheet is a
     * constructed one the document adopts rather than a <style> element.
     */
    private const DRAWING = <<<'HTML'
(function () {
  var own = document.currentScript;
  var diagrams = [].map.call(document.querySelectorAll('.block'), function (block) {
    var lang = block.querySelector(':scope > .block-bar .lang');
    var pre = block.querySelector(':scope > pre.code');
    return lang && pre && lang.textContent === 'mermaid' ? { block: block, shown: pre, src: pre.textContent } : null;
  }).filter(Boolean);
  if (!diagrams.length) return;
  diagrams.forEach(function (d, i) { d.n = i + 1; });

  /* a Diagram's copy button copies its source exactly as written, where a
     code block's takes the prompt's space off every line */
  diagrams.forEach(function (d) {
    var was = d.block.querySelector(':scope > .block-bar .copy');
    if (!was) return;
    var btn = was.cloneNode(true);
    was.replaceWith(btn);
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(d.src).then(function () {
        btn.textContent = 'copied';
        setTimeout(function () { btn.textContent = 'copy'; }, 1200);
      });
    });
  });

  var nonce = own.nonce || '';
  var queue = Promise.resolve(), drawn = 0;

  /* one drawing at a time, each with the colours of the moment it was asked
     for, so a Palette flipped twice cannot draw one in the other's */
  function drawAll() {
    var config = diagramConfig();
    diagrams.forEach(function (d) {
      function one() {
        window.mermaid.initialize(config);
        return keepingStyles(function () {
          return window.mermaid.render('tcms-diagram-' + (++drawn), d.src);
        }).then(function (r) { place(d, r.svg); }, function () {});
      }
      queue = queue.then(one, one);
    });
  }

  /* Mermaid writes the declarations it has for one element, such as a style
     statement's fill, as a style attribute, and Firefox drops the value of a
     style attribute set on a page whose policy refuses inline styles. While
     Mermaid draws, a style attribute is written under another name instead,
     which place() reads back. That stands for the whole page while a drawing
     is made, so nothing else in this script writes a style attribute. */
  var KEPT_STYLE = 'data-tcms-style';
  function keepingStyles(draw) {
    var setAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
      return setAttribute.call(this, String(name).toLowerCase() === 'style' ? KEPT_STYLE : name, value);
    };
    function done() { Element.prototype.setAttribute = setAttribute; }
    var drawing;
    try { drawing = Promise.resolve(draw()); } catch (e) { done(); return Promise.reject(e); }
    return drawing.then(function (r) { done(); return r; },
                        function (e) { done(); throw e; });
  }

  function diagramConfig() {
    var root = document.documentElement;
    var css = getComputedStyle(root);
    function v(name) { return css.getPropertyValue(name).trim(); }
    var chosen = root.getAttribute('data-palette');
    var dark = chosen ? chosen === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    var font = getComputedStyle(document.querySelector('main') || document.body).fontFamily;
    /* Mermaid measures each label in a scratch element under <body>, where
       the policy refuses its styles, so the label is measured at <body>'s
       size; it is drawn at that size too, or its box is too small for it */
    var size = getComputedStyle(document.body).fontSize;
    return {
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: 'base',
      fontFamily: font,
      themeVariables: {
        darkMode: dark,
        fontFamily: font,
        fontSize: size,
        background: v('--bg'),
        primaryColor: v('--bg'),
        edgeLabelBackground: v('--bg'),
        primaryTextColor: v('--fg'),
        textColor: v('--fg'),
        lineColor: v('--fg'),
        primaryBorderColor: v('--accent')
      }
    };
  }

  function place(d, markup) {
    var from = new DOMParser().parseFromString(markup, 'text/html').querySelector('svg');
    if (!from) return;
    var css = '';
    from.querySelectorAll('style').forEach(function (el) {
      css += el.textContent + '\n';
      el.remove();
    });
    var inline = andBelow(from).map(function (el) {
      var style = [el.getAttribute('style'), el.getAttribute(KEPT_STYLE)].join(';');
      el.removeAttribute('style');
      el.removeAttribute(KEPT_STYLE);
      return style;
    });
    var svg = document.importNode(from, true);
    var live = andBelow(svg);
    var sheet = document.createElementNS(svg.namespaceURI, 'style');
    if (nonce) sheet.setAttribute('nonce', nonce);
    sheet.textContent = css;
    svg.insertBefore(sheet, svg.firstChild);
    d.shown.replaceWith(svg);
    d.shown = svg;
    live.forEach(function (el, i) {
      if (inline[i] && /[^\s;]/.test(inline[i])) restyle(el, inline[i]);
    });
    d.block.dispatchEvent(new CustomEvent('tcms-drawn', { bubbles: true, detail: { src: d.src, n: d.n } }));
  }

  /* A style attribute's declarations, read by the browser's own parser in a
     sheet the document never adopts, and set on the element one by one
     through the CSSOM, which the policy permits where it refuses the
     attribute. */
  var scratch = new CSSStyleSheet();
  function restyle(el, declarations) {
    scratch.replaceSync('x{' + declarations + '}');
    var rule = scratch.cssRules[0];
    if (!rule || !rule.style) return;
    for (var i = 0; i < rule.style.length; i++) {
      var name = rule.style[i];
      el.style.setProperty(name, rule.style.getPropertyValue(name),
                           rule.style.getPropertyPriority(name));
    }
  }

  /* an element and every element inside it, in document order — the same
     order for a tree and for its imported copy */
  function andBelow(el) { return [el].concat([].slice.call(el.querySelectorAll('*'))); }

  var s = document.createElement('script');
  s.src = own.getAttribute('data-mermaid');
  if (nonce) s.nonce = nonce;
  s.onload = function () { if (window.mermaid) drawAll(); };
  document.head.appendChild(s);
  document.getElementById('palette').addEventListener('click', function () {
    if (window.mermaid) drawAll();
  });
})();

HTML;
}
