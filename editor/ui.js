/* php-terminal-cms editor — the browser half. Talks to no server, ever.
   The model lives in editor.js; this file is only keyboard, mouse and DOM.

   Three invariants hold after every single mutation, and render() is the one
   place that enforces them:

     1. doc.cur addresses a real line                        (doc.clamp)
     2. that line is visible — never inside a folded run     (doc.reveal)
     3. the state that resulted is in the history            (hist.record)

   Anything that changes the document calls render(). Two things do not: undo
   and redo call paint(), because what they hand back is a state the history
   recorded while all three invariants held; and the reader pane's own fold
   toggle redraws by hand, because re-rendering the pane would pull the
   <details> element out from under the click that opened it. */
(function () {
  'use strict';

  var L = window.TerminalCms;
  var doc = new L.Doc(L.parse(window.STARTER || ''));
  var hist = new L.History();

  var sheet    = document.getElementById('sheet');
  var read     = document.getElementById('read');
  var panes    = document.getElementById('panes');
  var legend   = document.getElementById('legend');
  var msgEl    = document.getElementById('msg');
  var cmd      = document.getElementById('cmd');
  var cmdIn    = document.getElementById('cmdInput');
  var compl    = document.getElementById('compl');
  var prefixEl = document.getElementById('prefix');
  var help     = document.getElementById('help');
  var exp      = document.getElementById('exp');
  var nameEl   = document.getElementById('docname');
  var undoBtn  = document.getElementById('actUndo');
  var redoBtn  = document.getElementById('actRedo');

  /* the one piece of editing state: null, or { line, span } — the *line
     object*, not its index, so a commit lands where the typing started even if
     the document moved underneath it */
  var editing = null;
  var tab = 'write', swapped = false, scale = 1, prefix = false;
  var flash = 0, exportMd = '', dragFrom = -1;

  /* ------------------------------------------------------- settings */
  function stored(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function store(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) {}
  }

  (function initTheme() {
    document.documentElement.setAttribute('data-theme', stored('tcms-theme', 'dark'));
  })();
  function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'normal' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    store('tcms-theme', next);
    return next;
  }

  /* ------------------------------------------------- content size */
  var SCALE_MIN = 0.7, SCALE_MAX = 2.0, SCALE_STEP = 0.1;

  function setScale(n, quiet) {
    scale = Math.round(Math.min(SCALE_MAX, Math.max(SCALE_MIN, n)) * 100) / 100;
    document.documentElement.style.setProperty('--doc-scale', String(scale));
    document.getElementById('zoomPct').textContent = Math.round(scale * 100) + '%';
    store('tcms-scale', scale);
    if (!quiet) say('content size ' + Math.round(scale * 100) + '%');
  }
  function bumpScale(d) { setScale(scale + d * SCALE_STEP); }

  function say(s) {
    msgEl.textContent = s;
    clearTimeout(flash);
    flash = setTimeout(function () { msgEl.textContent = ''; }, 1800);
  }

  /* --------------------------------------------------------- fold state */

  /* Folding lives on the lines themselves — see the comment above
     Doc.prototype.foldedAt in editor.js, and tests/js-model.js for what it
     promises. This file only decides *when* to apply the rules: always. */
  function hiddenAt(i) { return doc.foldedAt(i); }
  function step(d) {
    var i = doc.cur + d;
    while (i >= 0 && i < doc.lines.length && hiddenAt(i)) i += d;
    if (i >= 0 && i < doc.lines.length) doc.cur = i;
  }

  /* ------------------------------------------------------ write surface */
  function rowHTML(l, i, inRun) {
    var t = L.byId[l.type], txt;
    if (l.type === 'code') txt = L.highlight(l.text, l.sub);
    else if (l.type === 'cli') {
      txt = '<span class="pr">' + L.esc(L.PROMPTS[l.sub] || '$') + '</span> ' +
            L.highlight(l.text, l.sub);
    } else txt = L.esc(l.text);
    if (!l.text && l.type !== 'rule') txt = '<i class="ph">write…</i>';

    return '<div class="ln ' + l.type + (i === doc.cur ? ' cur' : '') +
      '" data-i="' + i + '" draggable="true">' +
      (inRun ? '' : '<span class="grip">⠿</span>') +
      '<span class="gut"><span class="sg">' + L.esc(t.sigil) + '</span> ' + (i + 1) + '</span>' +
      '<span class="txt">' + txt + '</span></div>';
  }

  function foldHTML(run, idx) {
    var id = run[0].id;
    if (run[0].fold === true) {
      return '<div class="foldrow" data-fold="' + id + '"><span class="gut">⟩</span>' +
        '<span class="lbl">▸ output <i>' + run.length + ' line' +
        (run.length > 1 ? 's' : '') + ' hidden</i></span></div>';
    }
    return '<div class="foldrow" data-fold="' + id + '"><span class="gut">⟩</span>' +
      '<span class="lbl">▾ output</span></div>' +
      run.map(function (x) { return rowHTML(x, idx.get(x), true); }).join('');
  }

  function drawSheet() {
    var idx = new Map();
    doc.lines.forEach(function (l, i) { idx.set(l, i); });
    var rs = L.runs(doc.lines), html = '';

    for (var k = 0; k < rs.length; k++) {
      var run = rs[k], f = run[0];
      if (f.type === 'code' || f.type === 'cli') {
        html += '<div class="run ' + f.type + '"><div class="runbar"><span class="lang">' +
          L.esc(f.sub || 'text') + '</span><button type="button" class="cp" data-from="' +
          idx.get(f) + '">copy</button></div>' +
          run.map(function (x) { return rowHTML(x, idx.get(x), true); }).join('');
        if (rs[k + 1] && rs[k + 1][0].type === 'out') { html += foldHTML(rs[k + 1], idx); k++; }
        html += '</div>';
      } else if (f.type === 'out') {
        html += '<div class="run out">' + foldHTML(run, idx) + '</div>';
      } else if (f.type === 'table') {
        html += '<div class="run table"><div class="runbar"><span class="lang">table</span></div>' +
          run.map(function (x) { return rowHTML(x, idx.get(x), true); }).join('') + '</div>';
      } else {
        html += run.map(function (x) { return rowHTML(x, idx.get(x), false); }).join('');
      }
    }
    sheet.innerHTML = html;
    var cur = sheet.querySelector('.ln.cur');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  /* The writing loop as buttons, so that a screen with no keyboard can run it.
     Each one is the key beside it, doing what the key does — there is no
     action here that the keymap does not already have. */
  var ACTS = [
    { a: 'edit', label: 'edit',   key: 'i', keys: ['i', 'Enter'],
      run: function () { startEdit(); } },
    { a: 'new',  label: 'new',    key: 'o', keys: ['o'],
      run: function () { openLine('below'); } },
    { a: 'del',  label: 'remove', key: 'D', keys: ['D', 'x'],
      run: function () { commitEdit(); doc.remove(); render(); say('removed'); } },
    { a: 'up',   label: '↑',      key: 'K', keys: ['K'],
      run: function () { commitEdit(); doc.shift(-1); render(); } },
    { a: 'down', label: '↓',      key: 'J', keys: ['J'],
      run: function () { commitEdit(); doc.shift(1); render(); } },
    { a: 'fold', label: 'fold',   key: 'z', keys: ['z'],
      run: function () { toggleFold(); } }
  ];
  var byAct = {}, actByKey = {};
  ACTS.forEach(function (x) {
    byAct[x.a] = x;
    x.keys.forEach(function (k) { actByKey[k] = x; });
  });

  function drawLegend() {
    var cl = doc.line();
    legend.innerHTML = L.TYPES.map(function (t) {
      return '<b data-t="' + t.id + '" class="' + (t.id === cl.type ? 'on' : '') + '">' +
        t.name.replace('Heading ', 'H') + '<i>' + t.key + '</i></b>';
    }).join('') +
      '<span class="sep"></span>' +
      ACTS.map(function (x) {
        return '<b class="do" data-a="' + x.a + '">' + x.label + '<i>' + L.esc(x.key) + '</i></b>';
      }).join('') +
      '<span class="act"><kbd>^Z</kbd> undo · <kbd>:</kbd> commands · <kbd>?</kbd> keys</span>';
  }

  /* The file this document becomes — the name alone, because that is the part
     a writer sets. The directory it lands in comes from the category, and the
     export overlay is where the two are shown together as one path. */
  function drawFile() {
    if (!nameEl.getAttribute('contenteditable')) nameEl.textContent = doc.fileName();
    undoBtn.disabled = !hist.canUndo();
    redoBtn.disabled = !hist.canRedo();
  }

  function draw() {
    drawSheet();
    drawLegend();
    read.innerHTML = L.renderDoc(doc.lines);
    var l = doc.line(), t = L.byId[l.type];
    document.getElementById('right').innerHTML =
      'L' + (doc.cur + 1) + '/' + doc.lines.length + ' · ' + t.name.toLowerCase() +
      (l.sub ? '[' + l.sub + ']' : '');
    drawFile();
  }

  /* Put the document back inside its invariants and show it. Used on its own
     only after the history has just handed us a state that was recorded while
     they held — everything else goes through render(). */
  function paint() {
    doc.clamp();
    doc.reveal();
    draw();
  }

  /* The only way to get pixels on screen after a change. Restores the
     invariants first, and commits any open edit box: a redraw destroys the box,
     so the alternative is typing that goes nowhere. The only callers of draw()
     itself are paint() and the two places that have just committed by hand. */
  function render() {
    commitEdit();
    doc.clamp();
    doc.reveal();
    hist.record(doc);
    draw();
  }

  /* ---------------------------------------------------------- editing */

  /** Write what is in the box back to the line it was opened on, and close it.
      Never draws — the caller decides whether a redraw is wanted, which is what
      lets a click land on a live row instead of one innerHTML has just eaten. */
  function commitEdit() {
    if (!editing) return false;
    var e = editing;
    editing = null;
    e.span.removeAttribute('contenteditable');
    e.line.text = e.span.textContent.replace(/[\r\n]+/g, ' ');
    return true;
  }

  function caretToEnd(span) {
    var r = document.createRange();
    r.selectNodeContents(span);
    r.collapse(false);
    var s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  function selectAll(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    var s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  function editable(el) {
    el.setAttribute('contenteditable', 'plaintext-only');
    if (el.contentEditable !== 'plaintext-only') el.setAttribute('contenteditable', 'true');
  }

  function startEdit() {
    if (tab === 'read') setTab('write');
    commitEdit();
    if (doc.reveal()) draw();

    var row = sheet.querySelector('.ln.cur');
    if (!row) { draw(); row = sheet.querySelector('.ln.cur'); }
    if (!row) return;

    var span = row.querySelector('.txt');
    var line = doc.line();
    editing = { line: line, span: span };

    span.textContent = line.text;
    editable(span);
    span.focus();
    caretToEnd(span);

    span.addEventListener('keydown', function (ev) {
      ev.stopPropagation();
      if (ev.key !== 'Escape' && !(ev.key === 'Enter' && !ev.shiftKey)) return;
      ev.preventDefault();
      var enter = ev.key === 'Enter';
      commitEdit();
      render();                       /* the line just committed is one state */
      if (enter) openLine('below');
    });

    /* contenteditable would happily take a paste of styled HTML; take the text
       and nothing else, and let a multi-line paste become multiple Lines */
    span.addEventListener('paste', function (ev) {
      var cd = ev.clipboardData || window.clipboardData;
      if (!cd) return;
      ev.preventDefault();
      var parts = String(cd.getData('text/plain')).replace(/\r\n?/g, '\n').split('\n');
      insertAtCaret(span, parts.shift());
      if (!parts.length) return;
      commitEdit();
      parts.forEach(function (p) { doc.insert('below').text = p; });
      render();
      startEdit();
    });

    span.addEventListener('blur', function () {
      if (!editing || editing.span !== span) return;
      commitEdit();
      render();
    });
  }

  /* Opening a line and filling it is one thing the writer did, so it is one
     undo: the empty line in between is a half-step nobody wants back. */
  function openLine(where) {
    doc.insert(where);
    render();
    hist.coalesce();
    startEdit();
  }

  function insertAtCaret(span, text) {
    if (!text) return;
    var okay = false;
    try { okay = document.execCommand('insertText', false, text); } catch (e) {}
    if (okay) return;
    span.textContent += text;
    caretToEnd(span);
  }

  /* ------------------------------------------------------------- naming
     The name is typed into the tab bar itself: it is the one piece of the
     document that is not a Line, so it has nowhere else to live. */

  function startName() {
    if (nameEl.getAttribute('contenteditable')) return;
    commitEdit();
    nameEl.textContent = doc.fileName();
    editable(nameEl);
    nameEl.focus();
    selectAll(nameEl);
    say('type a file name — Enter keeps it, Esc cancels, empty follows the title');
  }
  function endName(keep) {
    if (!nameEl.getAttribute('contenteditable')) return;
    var typed = nameEl.textContent;
    nameEl.removeAttribute('contenteditable');
    if (keep) say('name ' + doc.setName(typed));
    render();
  }
  nameEl.addEventListener('click', startName);
  nameEl.addEventListener('keydown', function (e) {
    e.stopPropagation();
    if (e.key === 'Enter') { e.preventDefault(); endName(true); }
    else if (e.key === 'Escape') { e.preventDefault(); endName(false); }
  });
  nameEl.addEventListener('blur', function () { endName(true); });

  /* ------------------------------------------------------------- panes */
  function setTab(t) {
    if (t !== 'write' && t !== 'read' && t !== 'split') t = 'write';
    tab = t;
    panes.dataset.mode = t;
    store('tcms-tab', t);
    document.querySelectorAll('[data-tab]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.tab === t);
    });
    legend.style.display = t === 'read' ? 'none' : 'flex';
    render();
  }
  function setSwap(on) {
    swapped = !!on;
    panes.dataset.swap = swapped ? 'yes' : 'no';
    store('tcms-swap', swapped ? '1' : '0');
  }

  /* -------------------------------------------------------- clipboard */
  function copyText(s, btn) {
    function done() {
      say('copied ' + s.split('\n').length + ' line(s)');
      if (!btn) return;
      var o = btn.textContent;
      btn.textContent = 'copied';
      btn.classList.add('done');
      setTimeout(function () { btn.textContent = o; btn.classList.remove('done'); }, 1200);
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = s;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { say('copy blocked'); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(s).then(done, fallback);
    } else fallback();
  }
  function runTextAt(i) {
    var l = doc.lines[i];
    if (!l) return '';
    var j = i, out = [];
    while (j > 0 && doc.lines[j - 1].type === l.type && doc.lines[j - 1].sub === l.sub) j--;
    while (j < doc.lines.length && doc.lines[j].type === l.type && doc.lines[j].sub === l.sub) {
      out.push(doc.lines[j].text);
      j++;
    }
    return out.join('\n');
  }
  function copyBlock() {
    var l = doc.line();
    if (['code', 'cli', 'out'].indexOf(l.type) < 0) {
      return say('put the cursor in a code, CLI or output block');
    }
    copyText(runTextAt(doc.cur));
  }
  function toggleFold() {
    var at = doc.foldTarget(doc.cur);
    if (at < 0) return say('no output section on this block');
    doc.toggleFold(at);
    say(doc.foldedAt(at) ? 'output folded' : 'output shown');
    render();
  }

  /* ------------------------------------------------------------ history */
  function undo() {
    commitEdit();
    if (!hist.undo(doc)) return say('nothing to undo');
    paint();
    say('undone');
  }
  function redo() {
    commitEdit();
    if (!hist.redo(doc)) return say('nothing to redo');
    paint();
    say('redone');
  }

  /* --------------------------------------------- open, new, clear, export */
  function loadMarkdown(text, name) {
    var lines = L.parse(text);
    if (!lines.length) return say('nothing to open');
    commitEdit();
    doc.load(lines, name || '');
    doc.foldAll();
    render();
    say('opened ' + doc.path() + ' — ' + lines.length + ' lines');
  }
  /* Both of these are one undo away from being taken back, which is why
     neither of them asks whether you meant it. */
  function newDoc() {
    commitEdit();
    doc.load(L.blank({ category: doc.meta('category') }), '');
    render();
    say('new document — ^Z brings the old one back');
  }
  function clearDoc() {
    commitEdit();
    doc.load([L.mk('p', '')]);
    render();
    say('cleared — ^Z brings it back');
  }
  function openFile() { document.getElementById('openFile').click(); }

  function openExport() {
    commitEdit();
    render();
    exportMd = L.toMarkdown(doc.lines);
    document.getElementById('expMd').textContent = exportMd;
    var p = doc.path();
    document.getElementById('expPath').textContent = p;
    document.getElementById('expShip').innerHTML = L.highlight(
      '# the editor writes a file, nothing else\n' +
      'git add ' + p + ' && git commit -m "post: ' + doc.meta('title') + '"\n' +
      'git push\n\n' +
      '# or copy it straight over\n' +
      'rsync -az ' + p + ' deploy@example.com:/var/www/example.com/' + p, 'bash');
    exp.classList.add('on');
  }

  document.getElementById('expCopy').addEventListener('click', function (e) {
    copyText(exportMd, e.currentTarget);
  });
  document.getElementById('expDl').addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportMd], { type: 'text/markdown' }));
    a.download = doc.fileName();
    a.click();
    URL.revokeObjectURL(a.href);
    say('downloaded ' + a.download);
  });
  document.getElementById('openFile').addEventListener('change', function (e) {
    var f = e.target.files[0];
    if (!f) return;
    var fr = new FileReader();
    fr.onload = function () { loadMarkdown(String(fr.result), f.name); };
    fr.readAsText(f);
    e.target.value = '';
  });
  ['dragenter', 'dragover'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (dragFrom > -1) return;            /* reordering a line, not dropping a file */
      e.preventDefault();
      document.body.classList.add('dropping');
    });
  });
  ['dragleave', 'drop', 'dragend'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (ev === 'dragleave' && e.relatedTarget) return;
      document.body.classList.remove('dropping');
    });
  });
  document.addEventListener('drop', function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    e.preventDefault();
    var fr = new FileReader();
    fr.onload = function () { loadMarkdown(String(fr.result), f.name); };
    fr.readAsText(f);
  });

  /* ------------------------------------------------------ command line
   *
   * One table: it is what runs, what Tab completes, and what the help overlay
   * prints. A command cannot exist without its line of documentation, and the
   * documentation cannot describe a command that is not here. */

  var COMMANDS = [
    { name: 'set', arg: '<type> [dialect]', help: 'set the type of this line',
      items: function (w) {
        if (w.length === 2) return L.TYPES.map(function (t) { return t.id; });
        return (w.length === 3 && L.byId[w[1]] && L.byId[w[1]].subs) || [];
      },
      run: function (a) {
        if (!doc.setType(a[1], a[2])) return say('no such type: ' + (a[1] || ''));
        say('set ' + a[1] + (doc.line().sub ? ' ' + doc.line().sub : ''));
      } },

    { name: 'lang', arg: '<dialect>', help: 'set the dialect of a code or CLI line',
      items: function (w) {
        return w.length === 2 ? (L.byId[doc.line().type].subs || []) : [];
      },
      run: function (a) {
        say(doc.setSub(a[1]) ? 'lang ' + a[1]
                             : 'no dialect "' + (a[1] || '') + '" for this type');
      } },

    { name: 'new', arg: '[type]', help: 'insert a line below this one',
      items: function (w) {
        return w.length === 2 ? L.TYPES.map(function (t) { return t.id; }) : [];
      },
      run: function (a) {
        if (a[1] && !L.byId[a[1]]) return say('no such type: ' + a[1]);
        doc.insert('below');
        if (a[1]) doc.setType(a[1]);
        say('new ' + doc.line().type + ' line');
      } },

    { name: 'del', help: 'remove this line',
      run: function () { doc.remove(); say('removed'); } },

    { name: 'dup', help: 'duplicate this line',
      run: function () { doc.duplicate(); say('duplicated'); } },

    { name: 'move', arg: 'up|down|top|bottom', help: 'move this line within the document',
      items: function (w) { return w.length === 2 ? ['up', 'down', 'top', 'bottom'] : []; },
      run: function (a) {
        if (a[1] === 'up') doc.shift(-1);
        else if (a[1] === 'down') doc.shift(1);
        else if (a[1] === 'top') doc.reorder(doc.cur, 0);
        else if (a[1] === 'bottom') doc.reorder(doc.cur, doc.lines.length - 1);
        else return say('move up · down · top · bottom');
        say('moved ' + a[1]);
      } },

    { name: 'go', arg: '<line|top|end>', help: 'put the cursor on a line by number',
      items: function (w) { return w.length === 2 ? ['top', 'end'] : []; },
      run: function (a) {
        if (a[1] === 'top') doc.cur = 0;
        else if (a[1] === 'end') doc.cur = doc.lines.length - 1;
        else if (/^[0-9]+$/.test(a[1] || '')) doc.cur = parseInt(a[1], 10) - 1;
        else return say('go <line number> · top · end');
        doc.clamp();
        say('line ' + (doc.cur + 1) + ' of ' + doc.lines.length);
      } },

    { name: 'fold', help: "fold or unfold this block's output",
      run: function () { toggleFold(); } },

    { name: 'foldall', help: 'fold every output run in the document',
      run: function () { doc.foldAll(true); say('all output folded'); } },

    { name: 'unfoldall', help: 'unfold every output run in the document',
      run: function () { doc.foldAll(false); say('all output shown'); } },

    { name: 'copy', help: 'copy this code, CLI or output block to the clipboard',
      run: function () { copyBlock(); } },

    { name: 'undo', help: 'take back the last change (Ctrl+Z)',
      run: function () { undo(); } },

    { name: 'redo', help: 'put back what undo took (Ctrl+Shift+Z)',
      run: function () { redo(); } },

    { name: 'open', help: 'open a markdown file — same as dropping one on the page',
      run: function () { openFile(); } },

    { name: 'newdoc', help: 'start a new document, keeping the category',
      run: function () { newDoc(); } },

    { name: 'clear', help: 'empty this document, keeping its name',
      run: function () { clearDoc(); } },

    { name: 'name', arg: '[file.md]', help: 'name the file — no argument follows the title',
      run: function (a) { say('name ' + doc.setName(a.slice(1).join(' '))); } },

    { name: 'title', arg: '<text>', help: 'set the title meta line',
      run: function (a) {
        if (a.length < 2) return say('title <text>');
        doc.setMeta('title', a.slice(1).join(' '));
        say('title set');
      } },

    { name: 'cat', arg: '<name>', help: 'set the category meta — the directory the file goes in',
      run: function (a) {
        if (!a[1]) return say('cat <name> — the directory this document belongs in');
        doc.setMeta('category', a[1]);
        say('category ' + a[1]);
      } },

    { name: 'date', arg: '[text]', help: 'set the date meta line — no argument uses today',
      run: function (a) {
        doc.setMeta('date', a.length > 1 ? a.slice(1).join(' ') : L.today());
        say('date ' + doc.meta('date'));
      } },

    { name: 'meta', arg: '<key> <value>', help: 'set any meta line, adding it if it is missing',
      run: function (a) {
        if (a.length < 3) return say('meta <key> <value>');
        doc.setMeta(a[1], a.slice(2).join(' '));
        say(a[1] + ' ' + doc.meta(a[1]));
      } },

    { name: 'export', help: 'show the markdown — copy it or download it',
      run: function () { openExport(); } },

    { name: 'write', help: 'the lines, full width',
      run: function () { setTab('write'); } },

    { name: 'read', help: 'the page as a reader sees it, full width',
      run: function () { setTab('read'); } },

    { name: 'split', help: 'both at once',
      run: function () { setTab('split'); } },

    { name: 'swap', help: 'swap the two panes in split screen',
      run: function () {
        if (tab !== 'split') setTab('split');
        setSwap(!swapped);
        say('panes swapped');
      } },

    { name: 'size', arg: 'up|down|reset', help: 'content size, the same as + − 0',
      items: function (w) { return w.length === 2 ? ['up', 'down', 'reset'] : []; },
      run: function (a) {
        if (a[1] === 'up') bumpScale(1);
        else if (a[1] === 'down') bumpScale(-1);
        else if (a[1] === 'reset') setScale(1);
        else say('size up · down · reset');
      } },

    { name: 'theme', help: 'normal ⇄ dark',
      run: function () { say('theme ' + toggleTheme()); } },

    { name: 'help', help: 'this list, and every key',
      run: function () { help.classList.add('on'); } },

    { name: 'w', help: 'there is nothing to save — the editor has nowhere to save to',
      run: function () { say('nothing to save — the editor writes no files; E exports one'); } }
  ];

  var byCmd = {};
  COMMANDS.forEach(function (c) { byCmd[c.name] = c; });

  function openCmd() {
    commitEdit();
    render();
    cmd.classList.remove('hidden');
    cmdIn.value = '';
    cmdIn.focus();
    showCompl();
  }
  function closeCmd() {
    cmd.classList.add('hidden');
    compl.classList.add('hidden');
    cmdIn.blur();
  }
  /* The words as typed, keeping the empty one a trailing space makes: "set "
     is asking for a type, "set" is still asking for a command. */
  function words() {
    return cmdIn.value.replace(/^\s+/, '').split(/\s+/);
  }
  /* Past the first word we are completing an argument, and a command with
     nothing to offer there offers nothing — the alternative is Tab replacing
     the title somebody is halfway through typing with the name of a command. */
  function candidates() {
    var w = words(), c = byCmd[w[0]];
    if (w.length > 1) {
      return { items: (c && c.items) ? c.items(w) : [], q: w[w.length - 1], arg: true };
    }
    return { items: COMMANDS.map(function (x) { return x.name; }), q: w[0] || '', arg: false };
  }
  var COMPL_MAX = 22;
  function showCompl() {
    var c = candidates();
    /* emptied, not just hidden: Tab reads this list, and a stale entry left
       behind it would complete the argument somebody is halfway through */
    if (!c.items.length) { compl.innerHTML = ''; compl.classList.add('hidden'); return; }
    var hit = c.items.filter(function (x) { return x.indexOf(c.q) === 0; });
    var list = hit.length ? hit : c.items;
    var more = list.length - COMPL_MAX;
    compl.innerHTML = list.slice(0, COMPL_MAX).map(function (x, i) {
      return '<b class="' + (i === 0 && hit.length ? 'on' : '') + '">' + L.esc(x) + '</b>';
    }).join('') + (more > 0 ? '<i>+' + more + ' more</i>' : '');
    compl.classList.remove('hidden');
  }
  function complete(pick) {
    var w = words();
    if (candidates().arg) w[w.length - 1] = pick;
    else w = [pick];
    cmdIn.value = w.join(' ') + ' ';
    cmdIn.focus();
    showCompl();
  }
  function runCmd(v) {
    var a = v.trim().split(/\s+/);
    if (!a[0]) return;
    var c = byCmd[a[0]];
    if (!c) return say('unknown command: ' + a[0] + ' — : then Tab lists them all');
    c.run(a);
    render();
  }
  cmdIn.addEventListener('input', showCompl);
  cmdIn.addEventListener('keydown', function (e) {
    e.stopPropagation();
    if (e.key === 'Escape') closeCmd();
    if (e.key === 'Enter') { var v = cmdIn.value; closeCmd(); runCmd(v); }
    if (e.key === 'Tab') {
      e.preventDefault();
      var first = compl.querySelector('b');
      if (first) complete(first.textContent);
    }
  });
  compl.addEventListener('mousedown', function (e) {
    var b = e.target.closest('b');
    if (!b) return;
    e.preventDefault();                      /* keep the focus in the input */
    complete(b.textContent);
  });

  /* ------------------------------------------------------------ mouse */

  /* Commit before the click, not on the blur it causes: blur would rebuild the
     sheet between mousedown and mouseup, and the click would then land on a
     row that no longer exists — the cursor would not move at all. */
  sheet.addEventListener('mousedown', function (e) {
    if (!editing || editing.span.contains(e.target)) return;
    commitEdit();
  });
  /* A finger has no double click and no hover, so on a touch screen the tap
     that selects a line is also the way into it: tap once to put the cursor
     there, tap the same line again to write in it. A mouse keeps dblclick. */
  var touching = false;
  document.addEventListener('pointerdown', function (e) {
    touching = e.pointerType === 'touch' || e.pointerType === 'pen';
  }, true);

  sheet.addEventListener('click', function (e) {
    /* a click inside the open box is the caret being placed, not a click on
       the line: leave the box alone */
    if (editing && editing.span.contains(e.target)) return;
    var cp = e.target.closest('button.cp');
    if (cp) { copyText(runTextAt(+cp.dataset.from), cp); return; }
    var fr = e.target.closest('.foldrow');
    if (fr) {
      doc.toggleFold(doc.indexOfId(+fr.dataset.fold));
      render();
      return;
    }
    var r = e.target.closest('.ln');
    if (!r) return;
    var again = +r.dataset.i === doc.cur && !editing;
    doc.cur = +r.dataset.i;
    render();
    if (touching && again) startEdit();
  });
  sheet.addEventListener('dblclick', function (e) {
    if (editing || !e.target.closest('.ln')) return;
    startEdit();
  });
  read.addEventListener('click', function (e) {
    var b = e.target.closest('button.copy');
    if (!b) return;
    copyText(blockText(b.closest('.block')), b);
  });
  /* The prompt is presentation, not content — it is a <span class="pr"> the
     renderer put there, so take it out again rather than guessing at prefixes.
     The published page needs the same rule, and has its own copy of it in
     site/src/Page.php: nothing is shared between a static page and a PHP
     heredoc without a build step, and there is no build step. */
  function blockText(block) {
    var pre = block && block.querySelector('pre.code, pre.cli');
    if (!pre) return '';
    var copy = pre.cloneNode(true);
    copy.querySelectorAll('.pr').forEach(function (p) { p.remove(); });
    return copy.textContent.replace(/^ /gm, '');
  }
  /* the reader pane's own <details> is the same fold, seen from the other side */
  read.addEventListener('toggle', function (e) {
    var el = e.target.closest('details.outsec');
    if (!el) return;
    var at = doc.indexOfId(+el.dataset.fold);
    if (at < 0 || doc.foldedAt(at) === !el.open) return;
    doc.setFold(at, !el.open);
    if (doc.reveal()) draw(); else drawSheet();
  }, true);

  sheet.addEventListener('dragstart', function (e) {
    var r = e.target.closest('.ln');
    if (!r) return;
    if (editing) { commitEdit(); }
    dragFrom = +r.dataset.i;
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(dragFrom)); } catch (x) {}
    r.classList.add('dragging');
  });
  sheet.addEventListener('dragover', function (e) {
    if (dragFrom < 0) return;
    var r = e.target.closest('.ln');
    e.preventDefault();
    e.stopPropagation();
    sheet.querySelectorAll('.over').forEach(function (x) { x.classList.remove('over'); });
    if (r) r.classList.add('over');
  });
  sheet.addEventListener('drop', function (e) {
    if (dragFrom < 0) return;
    e.preventDefault();
    e.stopPropagation();
    var r = e.target.closest('.ln');
    /* dropped past the last row: send it to the end */
    var to = r ? +r.dataset.i : doc.lines.length - 1;
    var moved = doc.reorder(dragFrom, to);
    dragFrom = -1;
    render();
    if (moved) say('moved');
  });
  sheet.addEventListener('dragend', function () {
    dragFrom = -1;
    sheet.querySelectorAll('.dragging,.over').forEach(function (x) {
      x.classList.remove('dragging', 'over');
    });
  });

  legend.addEventListener('click', function (e) {
    var b = e.target.closest('b[data-t]');
    if (b) {
      commitEdit();
      doc.setType(b.dataset.t);
      render();
      say(b.dataset.t);
      return;
    }
    var a = e.target.closest('b[data-a]');
    if (a && byAct[a.dataset.a]) byAct[a.dataset.a].run();
  });
  document.querySelectorAll('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () { setTab(b.dataset.tab); });
  });
  document.getElementById('actOpen').addEventListener('click', openFile);
  document.getElementById('actNew').addEventListener('click', newDoc);
  document.getElementById('actClear').addEventListener('click', clearDoc);
  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  document.getElementById('swap').addEventListener('click', function () {
    if (tab !== 'split') setTab('split');
    setSwap(!swapped);
  });
  document.getElementById('zoomOut').addEventListener('click', function () { bumpScale(-1); });
  document.getElementById('zoomIn').addEventListener('click', function () { bumpScale(1); });
  document.getElementById('zoomPct').addEventListener('click', function () { setScale(1); });
  document.querySelectorAll('[data-close]').forEach(function (b) {
    b.addEventListener('click', function () { b.closest('.ov').classList.remove('on'); });
  });

  /* ----------------------------------------------------------- keymap */
  document.addEventListener('keydown', function (e) {
    if (editing) return;
    if (!cmd.classList.contains('hidden')) return;
    var k = e.key;

    if (prefix) {
      prefix = false;
      prefixEl.classList.remove('on');
      if (k === '1' || k === '2' || k === '3') {
        setTab({ '1': 'write', '2': 'read', '3': 'split' }[k]);
        e.preventDefault();
      }
      return;
    }
    if (e.ctrlKey && (k === 'b' || k === 'B')) {
      e.preventDefault();
      prefix = true;
      prefixEl.classList.add('on');
      setTimeout(function () { prefix = false; prefixEl.classList.remove('on'); }, 2500);
      return;
    }
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (k === 'z' || k === 'Z')) {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (k === 'y' || k === 'Y')) {
      e.preventDefault();
      redo();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    if (k === 'Escape') {
      document.querySelectorAll('.ov.on').forEach(function (o) { o.classList.remove('on'); });
      return;
    }
    if (k === '?') { help.classList.toggle('on'); e.preventDefault(); return; }
    if (document.querySelector('.ov.on')) return;

    if (k === '+' || k === '=') { bumpScale(1); e.preventDefault(); return; }
    if (k === '-' || k === '_') { bumpScale(-1); e.preventDefault(); return; }
    if (k === '0') { setScale(1); return; }
    if (k === 'T') { say('theme ' + toggleTheme()); return; }
    if (k === 'E') { openExport(); return; }
    if (k === 'N') { newDoc(); return; }
    if (k === 'R') { startName(); return; }
    if (k === 'v') { setTab('read'); return; }
    if (k === 'e') { setTab('write'); return; }
    if (k === 'b') { setTab(tab === 'split' ? 'write' : 'split'); return; }
    if (k === 'B') { if (tab !== 'split') setTab('split'); setSwap(!swapped); return; }
    if (k === ':') { e.preventDefault(); openCmd(); return; }
    if (tab === 'read') return;

    if (k === 'j' || k === 'ArrowDown') { step(1); render(); e.preventDefault(); return; }
    if (k === 'k' || k === 'ArrowUp')   { step(-1); render(); e.preventDefault(); return; }
    if (k === 'g') { doc.cur = 0; render(); return; }
    if (k === 'G') { doc.cur = doc.lines.length - 1; render(); return; }
    /* the six the legend also has as buttons, so that a key and the button
       beside it cannot come to mean two different things */
    if (actByKey[k]) { e.preventDefault(); actByKey[k].run(); return; }
    if (k === 'O') { openLine('above'); e.preventDefault(); return; }
    if (k === 'y') { doc.duplicate(); render(); say('duplicated'); return; }
    if (k === 'C') { copyBlock(); return; }
    if (k === 'Tab') {
      e.preventDefault();
      if (doc.cycleSub(e.shiftKey ? -1 : 1)) { render(); say(doc.line().sub); }
      else say('no dialects for this type');
      return;
    }

    var t = L.byKey[k];
    if (t) {
      doc.setType(t.id);
      render();
      say(t.name.toLowerCase() + (doc.line().sub ? ' · ' + doc.line().sub : ''));
    }
  });

  /* ------------------------------------------------------------- boot */

  /* The help overlay's command table is generated from the table that runs
     them, so a command can never go undocumented. */
  document.getElementById('cmdlist').innerHTML = COMMANDS.map(function (c) {
    return '<div class="row"><kbd>' + L.esc(c.name + (c.arg ? ' ' + c.arg : '')) +
      '</kbd><span>' + L.esc(c.help) + '</span></div>';
  }).join('');
  document.getElementById('helpCode').textContent = L.byId.code.subs.join(' ');
  document.getElementById('helpCli').textContent = L.byId.cli.subs.join(' ');

  doc.foldAll();
  hist.reset(doc);
  setScale(parseFloat(stored('tcms-scale', '1')) || 1, true);
  setSwap(stored('tcms-swap', '0') === '1');
  setTab(stored('tcms-tab', 'write'));
  say('? for keys and commands · b splits the screen · drop a .md to open it · E exports');
})();
