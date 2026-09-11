/* php-terminal-cms editor — the whole thing.
 * No dependencies, no network, no build.
 *
 * Loads in a browser (with langs.js before it) and in node (for bin/test),
 * where the DOM half is skipped and the model half is exported.
 *
 * The line model here must agree with site/src/Markdown.php and Renderer.php.
 * bin/test asserts that it does. See docs/format.md for the contract. */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- types */

  /* Dialects a Code line can carry. Every one of them must have an entry in
     shared/langs.json, must be a legal fence info string, and must not collide
     with the words a fence uses for something else (output, text, console,
     shell-session, terminal) — bin/test asserts all three. */
  var CODE_SUBS = [
    'php', 'js', 'ts', 'python', 'ruby', 'go', 'rust', 'java', 'csharp', 'cpp', 'c',
    'swift', 'kotlin', 'scala', 'dart', 'objc', 'groovy', 'perl', 'lua', 'r',
    'julia', 'matlab', 'fortran', 'pascal', 'cobol', 'vb', 'asm',
    'haskell', 'ocaml', 'fsharp', 'elixir', 'erlang', 'clojure', 'lisp', 'scheme',
    'bash', 'sh', 'ksh', 'zsh', 'fish', 'tcsh', 'nu', 'powershell', 'cmd',
    'sql', 'html', 'xml', 'css', 'json', 'yaml', 'toml', 'ini',
    'dockerfile', 'makefile', 'nginx', 'graphql', 'hcl', 'diff'
  ];
  /* Dialects a CLI line can carry — a shell or an interactive prompt. */
  var CLI_SUBS = [
    'bash', 'sh', 'ksh', 'zsh', 'fish', 'tcsh', 'nu', 'powershell', 'cmd',
    'sql', 'psql', 'mysql', 'sqlite', 'python', 'node', 'irb', 'php'
  ];

  var TYPES = [
    { id: 'h1',    name: 'Heading 1', sigil: 'H1', key: '1' },
    { id: 'h2',    name: 'Heading 2', sigil: 'H2', key: '2' },
    { id: 'h3',    name: 'Heading 3', sigil: 'H3', key: '3' },
    { id: 'p',     name: 'Paragraph', sigil: '¶',  key: 'p' },
    { id: 'list',  name: 'List',      sigil: '•',  key: 'l' },
    { id: 'quote', name: 'Quote',     sigil: '"',  key: 'q' },
    { id: 'note',  name: 'Note',      sigil: '!',  key: 'n' },
    { id: 'table', name: 'Table',     sigil: '‖',  key: 't' },
    { id: 'code',  name: 'Code',      sigil: '{}', key: 'c', subs: CODE_SUBS },
    { id: 'cli',   name: 'CLI',       sigil: '$',  key: 's', subs: CLI_SUBS },
    { id: 'out',   name: 'Output',    sigil: '⟩',  key: 'u' },
    { id: 'rule',  name: 'Rule',      sigil: '—',  key: 'r' },
    { id: 'img',   name: 'Image',     sigil: '⧉',  key: 'f' },
    { id: 'meta',  name: 'Meta',      sigil: '@',  key: 'm' }
  ];
  var byId = {}, byKey = {};
  TYPES.forEach(function (t) { byId[t.id] = t; byKey[t.key] = t; });

  var RUNS = ['list', 'quote', 'note', 'code', 'cli', 'out', 'table'];

  /* The prompt each CLI dialect is written with — and the token that names the
     dialect again when the file is read back. Two dialects sharing a prompt
     would make one of them unreadable, so every prompt here is unique and the
     order is match order: no prompt may be reached only after a prompt it
     starts with. site/src/Line.php holds the same table; bin/test compares them.  */
  var PROMPTS = {
    powershell: 'PS>', cmd: 'C:\\>',
    sqlite: 'sqlite>', mysql: 'mysql>', psql: 'psql>', sql: 'sql>',
    python: '>>>', node: 'node>', irb: 'irb>', php: 'php>',
    tcsh: 'tcsh>', nu: 'nu>', fish: '~>', ksh: 'ksh$', sh: 'sh$',
    zsh: '%', bash: '$'
  };

  function langs() {
    return (typeof window !== 'undefined' && window.LANGS) ? window.LANGS : {};
  }
  /* The tokenizer tables for one Dialect. A Dialect may borrow another's with
     "like" — psql is sql, node is js. One level only: an alias never points at
     another alias. */
  function tablesFor(dialect) {
    var all = langs(), t = all[dialect];
    return (t && t.like) ? all[t.like] : t;
  }

  /* The same five characters, the same five entities, as e() in
     site/src/bootstrap.php — the editor's preview of a document has to be the
     bytes the site would send. bin/test compares the two outputs. */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c];
    });
  }

  /* ---------------------------------------------------------- highlighter */

  var NUM = '0[xX][0-9a-fA-F]+|\\d+(?:\\.\\d+)?',
      WORD = '[A-Za-z_#<?][\\w?-]*',
      WS = '\\s+';

  function highlight(code, dialect) {
    var L = tablesFor(dialect);
    if (!L) return esc(code);

    var kw = (L.kw || []).map(function (s) { return s.toLowerCase(); });
    var bi = (L.bi || []).map(function (s) { return s.toLowerCase(); });
    var pats = [['com', L.com], ['str', L.str], ['var', L.var],
                ['num', NUM], ['w', WORD], ['ws', WS]];

    var out = '', i = 0;
    while (i < code.length) {
      var hit = false;
      for (var p = 0; p < pats.length; p++) {
        var cls = pats[p][0], src = pats[p][1];
        if (!src) continue;
        var re = new RegExp(src, 'y');
        re.lastIndex = i;
        var m = re.exec(code);
        if (!m || !m[0].length) continue;
        var tok = m[0];
        if (cls === 'w') {
          var lo = tok.toLowerCase();
          cls = kw.indexOf(lo) > -1 ? 'kw' : (bi.indexOf(lo) > -1 ? 'bi' : null);
        }
        out += (cls && cls !== 'ws') ? '<span class="tk-' + cls + '">' + esc(tok) + '</span>' : esc(tok);
        i += tok.length;
        hit = true;
        break;
      }
      if (!hit) { out += esc(code[i]); i++; }
    }
    return out;
  }

  /* --------------------------------------------------------------- inline */

  /* The link target as the author wrote it: inline() escapes before it
     matches, so the five entities esc() produces come back off, and numeric
     references come off with them — "&#47;&#47;evil.example" is a
     protocol-relative URL in disguise and safeHref() has to see it as one.
     One pass, and only references below 128, which is every character a
     scheme, a slash or a colon is made of. */
  function rawHref(href) {
    return href
      .replace(/&#(?:x([0-9a-fA-F]+)|([0-9]+));/g, function (all, hex, dec) {
        var n = hex ? parseInt(hex, 16) : parseInt(dec, 10);
        return n > 0 && n < 128 ? String.fromCharCode(n) : all;
      })
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'").replace(/&amp;/g, '&');
  }

  /* Whether a link target is one the preview will show as a link — the same
     rule the site renders by, so what is a link here is a link there. A
     fragment and a local absolute path go out as written; everything else
     names http, https or mailto. "//host" is another origin in disguise, a
     backslash is a path separator to some clients, and a control character can
     cut an attribute short. */
  function safeHref(href) {
    if (!href || /[\x00-\x20\x7F\\]/.test(href)) return false;
    if (href.charAt(0) === '#') return /^#[A-Za-z0-9_-]*$/.test(href);
    if (href.charAt(0) === '/') {
      return href.charAt(1) !== '/' && href.indexOf('..') < 0;
    }
    return /^https?:\/\/[^/\\]/i.test(href) || /^mailto:[^\s@]+@[^\s@]+$/i.test(href);
  }

  /* The link syntax: a wording with no closing bracket in it, a target with no
     space and no closing paren. inline() and links() read it through this one
     expression, so what the overlay addresses is what the page publishes. */
  var LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

  function inline(s) {
    s = esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s.replace(LINK, function (all, text, target) {
      var href = rawHref(target);
      if (!safeHref(href)) return text;
      var ext = /^https?:\/\//i.test(href);
      return '<a href="' + esc(href) + '"' + (ext ? ' rel="noopener noreferrer"' : '') +
             '>' + text + '</a>';
    });
  }

  /* ------------------------------------------------------------ addressing */

  /* Everything about the thing a Line's text addresses — where the links in it
     are and how to rewrite them — kept clear of the DOM so node can drive it. */

  function asText(v) { return v == null ? '' : String(v); }

  /* Whether an href the author typed is one the page will publish as a link.
     inline() escapes a Line before it matches, so the judgement has to see the
     href the same way round, or the overlay warns about the wrong ones. */
  function safeLinkHref(href) {
    return safeHref(rawHref(esc(asText(href))));
  }

  /** The links in a Line's text, in the order they appear: the wording, the
   *  href as written, and where the whole `[wording](href)` sits. */
  function links(text) {
    var out = [], re = new RegExp(LINK.source, 'g'), m;
    text = asText(text);
    while ((m = re.exec(text)) !== null) {
      out.push({ wording: m[1], href: m[2], at: m.index, end: m.index + m[0].length });
    }
    return out;
  }

  /* Each half cut down to what the syntax carries: a wording holds no closing
     bracket and no line break, an href no space and no closing paren, so a
     link written here reads back as the link that was written. */
  function cleanWording(wording) { return asText(wording).replace(/[\]\r\n]/g, '').trim(); }
  function cleanHref(href) { return asText(href).replace(/[\s)]/g, ''); }

  /* `[wording](href)` — or, with nothing to point at, the wording alone, which
     is what unlinking leaves behind. A link with no wording is not a link, and
     nothing is written for it. */
  function mkLink(wording, href) {
    var w = cleanWording(wording), h = cleanHref(href);
    return w ? (h ? '[' + w + '](' + h + ')' : w) : '';
  }

  function spliceLink(text, hit, to) {
    return text.slice(0, hit.at) + to + text.slice(hit.end);
  }

  /** Rewrite the nth link of a Line's text, counting from zero. A link needs
   *  wording; without it the text stands as it was. */
  function setLink(text, n, wording, href) {
    var hit = links(text)[n], to = mkLink(wording, href);
    text = asText(text);
    return (hit && to) ? spliceLink(text, hit, to) : text;
  }

  /** Take the nth link away, leaving its wording exactly as it stands. */
  function unlink(text, n) {
    var hit = links(text)[n];
    text = asText(text);
    return hit ? spliceLink(text, hit, hit.wording) : text;
  }

  /** Put a new link at the end of a Line's text. It takes both halves: with no
   *  wording, or nothing to point at, there is no link to put there. */
  function addLink(text, wording, href) {
    var link = cleanHref(href) ? mkLink(wording, href) : '';
    text = asText(text);
    if (!link) return text;
    if (!text) return link;
    return /\s$/.test(text) ? text + link : text + ' ' + link;
  }

  /* ---------------------------------------------------------------- cells */

  /* A Table Line holds its Cells as one pipe-separated string: there is no
     grid anywhere, only Lines. Splitting one, joining it back, and finding
     where its Cells sit in the text the writer typed is everything the rest of
     the editor needs to know about the inside of a row. */

  /** Where each Cell of a Table Line begins and ends in the raw text. The
   *  caret walks between Cells, so the edges are the ones that were written,
   *  spacing and all — not the ones the trimmed Cells would have. */
  function cellSpans(text) {
    var s = asText(text), out = [], at = 0, i;
    for (i = 0; i <= s.length; i++) {
      if (i === s.length || s.charAt(i) === '|') {
        out.push({ at: at, end: i });
        at = i + 1;
      }
    }
    return out;
  }

  /** The Cells of a Table Line, trimmed, in the order they were written. A
   *  Line with no pipe in it is one Cell; an empty Line is one empty Cell. */
  function cells(text) {
    var s = asText(text);
    return cellSpans(s).map(function (c) { return s.slice(c.at, c.end).trim(); });
  }

  /** Which Cell of a Table Line the character at `at` belongs to. Past the end
   *  of the text, that is the last Cell. */
  function cellAt(text, at) {
    var spans = cellSpans(text), i;
    for (i = 0; i < spans.length; i++) if (at <= spans[i].end) return i;
    return spans.length - 1;
  }

  /** Where the nth Cell's content ends in the raw text — after the last
   *  character it holds, which is where a writer walking into it carries on
   *  typing. -1 when the Line has no such Cell. */
  function cellEnd(text, n) {
    var s = asText(text), c = cellSpans(s)[n];
    return c ? c.at + s.slice(c.at, c.end).replace(/\s+$/, '').length : -1;
  }

  /** Cells back into the text of a Line. */
  function joinCells(list) {
    return (list || []).map(function (c) { return asText(c).trim(); }).join(' | ');
  }

  /* A row of that many empty Cells — what a new row of a Run is born as. */
  function blankRow(width) {
    var out = [], i;
    for (i = 0; i < Math.max(1, width | 0); i++) out.push('');
    return joinCells(out);
  }

  /* ----------------------------------------------------------------- runs */

  function joins(a, b) {
    return RUNS.indexOf(a.type) > -1 && b.type === a.type && b.sub === a.sub;
  }
  function runs(lines) {
    var out = [], i = 0;
    while (i < lines.length) {
      var run = [lines[i]];
      i++;
      while (i < lines.length && joins(run[0], lines[i])) { run.push(lines[i]); i++; }
      out.push(run);
    }
    return out;
  }

  /* ------------------------------------------------------ markdown -> lines */

  function parse(md) {
    var raw = String(md).split(/\r\n|\r|\n/), lines = [], i = 0, n = raw.length;

    if (n && raw[0].trim() === '---') {
      i = 1;
      while (i < n && raw[i].trim() !== '---') {
        if (raw[i].trim() !== '') lines.push(mk('meta', raw[i].trim()));
        i++;
      }
      i++;
    }

    for (; i < n; i++) {
      var t = raw[i].trim(), m;

      if (t === '') continue;

      if ((m = /^```([A-Za-z0-9_-]*)\s*$/.exec(t))) {
        var info = m[1].toLowerCase(), body = [];
        i++;
        while (i < n && raw[i].trim() !== '```') { body.push(raw[i].replace(/\s+$/, '')); i++; }
        fence(info, body).forEach(function (l) { lines.push(l); });
        continue;
      }
      if ((m = /^(#{1,3})\s+(.*)$/.exec(t))) { lines.push(mk('h' + m[1].length, m[2].trim())); continue; }
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t))  { lines.push(mk('rule', '')); continue; }
      if ((m = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(t))) {
        lines.push(mk('img', m[2].trim(), m[1] || null)); continue;
      }
      if ((m = /^\|(.+)\|$/.exec(t))) {
        var row = m[1].trim();
        /* the alignment row is the one written out of dashes — a row whose
           Cells are all empty is a row, and has to read back as one */
        if (!/^[\s:|-]*-[\s:|-]*$/.test(row)) {
          lines.push(mk('table', joinCells(cells(row))));
        }
        continue;
      }
      if ((m = /^[-*+]\s+(.*)$/.exec(t))) { lines.push(mk('list', m[1].trim())); continue; }

      if (t.charAt(0) === '>') {
        var isNote = /^>\s*\[!(NOTE|IMPORTANT|WARNING|TIP)\]\s*$/i.test(t);
        if (isNote) i++;
        for (; i < n; i++) {
          var q = raw[i].trim();
          if (q.charAt(0) !== '>') break;
          var body2 = q.slice(1).trim();
          if (body2 !== '') lines.push(mk(isNote ? 'note' : 'quote', body2));
        }
        i--;
        continue;
      }

      /* CommonMark: consecutive plain lines are one paragraph */
      var para = [t];
      while (i + 1 < n) {
        var next = raw[i + 1].trim();
        if (next === '' || isConstruct(next)) break;
        para.push(next);
        i++;
      }
      lines.push(mk('p', para.join(' ')));
    }

    return lines;
  }

  function isConstruct(t) {
    return t === '' ||
      t.indexOf('```') === 0 ||
      t.charAt(0) === '>' ||
      /^#{1,3}\s/.test(t) ||
      /^(-{3,}|\*{3,}|_{3,})$/.test(t) ||
      /^!\[[^\]]*\]\([^)]+\)$/.test(t) ||
      /^\|(.+)\|$/.test(t) ||
      /^[-*+]\s/.test(t);
  }

  function fence(info, body) {
    if (info === 'output' || info === 'text' || info === '') {
      return body.map(function (b) { return mk('out', b); });
    }
    if (info === 'console' || info === 'shell-session' || info === 'terminal') {
      return body.map(function (b) {
        var s = b.replace(/^\s+/, ''), dialect = 'bash', text = b;
        for (var d in PROMPTS) {
          if (s.indexOf(PROMPTS[d]) === 0) {
            dialect = d;
            text = s.slice(PROMPTS[d].length).replace(/^\s/, '');
            break;
          }
        }
        return mk('cli', text, dialect);
      });
    }
    return body.map(function (b) { return mk('code', b, info); });
  }

  /* ------------------------------------------------------ lines -> markdown */

  function toMarkdown(lines) {
    var out = [];
    var meta = lines.filter(function (l) { return l.type === 'meta'; });
    if (meta.length) {
      out.push('---');
      meta.forEach(function (l) { out.push(l.text); });
      out.push('---', '');
    }

    runs(lines.filter(function (l) { return l.type !== 'meta'; })).forEach(function (run) {
      var f = run[0];
      switch (f.type) {
        case 'h1': out.push('# ' + f.text, ''); break;
        case 'h2': out.push('## ' + f.text, ''); break;
        case 'h3': out.push('### ' + f.text, ''); break;
        case 'p':  out.push(f.text, ''); break;
        case 'rule': out.push('---', ''); break;
        case 'img': out.push('![' + (f.sub || 'figure') + '](' + f.text + ')', ''); break;
        case 'list': run.forEach(function (l) { out.push('- ' + l.text); }); out.push(''); break;
        case 'quote': run.forEach(function (l) { out.push('> ' + l.text); }); out.push(''); break;
        case 'note':
          out.push('> [!NOTE]');
          run.forEach(function (l) { out.push('> ' + l.text); });
          out.push('');
          break;
        case 'code':
          out.push('```' + (f.sub || ''));
          run.forEach(function (l) { out.push(l.text); });
          out.push('```', '');
          break;
        case 'cli':
          out.push('```console');
          run.forEach(function (l) { out.push((PROMPTS[l.sub] || '$') + ' ' + l.text); });
          out.push('```', '');
          break;
        case 'out':
          out.push('```output');
          run.forEach(function (l) { out.push(l.text); });
          out.push('```', '');
          break;
        case 'table': {
          var rows = run.map(function (l) { return cells(l.text); });
          var width = Math.max.apply(null, rows.map(function (r) { return r.length; }));
          rows.forEach(function (row, k) {
            while (row.length < width) row.push('');
            out.push('| ' + row.join(' | ') + ' |');
            if (k === 0) out.push('|' + new Array(width + 1).join(' --- |'));
          });
          out.push('');
          break;
        }
      }
    });

    return out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/\s+$/, '') + '\n';
  }

  /* -------------------------------------------------------------- renderer */

  /* The document's own metadata, printed under its title. title: is left out:
     it is the title, and the title is already there. */
  function metaBar(lines) {
    var parts = lines.filter(function (l) {
      return l.type === 'meta' && l.text.indexOf('title:') !== 0;
    }).map(function (l) { return esc(l.text); });
    return parts.length ? '<div class="doc-meta">' + parts.join(' · ') + '</div>' : '';
  }

  function renderDoc(lines, opts) {
    opts = opts || {};
    var html = [];
    var pending = opts.meta === false ? '' : metaBar(lines);

    var rs = runs(lines.filter(function (l) { return l.type !== 'meta'; }));

    function outSec(run) {
      var id = run[0].id;
      var open = run[0].fold === true ? '' : ' open';
      return '<details class="outsec"' + open + ' data-fold="' + id + '">' +
        '<summary>output <i>' + run.length + ' line' + (run.length > 1 ? 's' : '') +
        '</i></summary><pre class="outp">' +
        run.map(function (x) { return esc(x.text); }).join('\n') + '</pre></details>';
    }

    for (var k = 0; k < rs.length; k++) {
      var run = rs[k], f = run[0];
      switch (f.type) {
        case 'h1':
          html.push('<h1>' + inline(f.text) + '</h1>');
          if (pending) { html.push(pending); pending = ''; }
          break;
        case 'h2': html.push('<h2>' + inline(f.text) + '</h2>'); break;
        case 'h3': html.push('<h3>' + inline(f.text) + '</h3>'); break;
        case 'p':  html.push('<p>' + inline(f.text) + '</p>'); break;
        case 'rule': html.push('<hr>'); break;
        case 'img': {
          /* The real picture, so the writer can see whether it is the right
             one. The box with the file name in it is what an src that does not
             load falls back to — the caption is the alt either way. */
          var box = '<div class="imgbox"' + (f.text ? ' hidden' : '') + '>' +
            esc(f.text) + '</div>';
          var pic = f.text
            ? '<img src="' + esc(f.text) + '" alt="' + esc(f.sub || '') + '" onerror="' +
              'this.hidden=true;this.nextElementSibling.hidden=false">'
            : '';
          html.push('<figure>' + pic + box +
            '<figcaption>' + esc(f.sub || 'figure') + '</figcaption></figure>');
          break;
        }
        case 'list':
          html.push('<ul>' + run.map(function (x) {
            return '<li>' + inline(x.text) + '</li>'; }).join('') + '</ul>');
          break;
        case 'quote':
          html.push('<blockquote>' + run.map(function (x) {
            return inline(x.text); }).join('<br>') + '</blockquote>');
          break;
        case 'note':
          html.push('<div class="note"><span class="note-tag">note</span>' +
            run.map(function (x) { return inline(x.text); }).join(' ') + '</div>');
          break;
        case 'table': {
          var rows = run.map(function (l) { return cells(l.text); });
          var w = Math.max.apply(null, rows.map(function (r) { return r.length; }));
          var t = '<div class="tablewrap"><table>';
          rows.forEach(function (row, k2) {
            while (row.length < w) row.push('');
            var tag = k2 === 0 ? 'th' : 'td';
            t += k2 === 0 ? '<thead><tr>' : '<tr>';
            row.forEach(function (c) { t += '<' + tag + '>' + inline(c) + '</' + tag + '>'; });
            t += k2 === 0 ? '</tr></thead><tbody>' : '</tr>';
          });
          html.push(t + '</tbody></table></div>');
          break;
        }
        case 'code':
        case 'cli': {
          var pre = f.type === 'code'
            ? '<pre class="code">' + run.map(function (x) {
                return highlight(x.text, x.sub); }).join('\n') + '</pre>'
            : '<pre class="cli">' + run.map(function (x) {
                return '<span class="pr">' + esc(PROMPTS[x.sub] || '$') + '</span> ' +
                       highlight(x.text, x.sub); }).join('\n') + '</pre>';
          var block = '<div class="block"><div class="block-bar"><span class="lang">' +
            esc(f.sub || 'text') + '</span><button class="copy" type="button">copy</button></div>' + pre;
          if (rs[k + 1] && rs[k + 1][0].type === 'out') { block += outSec(rs[k + 1]); k++; }
          html.push(block + '</div>');
          break;
        }
        case 'out': html.push('<div class="block">' + outSec(run) + '</div>'); break;
      }
    }
    /* a document with no h1 has nowhere to put the meta under, so it goes
       where the title would have been */
    if (pending) html.unshift(pending);
    return html.join('\n');
  }

  /* ---------------------------------------------------------------- naming */

  /* The site addresses a Document as <category>/<slug>, so a file name is a
     slug with .md on it — whatever the writer types, and whatever the file
     they opened was called. */
  function slug(s) {
    /* a title is written in a language, and a file name is not: the marks come
       off the letters rather than the letters off the name, so that "Čo je to"
       is co-je-to and not o-je-to */
    return String(s == null ? '' : s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function fileName(s) {
    var base = String(s == null ? '' : s).split(/[\\/]/).pop().replace(/\.md$/i, '');
    return (slug(base) || 'untitled') + '.md';
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' +
           ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  /** The lines a brand new Document starts from — metadata and a heading to
   *  type into, because an empty screen tells a writer nothing. */
  function blank(opts) {
    opts = opts || {};
    var lines = [mk('meta', 'title: untitled')];
    if (opts.category) lines.push(mk('meta', 'category: ' + opts.category));
    lines.push(mk('meta', 'date: ' + (opts.date || today())), mk('h1', ''));
    return lines;
  }

  /* ------------------------------------------------------------------- Doc */

  var seq = 0;
  function mk(type, text, sub) {
    return { id: ++seq, type: type, text: text, sub: sub || null };
  }

  function Doc(lines) {
    this.lines = lines && lines.length ? lines : [mk('meta', 'title: untitled'), mk('h1', '')];
    this.cur = 0;
    /* null means "follow the title" — a document nobody has named yet is
       called after what it says it is */
    this.name = null;
  }
  /** Replace everything this Document holds, in place. The object survives, so
   *  the history and the UI keep the handle they already have.
   *
   *  The name argument has three answers: a string takes that name (opening a
   *  file), '' goes back to following the title (a new document), and leaving
   *  it out keeps whatever name the Document already had (clearing one). */
  Doc.prototype.load = function (lines, name) {
    this.lines = lines && lines.length ? lines : [mk('p', '')];
    this.cur = 0;
    if (name !== undefined) this.setName(name);
    return this;
  };
  Doc.prototype.fileName = function () {
    return this.name || fileName(this.meta('title') || 'untitled');
  };
  /** Set the file name, or pass nothing to go back to following the title. */
  Doc.prototype.setName = function (s) {
    s = String(s == null ? '' : s).trim();
    this.name = s === '' ? null : fileName(s);
    return this.fileName();
  };
  /** The directory the Document belongs in — its Category, or content/ itself. */
  Doc.prototype.dir = function () {
    var c = slug(this.meta('category'));
    return 'content/' + (c ? c + '/' : '');
  };
  Doc.prototype.path = function () { return this.dir() + this.fileName(); };
  /* cur is always a real index — every mutation clamps it, so no caller has to */
  Doc.prototype.clamp = function () {
    if (!this.lines.length) this.lines.push(mk('p', ''));
    this.cur = Math.max(0, Math.min(this.lines.length - 1, this.cur | 0));
    return this.cur;
  };
  Doc.prototype.line = function () { return this.lines[this.clamp()]; };
  Doc.prototype.move = function (d) {
    this.cur = Math.max(0, Math.min(this.lines.length - 1, this.clamp() + d));
  };
  Doc.prototype.shift = function (d) {
    var j = this.clamp() + d;
    if (j < 0 || j >= this.lines.length) return false;
    var a = this.lines, t = a[this.cur];
    a[this.cur] = a[j]; a[j] = t; this.cur = j;
    return true;
  };
  /**
   * Move the line at `from` so that it ends up at index `to`. `to` is the
   * position in the finished array, not in the array before the removal —
   * dragging a line one row down moves it one row down.
   */
  Doc.prototype.reorder = function (from, to) {
    if (from < 0 || from >= this.lines.length) return false;
    to = Math.max(0, Math.min(this.lines.length - 1, to));
    if (from === to) return false;
    var l = this.lines.splice(from, 1)[0];
    this.lines.splice(to, 0, l);
    this.cur = to;
    return true;
  };
  Doc.prototype.setType = function (id, sub) {
    var t = byId[id];
    if (!t) return false;
    var l = this.line();
    l.type = id;
    l.sub = t.subs ? (t.subs.indexOf(sub || l.sub) > -1 ? (sub || l.sub) : t.subs[0]) : null;
    return true;
  };
  /* a dialect only exists on the types that declare one — anything else would
     silently split a run in two, because a run is type *and* dialect */
  Doc.prototype.setSub = function (sub) {
    var l = this.line(), t = byId[l.type];
    if (!t || !t.subs || t.subs.indexOf(sub) < 0) return false;
    l.sub = sub;
    return true;
  };
  Doc.prototype.cycleSub = function (d) {
    var l = this.line(), t = byId[l.type];
    if (!t || !t.subs) return false;
    var i = t.subs.indexOf(l.sub);
    l.sub = t.subs[(i + (d || 1) + t.subs.length) % t.subs.length];
    return true;
  };
  Doc.prototype.insert = function (where, type) {
    var l = this.line();
    var born = type || (l.type === 'meta' || l.type === 'rule' ? 'p' : l.type);
    var n = mk(born, '', born === l.type ? l.sub : null);
    if (born === 'out' && l.type === 'out') n.fold = l.fold === true;
    /* a row is written Cell by Cell, so a row opened in a Table Run arrives
       the Run's width wide — there is nowhere to walk to in a row of one */
    if (born === 'table' && l.type === 'table') n.text = blankRow(this.tableRun(this.cur).width);
    var at = where === 'above' ? this.cur : this.cur + 1;
    this.lines.splice(at, 0, n);
    this.cur = at;
    return n;
  };
  /* Removing the last line leaves an empty paragraph rather than an empty
     document: `cur` must always address something. */
  Doc.prototype.remove = function () {
    var gone = this.lines.splice(this.clamp(), 1)[0] || null;
    if (!this.lines.length) { this.lines.push(mk('p', '')); this.cur = 0; }
    this.clamp();
    return gone;
  };
  Doc.prototype.duplicate = function () {
    var l = this.line();
    var c = mk(l.type, l.text, l.sub);
    if (l.type === 'out') c.fold = l.fold === true;
    this.lines.splice(this.cur + 1, 0, c);
    this.cur++;
    return c;
  };
  /** The Table Run that Line `i` belongs to — where it starts, where it ends,
   *  and how many Columns wide it is, which is its widest Line. A Line that is
   *  not a Table Line belongs to no Run and gets null. The bounds stop at the
   *  Run: a second Table further down the document is a Run of its own. */
  Doc.prototype.tableRun = function (i) {
    var a = this.lines, start = i, end = i, width = 0, j;
    if (!a[i] || a[i].type !== 'table') return null;
    while (start > 0 && a[start - 1].type === 'table') start--;
    while (end < a.length - 1 && a[end + 1].type === 'table') end++;
    for (j = start; j <= end; j++) width = Math.max(width, cells(a[j].text).length);
    return { start: start, end: end, width: width };
  };
  Doc.prototype.outRunStart = function (i) {
    if (!this.lines[i] || this.lines[i].type !== 'out') return -1;
    while (i > 0 && this.lines[i - 1].type === 'out') i--;
    return i;
  };

  /* ------------------------------------------------------------ folding
   *
   * Whether an Output run is folded is stored ON the lines, not in a set of
   * ids kept beside the document. Every line of a run carries the same flag,
   * so the state survives what a set of ids cannot: deleting the run's first
   * line, splitting a run in two, or dragging a line across it. State that
   * travels with the data cannot go stale. */

  Doc.prototype.foldedAt = function (i) {
    var start = this.outRunStart(i);
    return start > -1 && this.lines[start].fold === true;
  };

  /** Fold or unfold the whole Output run that line `i` belongs to. */
  Doc.prototype.setFold = function (i, on) {
    var start = this.outRunStart(i);
    if (start < 0) return false;
    for (var j = start; j < this.lines.length && this.lines[j].type === 'out'; j++) {
      this.lines[j].fold = !!on;
    }
    return true;
  };
  Doc.prototype.toggleFold = function (i) {
    return this.setFold(i, !this.foldedAt(i));
  };
  Doc.prototype.foldAll = function (on) {
    var v = on === undefined ? true : !!on;
    this.lines.forEach(function (l) { if (l.type === 'out') l.fold = v; });
  };
  /** Unfold whatever is hiding the cursor. The cursor is never allowed to sit
   *  on a line the writer cannot see — otherwise typing goes nowhere. */
  Doc.prototype.reveal = function () {
    if (!this.foldedAt(this.clamp())) return false;
    this.setFold(this.cur, false);
    return true;
  };
  /** The Output run a line belongs to, or the one hanging off the Code or CLI
   *  block it is part of — a run is a type *and* a dialect, so both must match.
   *  Returns an index into lines, or -1. */
  Doc.prototype.foldTarget = function (i) {
    var l = this.lines[i];
    if (!l) return -1;
    if (l.type === 'out') return this.outRunStart(i);
    if (l.type !== 'code' && l.type !== 'cli') return -1;
    var j = i;
    while (j > 0 && this.lines[j - 1].type === l.type && this.lines[j - 1].sub === l.sub) j--;
    while (j < this.lines.length &&
           this.lines[j].type === l.type && this.lines[j].sub === l.sub) j++;
    return this.lines[j] && this.lines[j].type === 'out' ? j : -1;
  };
  Doc.prototype.indexOfId = function (id) {
    for (var i = 0; i < this.lines.length; i++) {
      if (this.lines[i].id === id) return i;
    }
    return -1;
  };

  Doc.prototype.meta = function (key) {
    for (var i = 0; i < this.lines.length; i++) {
      var l = this.lines[i];
      if (l.type === 'meta' && l.text.indexOf(key + ':') === 0) {
        return l.text.slice(key.length + 1).trim();
      }
    }
    return '';
  };
  /* A meta line the document does not have yet goes to the top, where
     frontmatter belongs; cur moves with it so the cursor stays on its line. */
  Doc.prototype.setMeta = function (key, value) {
    for (var i = 0; i < this.lines.length; i++) {
      var l = this.lines[i];
      if (l.type === 'meta' && l.text.indexOf(key + ':') === 0) {
        l.text = key + ': ' + value;
        return;
      }
    }
    this.lines.unshift(mk('meta', key + ': ' + value));
    this.cur++;
  };

  /* ------------------------------------------------------------- history
   *
   * One snapshot per state of the document, taken after every mutation by the
   * one function that draws.
   *
   * The signature deliberately leaves out the two things that are not the
   * document: where the cursor is, and which Output runs are folded. Neither
   * reaches the exported markdown and neither is something a writer means to
   * undo — walking down the page and opening an output section are looking,
   * not editing. Both still travel *inside* the snapshot, so a state that
   * comes back comes back whole, and the cursor of the current state is kept
   * up to date until the next real change so that undo returns you to where
   * you were working. */

  function copyLine(l) {
    var c = { id: l.id, type: l.type, text: l.text, sub: l.sub };
    if (l.fold !== undefined) c.fold = l.fold === true;
    return c;
  }
  function snap(doc) {
    var lines = doc.lines.map(copyLine);
    return {
      name: doc.name,
      cur: doc.cur,
      lines: lines,
      /* worked out once, here: record() runs on every commit and every draw */
      sig: (doc.name || '') + '\u0000' + lines.map(function (l) {
        return l.type + '\u0001' + (l.sub || '') + '\u0001' + l.text;
      }).join('\u0002')
    };
  }

  function History(limit) {
    this.limit = limit || 200;
    this.stack = [];
    this.at = -1;
    this.merge = false;
  }
  /** Forget everything and start again from what the document says now. */
  History.prototype.reset = function (doc) {
    this.stack = [snap(doc)];
    this.at = 0;
    this.merge = false;
    return this;
  };
  /**
   * Say that the state just recorded was half of something: the next one
   * recorded takes its place instead of following it. An empty line opened to
   * be typed into is the case this exists for — the writer wants the line and
   * its text back in one undo, not an empty line in between. Consumed by the
   * next record(), whether or not anything had changed by then.
   */
  History.prototype.coalesce = function () {
    this.merge = true;
    return this;
  };
  /** Remember the current state if it is a new one. Returns whether it was. */
  History.prototype.record = function (doc) {
    if (this.at < 0) { this.reset(doc); return false; }
    var merge = this.merge;
    this.merge = false;
    var s = snap(doc), top = this.stack[this.at];
    if (s.sig === top.sig) { top.cur = s.cur; return false; }
    if (merge && this.at > 0) this.at--;      /* the half-step is overwritten */
    this.stack.length = this.at + 1;
    this.stack.push(s);
    while (this.stack.length > this.limit) this.stack.shift();
    this.at = this.stack.length - 1;
    return true;
  };
  History.prototype.canUndo = function () { return this.at > 0; };
  History.prototype.canRedo = function () { return this.at > -1 && this.at < this.stack.length - 1; };
  History.prototype.apply = function (doc, s) {
    doc.lines = s.lines.map(copyLine);
    doc.name = s.name;
    doc.cur = s.cur;
    doc.clamp();
  };
  History.prototype.undo = function (doc) {
    if (!this.canUndo()) return false;
    this.stack[this.at].cur = doc.cur;      /* so redo comes back to here */
    this.apply(doc, this.stack[--this.at]);
    return true;
  };
  History.prototype.redo = function (doc) {
    if (!this.canRedo()) return false;
    this.apply(doc, this.stack[++this.at]);
    return true;
  };

  /* What ui.js and the test files use, and nothing beyond it — slug(),
     fileName() and RUNS are this file's own business. inline() is here only
     because bin/test compares it character for character with the site's. */
  var API = {
    TYPES: TYPES, byId: byId, byKey: byKey, PROMPTS: PROMPTS,
    esc: esc, highlight: highlight, inline: inline, runs: runs,
    cells: cells, joinCells: joinCells, cellAt: cellAt, cellEnd: cellEnd,
    safeLinkHref: safeLinkHref, links: links, setLink: setLink, unlink: unlink, addLink: addLink,
    today: today, blank: blank,
    parse: parse, toMarkdown: toMarkdown, renderDoc: renderDoc,
    mk: mk, Doc: Doc, History: History
  };

  root.TerminalCms = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
