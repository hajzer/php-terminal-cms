/* php-terminal-cms editor — the browser half. A document is never sent
   anywhere; the one thing this page fetches is an image a line names, to show
   it in the preview.

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
  var addrOv   = document.getElementById('addr');
  var pickEl   = document.getElementById('addrPick');
  var formEl   = document.getElementById('addrForm');
  var fldA     = document.getElementById('addrA');
  var fldB     = document.getElementById('addrB');
  var labA     = document.getElementById('addrLab1');
  var labB     = document.getElementById('addrLab2');
  var warnEl   = document.getElementById('addrWarn');
  var whatEl   = document.getElementById('addrWhat');
  var nameEl   = document.getElementById('docname');
  var undoBtn  = document.getElementById('actUndo');
  var redoBtn  = document.getElementById('actRedo');

  /* the one piece of editing state: null, or { line, span } — the *line
     object*, not its index, so a commit lands where the typing started even if
     the document moved underneath it */
  var editing = null;
  var tab = 'write', swapped = false, scale = 1, prefix = false;
  var flash = 0, exportMd = '', dragFrom = -1;

  /* The selected Column, counted from 1, and the Line the writer chose it on —
     the Line *object*, the way the open edit box holds one, because a Run has
     no id of its own and the id of its first Line is not one: it changes under
     every edit at the top of the Run. This is pane state, like the tab and the
     swap — not on the Doc, not in the history. */
  var colSel = 0, colOn = null;

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

  /* A Table Line drawn one span per Cell, so that a click can say which Cell
     it landed in. Everything between the spans — the pipes and the spacing the
     writer typed — is the Line's own text, put back untouched, so the row
     reads exactly as it was written. */
  function cellsHTML(text) {
    var out = '', at = 0;
    L.cellSpans(text).forEach(function (c, n) {
      out += L.esc(text.slice(at, c.at)) +
        '<span class="cell" data-c="' + n + '">' + L.esc(text.slice(c.at, c.end)) + '</span>';
      at = c.end;
    });
    return out + L.esc(text.slice(at));
  }

  function rowHTML(l, i, inRun) {
    var t = L.byId[l.type], txt;
    if (l.type === 'code') txt = L.highlight(l.text, l.sub);
    else if (l.type === 'cli') {
      txt = '<span class="pr">' + L.esc(L.PROMPTS[l.sub] || '$') + '</span> ' +
            L.highlight(l.text, l.sub);
    } else if (l.type === 'table') txt = cellsHTML(l.text);
    else txt = L.esc(l.text);
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

  /* The strip above a Table Run: one entry per Column, numbered, each showing
     that Column's heading Cell. The Columns are the model's own, already
     padded to the Run's width, so a ragged Run draws the entries its widest
     Line asks for without anything having rewritten a Line to say so. */
  function stripHTML(here) {
    return '<div class="colstrip">' + doc.columns(here.start).map(function (head, i) {
      return '<b class="col' + (colSel === i + 1 ? ' on' : '') + '" data-col="' +
        (i + 1) + '"><i>' + (i + 1) + '</i>' + L.esc(head) + '</b>';
    }).join('') + (colSel ? opsHTML() : '') + '</div>';
  }

  /* The four operations, which exist only while a Column is selected: the
     thing being operated on is the thing the writer pointed at, and with
     nothing pointed at there is nothing to offer. Each is `:col <op>` with the
     selected number, so a button and the command are one path. */
  var COL_ACTS = [
    { op: 'add',   sym: '+', label: 'add a column before this one' },
    { op: 'del',   sym: '×', label: 'remove this column' },
    { op: 'left',  sym: '‹', label: 'move this column left (Ctrl+←)' },
    { op: 'right', sym: '›', label: 'move this column right (Ctrl+→)' }
  ];
  function opsHTML() {
    return '<span class="colops">' + COL_ACTS.map(function (a) {
      return '<button type="button" data-op="' + a.op + '" title="' + a.label +
        '">' + a.sym + '</button>';
    }).join('') + '</span>';
  }

  /* One Column operation on the selected Column. The model judges it and the
     model does it — a refusal is the operation's own sentence, said and
     nothing else. The selection follows the Column it was on where that still
     means something: `add` puts a Column in front of it, so it is one further
     right; `left` and `right` carry it along; `del` leaves nothing to point
     at, so the selection goes with it. */
  function columnOp(op) {
    if (!colSel) return;
    var at = colSel, dirty = commitEdit(), why = doc.column(op, at);
    if (why) {
      if (dirty) render();
      say(why);
      return;
    }
    /* `add` puts a Column in front of the selected one and `right` moves it
       past its neighbour: either way it ends up one to the right */
    if (op === 'del') { colSel = 0; colOn = null; }
    else colSel = op === 'left' ? at - 1 : at + 1;
    render();
    say(colDone(op, at));
  }

  /* What a Column operation says when it worked — the strip and `:col` say the
     same sentence because they read it from here. A refusal has no such place:
     it is the model's own sentence, relayed by whichever path asked. */
  function colDone(op, at) {
    return op === 'add' ? 'column added'
      : op === 'del' ? 'column ' + at + ' removed'
      : 'column ' + at + ' moved ' + op;
  }

  /* The selection lives exactly as long as the strip that shows it: a Column
     stays selected while the Line it was chosen on is still in the Run the
     cursor is in, and is dropped the moment it is not — the cursor left, the
     Run changed underneath it, or the Column is past the Run's width. So there
     is never a selected Column that is not on screen. */
  function keepColumn(here, idx) {
    var on = colOn ? idx.get(colOn) : undefined;
    if (!here || on === undefined || on < here.start || on > here.end ||
        colSel > here.width) {
      colSel = 0;
      colOn = null;
    }
  }

  function drawSheet() {
    var idx = new Map();
    doc.lines.forEach(function (l, i) { idx.set(l, i); });
    var rs = L.runs(doc.lines), html = '';

    /* the strip belongs to the Run the cursor is in and to no other */
    var here = doc.tableRun(doc.cur);
    keepColumn(here, idx);

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
        var cursorHere = !!here && idx.get(f) === here.start;
        html += '<div class="run table"><div class="runbar"><span class="lang">table</span></div>' +
          (cursorHere ? stripHTML(here) : '') +
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
      run: function () { toggleFold(); } },
    /* `before` is where it is drawn: a Link and an Image are the two addressed
       things, so they stand together, and Meta stays last as it always was */
    { a: 'addr', label: 'link',   key: 'a', keys: ['a'], before: 'img',
      run: function () { openAddr(); } }
  ];
  var byAct = {}, actByKey = {};
  ACTS.forEach(function (x) {
    byAct[x.a] = x;
    x.keys.forEach(function (k) { actByKey[k] = x; });
  });

  function chip(x) {
    return '<b class="do" data-a="' + x.a + '">' + x.label + '<i>' + L.esc(x.key) + '</i></b>';
  }

  /* The types on the left, the writing loop on the right — and `link` among
     the types, because it is a thing you do to what the Line says rather than
     to the Line's place in the document. It is still an action and never takes
     the `on` class: a Line has a Type and may have a link. */
  function drawLegend() {
    var cl = doc.line();
    legend.innerHTML = L.TYPES.map(function (t) {
      return (byAct.addr.before === t.id ? chip(byAct.addr) : '') +
        '<b data-t="' + t.id + '" class="' + (t.id === cl.type ? 'on' : '') + '">' +
        t.name.replace('Heading ', 'H') + '<i>' + t.key + '</i></b>';
    }).join('') +
      '<span class="sep"></span>' +
      ACTS.filter(function (x) { return x !== byAct.addr; }).map(chip).join('') +
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
    /* one character for one: an offset read off the box before this — the
       caret ^K opened the overlay at — is the same offset in the Line after */
    e.line.text = e.span.textContent.replace(/[\r\n]/g, ' ');
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
  /* Where the caret is in the open box, counted in characters of its text —
     and how to put it back at a place counted the same way. */
  function caretOffset(span) {
    var sel = getSelection(), r = document.createRange();
    if (!sel || !sel.rangeCount) return span.textContent.length;
    r.selectNodeContents(span);
    try { r.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset); }
    catch (e) { return span.textContent.length; }
    return r.toString().length;
  }
  /* An offset counted in characters, found again among the box's nodes. */
  function pointAt(span, at) {
    var walk = document.createTreeWalker(span, NodeFilter.SHOW_TEXT), node, seen = 0;
    while ((node = walk.nextNode())) {
      if (seen + node.length >= at) return { node: node, at: at - seen };
      seen += node.length;
    }
    return null;
  }
  function caretTo(span, at) {
    var r = document.createRange(), p = pointAt(span, at);
    if (p) { r.setStart(p.node, p.at); r.collapse(true); }
    else { r.selectNodeContents(span); r.collapse(false); }
    var sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  /** What the box's selection covers, counted the same way: a caret is the span
   *  whose two offsets are equal. This is where the DOM stops — editor.js is
   *  handed the numbers and never the Selection they were read from. */
  function caretRange(span) {
    var sel = getSelection(), end = caretOffset(span), r;
    if (!sel || !sel.rangeCount) return { at: end, end: end };
    r = document.createRange();
    r.selectNodeContents(span);
    try { r.setEnd(sel.getRangeAt(0).startContainer, sel.getRangeAt(0).startOffset); }
    catch (e) { return { at: end, end: end }; }
    return { at: r.toString().length, end: end };
  }
  /** Put the selection back over a span of characters — what the writer had
   *  highlighted before the overlay took the focus away. */
  function selectSpan(span, at, end) {
    var a = pointAt(span, at), b = pointAt(span, end), r, sel;
    if (at === end || !a || !b) return caretTo(span, end);
    r = document.createRange();
    r.setStart(a.node, a.at);
    r.setEnd(b.node, b.at);
    sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
  }

  /* A Table Line is edited as the one string it is; Tab is what makes it feel
     like a row. Which Cell an offset is in, and where a Cell's text ends, are
     editor.js's business — this is only the caret that lands there. */
  function caretToCell(span, n) {
    var at = L.cellEnd(span.textContent, n);
    if (at > -1) caretTo(span, at);
  }
  /** Walk the caret one Cell along. Past the last Cell this commits the row and
   *  opens the next one with the caret in its first Cell — the writing loop,
   *  sideways. Back from the first Cell there is nowhere to go. */
  function tabCell(span, back) {
    var text = span.textContent;
    var to = L.cellAt(text, caretOffset(span)) + (back ? -1 : 1);
    if (to < 0) return;
    if (to >= L.cells(text).length) {
      /* the Run's width is read off the model, so the row being typed has to
         be in it before the next one is sized from it */
      commitEdit();
      render();
      openLine('below');
      if (editing) caretToCell(editing.span, 0);
      return;
    }
    caretToCell(span, to);
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
      if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && (ev.key === 'k' || ev.key === 'K')) {
        ev.preventDefault();
        addrAtCaret(span, line);
        return;
      }
      if (ev.key === 'Tab' && line.type === 'table') {
        ev.preventDefault();
        tabCell(span, ev.shiftKey);
        return;
      }
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

  /* -------------------------------------------------- the address overlay
   *
   * The addressed thing in a Line, reached with `a` on a Line that is closed
   * and `^K` inside one that is open. One card with two states: the picker,
   * which is the links the Line already has, and the form, which is the two
   * halves of the one that was picked. Every rewrite of the text itself comes
   * from editor.js — what is here is DOM, keys and focus.
   *
   * addr is null, or { line, kind, n, where }: the *line object*, so a commit
   * lands where the overlay opened even if the document moved underneath it; n
   * says which link is being written — -1 for one that is not there yet; and
   * where is the span of the open box it was reached from, or null. */

  var LINKABLE = ['h1', 'h2', 'h3', 'p', 'list', 'quote', 'note', 'table'];
  var REJECTED = 'not a link the page will make; it will print as text';
  var addr = null, pickAt = 0;

  /* A Line with no inline markup in it has nothing to address, whichever key
     asked. Says so, and answers whether that was the case. */
  function unaddressable(l) {
    if (LINKABLE.indexOf(l.type) > -1) return false;
    say('a ' + L.byId[l.type].name.toLowerCase() + ' line has nothing to address');
    return true;
  }

  function openAddr() {
    commitEdit();
    render();
    var l = doc.line();
    if (l.type === 'img') return addrForm(l, 'img', -1);
    if (unaddressable(l)) return;
    /* nothing to pick between is not a question worth asking: no links opens an
       empty form, one link opens that one */
    var found = L.links(l.text);
    if (found.length > 1) return addrPicker(l, found);
    addrForm(l, 'link', found.length ? 0 : -1);
  }

  /* `^K` inside an open edit box: the same overlay, opened on the span the
     caret was at. The offsets are read off the live box before anything
     redraws, and the text under them arrives as the wording, so linking a
     phrase is select-then-one-key. */
  function addrAtCaret(span, l) {
    /* an Image addresses a file, not a span of its text, so there is no caret
       in it to put a link at — and `a` is still the way to its two fields */
    if (l.type === 'img') {
      return say('an image line has no text to link — a opens its src and caption');
    }
    if (unaddressable(l)) return;
    var where = trimmed(span.textContent, caretRange(span));
    commitEdit();
    render();
    addrForm(l, 'link', -1, where);
    say(where.wording ? 'a link for what is selected' : 'a link at the caret');
  }

  /* A selection dragged over a phrase usually takes a space with it. The
     wording is what the link will carry, so the space is dropped from the span
     as well as from the wording — otherwise the link eats it on the way in. */
  function trimmed(text, where) {
    var at = where.at, end = where.end;
    while (at < end && /\s/.test(text.charAt(at))) at++;
    while (end > at && /\s/.test(text.charAt(end - 1))) end--;
    return { at: at, end: end, wording: text.slice(at, end) };
  }

  /* Back into the box the overlay was opened from: over the span Esc left
     alone, or after the link that was just written. */
  function backToEdit(l, where) {
    var i = doc.lines.indexOf(l);
    if (i < 0) return;
    doc.cur = i;
    startEdit();
    if (editing) selectSpan(editing.span, where.at, where.end);
  }

  function showAddr(kind, picking) {
    whatEl.textContent = kind === 'img' ? 'image' : 'link';
    pickEl.hidden = !picking;
    formEl.hidden = picking;
    addrOv.classList.add('on');
  }

  function addrPicker(l, found) {
    addr = { line: l, kind: 'link', n: -1 };
    pickAt = 0;
    /* the number beside an entry is the digit that picks it, so past the ninth
       there is none to show — j k and Enter still reach them */
    function entry(n, at, label) {
      return '<b data-n="' + n + '"><u>' + (at < 9 ? at + 1 : '·') + '</u>' + label + '</b>';
    }
    pickEl.innerHTML = found.map(function (x, i) {
      return entry(i, i, L.esc(x.wording) + ' <i>' + L.esc(x.href) + '</i>');
    }).join('') + entry(-1, found.length, 'new link');
    showAddr('link', true);
    markPick();
    say('pick a link — a digit, or j k and Enter');
  }

  function picks() { return pickEl.querySelectorAll('b'); }
  function markPick() {
    var bs = picks();
    for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('on', i === pickAt);
  }
  function pick(i) {
    var b = picks()[i];
    if (b) addrForm(addr.line, 'link', +b.dataset.n);
  }

  /* `where` is the span of the open edit box the overlay was reached from, or
     null when it was reached from the picker or from `a` on a closed Line. */
  function addrForm(l, kind, n, where) {
    addr = { line: l, kind: kind, n: n, where: where || null };
    var img = kind === 'img', hit = img ? null : L.links(l.text)[n];
    labA.textContent = img ? 'src' : 'wording';
    labB.textContent = img ? 'caption' : 'href';
    fldA.value = img ? l.text : (where ? where.wording : (hit ? hit.wording : ''));
    fldB.value = img ? (l.sub || '') : (hit ? hit.href : '');
    showAddr(kind, false);
    warnAddr();
    fldA.focus();
    fldA.select();
  }

  /* An href the allowlist refuses is still committed — it is the writer's
     line — but it says here what the page will do with it instead. */
  function warnAddr() {
    var href = fldB.value.trim();
    var bad = addr && addr.kind === 'link' && href && !L.safeLinkHref(href);
    warnEl.textContent = bad ? REJECTED : '';
  }

  function hideAddr() {
    var was = addr;
    addr = null;
    addrOv.classList.remove('on');
    fldA.blur();
    fldB.blur();
    return was;
  }

  /* Esc, or the close button: nothing is written. An overlay reached from an
     open box hands the box back exactly as it took it, selection and all. */
  function closeAddr() {
    var was = hideAddr();
    if (was && was.where) backToEdit(was.line, was.where);
  }

  /* One committed overlay is one change: the line is rewritten once, and the
     render() that follows is the single state the history keeps. */
  function commitAddr() {
    var l = addr.line, n = addr.n, where = addr.where, put = null;
    var first = fldA.value.trim(), second = fldB.value.trim();

    if (addr.kind === 'img') {
      l.text = L.cleanSrc(first);                            /* src */
      l.sub = L.cleanCaption(second) || null;                /* caption */
      closeAddr();
      render();
      return say(l.text ? 'image ' + l.text : 'image cleared');
    }
    var wording = first, href = second;
    if (!wording) return say('a link needs its wording — Esc leaves the line as it is');
    if (!href && n < 0) return say('a new link needs something to point at');

    /* Nothing to point at unlinks, and the wording that comes back is the one
       in the field — byte for byte when it was not touched, so a wording the
       syntax would trim survives a link it was never asked to change. */
    var had = L.links(l.text)[n];
    if (!href) {
      l.text = (had && wording === had.wording) ? L.unlink(l.text, n)
                                                : L.setLink(l.text, n, wording, '');
    } else if (where) {
      put = L.addLinkAt(l.text, wording, href, where.at, where.end);
      l.text = put.text;
    } else if (n < 0) l.text = L.addLink(l.text, wording, href);
    else l.text = L.setLink(l.text, n, wording, href);
    hideAddr();
    render();
    /* the caret goes back after the render, and after the link, not before */
    if (put) backToEdit(l, { at: put.end, end: put.end });
    say(!href ? 'unlinked — the wording stays'
              : (L.safeLinkHref(href) ? 'link set' : REJECTED));
  }

  /* The picker has no input to type into, so its keys arrive at the document;
     the form's two fields stop their own. */
  function addrKey(e) {
    var k = e.key;
    if (k === 'Escape') { e.preventDefault(); closeAddr(); return; }
    if (pickEl.hidden) return;
    if (k === 'Enter') pick(pickAt);
    else if (/^[1-9]$/.test(k)) pick(+k - 1);
    else if (k === 'j' || k === 'ArrowDown') { pickAt = Math.min(picks().length - 1, pickAt + 1); markPick(); }
    else if (k === 'k' || k === 'ArrowUp') { pickAt = Math.max(0, pickAt - 1); markPick(); }
    else return;
    e.preventDefault();
  }

  [fldA, fldB].forEach(function (el) {
    el.addEventListener('input', warnAddr);
    el.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Tab') { e.preventDefault(); (el === fldA ? fldB : fldA).focus(); }
      else if (e.key === 'Enter') { e.preventDefault(); commitAddr(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeAddr(); }
    });
  });
  pickEl.addEventListener('click', function (e) {
    var b = e.target.closest('b');
    if (b) pick([].indexOf.call(picks(), b));
  });
  document.getElementById('addrClose').addEventListener('click', closeAddr);

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

    { name: 'col', arg: 'add|del|left|right [n]',
      help: 'a column of this table — counted from 1, across every row',
      items: function (w) {
        if (w.length === 2) return L.COL_OPS.slice();
        /* a Column is named by its number; the heading is what says which
           number, so Tab offers the two together */
        if (w.length === 3) {
          return doc.columns(doc.cur).map(function (head, i) {
            return (i + 1) + (head ? ' ' + head : '');
          });
        }
        return [];
      },
      run: function (a) {
        /* the heading Tab writes beside the number is a word past the argument,
           and a command's trailing words are its own business to ignore */
        var why = doc.column(a[1], a[2]);
        if (why) return say(why);
        say(colDone(a[1], a[2]));
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

    { name: 'link', help: 'the links in this line — pick one, or write a new one (a)',
      run: function () { openAddr(); } },

    { name: 'img', help: "an image's file and caption — the same overlay (a)",
      run: function () { openAddr(); } },

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
    /* the strip's four: the selected Column, operated on */
    var co = e.target.closest('.colstrip button');
    if (co) { columnOp(co.dataset.op); return; }
    /* the strip: an entry names a Column, and choosing one is not a change to
       the document — render() is here for the edit the mousedown committed */
    var ce = e.target.closest('.colstrip b');
    if (ce) {
      colSel = +ce.dataset.col;
      colOn = doc.line();
      render();
      return;
    }
    /* A Cell is the row and the place in it at once: the cursor lands on the
       row, it opens, and the caret walks to the Cell that was clicked. A
       finger gets the same one step rather than the tap-to-select above,
       because a Cell names where in the row to write and a Line does not — the
       second tap would have nothing left to say. */
    var cell = e.target.closest('.ln.table .cell');
    if (cell) {
      doc.cur = +cell.closest('.ln').dataset.i;
      render();
      startEdit();
      if (editing) caretToCell(editing.span, +cell.dataset.c);
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
    if (addr) { addrKey(e); return; }

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
    /* the two keys the strip's `‹` and `›` are: a selected Column is
       drawn on screen, so there is always something visible to move, and with
       none selected these say nothing and do nothing */
    if ((e.ctrlKey || e.metaKey) && !e.altKey && tab !== 'read' &&
        (k === 'ArrowLeft' || k === 'ArrowRight') && colSel) {
      e.preventDefault();
      columnOp(k === 'ArrowLeft' ? 'left' : 'right');
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
    /* the seven the legend also has as buttons, so that a key and the button
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
