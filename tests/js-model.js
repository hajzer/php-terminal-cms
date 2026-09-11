/* The editor's model half, checked without a browser.
   Every assertion here is a bug the editor actually had. bin/test runs this
   and prints the results; usage: node tests/js-model.js */
'use strict';
var path = require('path');
global.window = {};
var L = require(path.join(path.dirname(__dirname), 'editor', 'editor.js'));

var results = [];
function ok(name, cond, detail) {
  results.push({ name: name, ok: !!cond, detail: cond ? '' : String(detail || '') });
}
function eq(name, got, want) {
  ok(name, JSON.stringify(got) === JSON.stringify(want),
     'got  ' + JSON.stringify(got) + '\nwant ' + JSON.stringify(want));
}
function docOf(spec) {
  return new L.Doc(spec.map(function (s) {
    var p = s.split(':');
    return L.mk(p[0], p[1] === undefined ? p[0] : p[1]);
  }));
}
function texts(d) { return d.lines.map(function (l) { return l.text; }); }

/* -------------------------------------------------------------- reorder */
var d = docOf(['p:a', 'p:b', 'p:c', 'p:d']);
d.reorder(1, 2);
eq('drag one row down moves it exactly one row', texts(d), ['a', 'c', 'b', 'd']);
ok('the cursor follows the line it moved', d.cur === 2, 'cur=' + d.cur);

d = docOf(['p:a', 'p:b', 'p:c', 'p:d']);
d.reorder(2, 1);
eq('drag one row up moves it exactly one row', texts(d), ['a', 'c', 'b', 'd']);

d = docOf(['p:a', 'p:b', 'p:c']);
d.reorder(0, 2);
eq('drag to the last row lands last', texts(d), ['b', 'c', 'a']);
d.reorder(2, 0);
eq('drag to the first row lands first', texts(d), ['a', 'b', 'c']);
ok('a drop onto itself changes nothing', d.reorder(1, 1) === false);
ok('a drop from nowhere is refused', d.reorder(9, 0) === false);
d.reorder(0, 99);
eq('a drop past the end clamps to the end', texts(d), ['b', 'c', 'a']);

/* --------------------------------------------------------------- remove */
d = docOf(['p:only']);
d.remove();
ok('removing the last line leaves a document, not a hole', d.lines.length === 1);
ok('and what is left is an empty paragraph',
   d.lines[0].type === 'p' && d.lines[0].text === '', JSON.stringify(d.lines[0]));
ok('the cursor still addresses a line', d.line() !== undefined);

d = docOf(['p:a', 'p:b', 'p:c']);
d.cur = 2;
d.remove();
ok('removing the last of several moves the cursor back', d.cur === 1 && d.line().text === 'b',
   'cur=' + d.cur);

d = docOf(['p:a', 'p:b']);
d.cur = 5;
ok('a cursor past the end is clamped, not left dangling', d.clamp() === 1);

/* --------------------------------------------------------------- insert */
d = docOf(['meta:title: x', 'p:a']);
d.cur = 0;
ok('a new line after Meta is a paragraph, not more Meta', d.insert('below').type === 'p');

d = new L.Doc([L.mk('code', 'one', 'php')]);
var born = d.insert('below');
ok('a new line inside a code run stays in the run',
   born.type === 'code' && born.sub === 'php', JSON.stringify(born));
ok('duplicate gets an id of its own', d.duplicate().id !== d.lines[d.cur - 1].id);

/* -------------------------------------------------------------- dialect */
d = docOf(['p:a']);
ok('a paragraph refuses a dialect — it would split the run', d.setSub('php') === false);
ok('and keeps none', d.line().sub === null);
d.setType('code');
ok('code takes the first dialect by default', d.line().sub === 'php');
ok('code takes a named dialect', d.setSub('bash') && d.line().sub === 'bash');
ok('but not one that is not its own', d.setSub('psql') === false);

/* --------------------------------------------------------------- folds */
function outDoc() {
  return new L.Doc([L.mk('cli', 'ls', 'bash'),
                    L.mk('out', 'one'), L.mk('out', 'two'), L.mk('out', 'three'),
                    L.mk('p', 'after')]);
}
d = outDoc();
d.foldAll();
ok('folding all folds the output run', d.foldedAt(1) === true);
ok('and hides its lines', d.foldedAt(3) === true);
ok('but not the code above it', d.foldedAt(0) === false);
ok('nor the paragraph below it', d.foldedAt(4) === false);

/* the bug: fold state kept beside the document, keyed on the run's first line,
   stopped applying the moment that line was deleted */
d.cur = 1;
d.remove();
ok('a folded run stays folded when its first line goes', d.foldedAt(1) === true);
ok('and still hides what is left', d.foldedAt(1) && d.foldedAt(2));

/* z on the code block folds the output hanging off it, and only that one */
d = outDoc();
d.foldAll();
d.lines.push(L.mk('cli', 'ls', 'zsh'), L.mk('out', 'other'));
ok('the fold target of a CLI line is its own output', d.foldTarget(0) === 1);
ok('a different dialect is a different block', d.foldTarget(5) === 6);
ok('a paragraph has no fold target', d.foldTarget(4) === -1);
d.toggleFold(d.foldTarget(0));
ok('unfolding one block leaves the other alone',
   d.foldedAt(1) === false && d.foldedAt(6) === false);

/* a line typed into a folded run joins the fold; a new run starts open */
d = outDoc();
d.foldAll();
d.cur = 2;
d.reveal();
d.setFold(2, true);
d.cur = 2;
d.insert('below');
ok('a line inserted into a folded run is folded too', d.lines[3].fold === true);

d = outDoc();
d.foldAll();
d.cur = 4;
d.insert('below');
d.setType('out');
ok('a new, separate output run starts unfolded', d.foldedAt(d.cur) === false);
ok('and is visible', d.foldedAt(d.cur) === false);

/* the invariant that made typing disappear: the cursor inside a folded run */
d = outDoc();
d.foldAll();
d.cur = 2;
ok('the cursor can land inside a fold', d.foldedAt(d.cur) === true);
ok('reveal() says it did something', d.reveal() === true);
ok('and the cursor is visible afterwards', d.foldedAt(d.cur) === false);
ok('the whole run came back, not just that line', d.foldedAt(1) === false);
ok('reveal() on a visible line is a no-op', d.reveal() === false);

/* ---------------------------------------------------------------- cells */
/* A Table Line holds its Cells as one pipe-separated string. Splitting it,
   joining it back, and finding the Run it belongs to are what the row editor
   and the column operations both stand on. */
eq('a Line splits into its Cells', L.cells('a | b | c'), ['a', 'b', 'c']);
eq('however the pipes were spaced', L.cells('a|b  |   c'), ['a', 'b', 'c']);
eq('a Line with no pipe in it is one Cell', L.cells('only'), ['only']);
eq('an empty Line is one empty Cell', L.cells(''), ['']);
eq('an empty Cell between two others is a Cell', L.cells('a || c'), ['a', '', 'c']);
eq('a trailing pipe ends in an empty Cell', L.cells('a | b |'), ['a', 'b', '']);
eq('Cells join back with a pipe between them', L.joinCells(['a', 'b', 'c']), 'a | b | c');
eq('joining trims what it is given', L.joinCells(['a ', ' b']), 'a | b');
eq('a row of empty Cells is still that many Cells',
   L.cells(L.joinCells(['', '', ''])).length, 3);
eq('split and join is a round trip', L.joinCells(L.cells('a|b |  c')), 'a | b | c');
eq('a Line shorter than its Run splits into what it holds', L.cells('a | b').length, 2);

/* the caret walks between Cells, so where one ends is counted in the raw text
   the writer typed — not in the trimmed Cells it splits into */
eq('an offset in the first Cell is in Cell 1', L.cellAt('a | b | c', 0), 0);
eq('and one just before a pipe is still in that Cell', L.cellAt('a | b | c', 2), 0);
eq('an offset after a pipe is in the Cell after it', L.cellAt('a | b | c', 3), 1);
eq('an offset past the end of the Line is in the last Cell', L.cellAt('a | b', 99), 1);
eq('a Cell ends after the last character it holds', L.cellEnd('a | b | c', 1), 5);
eq('the first Cell of a row of empty Cells ends where it starts',
   L.cellEnd(L.joinCells(['', '', '']), 0), 0);
eq('a Cell the Line does not have ends nowhere', L.cellEnd('a | b', 5), -1);

/* ------------------------------------------------------------ table runs */
d = docOf(['p:before', 'table:a | b | c', 'table:d | e', 'p:between', 'table:x | y']);
eq('a Table Run is found from a cursor inside it', d.tableRun(1),
   { start: 1, end: 2, width: 3 });
eq('and from any other Line of it', d.tableRun(2), { start: 1, end: 2, width: 3 });
ok('a Line that is not a Table Line belongs to no Run', d.tableRun(0) === null);
ok('nor does a Line off the end of the document', d.tableRun(9) === null);
eq('a second Run further down is a Run of its own', d.tableRun(4),
   { start: 4, end: 4, width: 2 });

/* a row is written Cell by Cell — a row of one Cell has nowhere to walk to */
d = docOf(['table:a | b | c', 'table:d | e']);
d.cur = 1;
eq('a row opened in a Table Run arrives the Run\'s width wide',
   L.cells(d.insert('below').text).length, 3);
ok('and it joins the Run it was opened in', d.tableRun(d.cur).width === 3);
d = docOf(['p:a']);
ok('a row opened elsewhere is no wider than the Line it came from',
   d.insert('below').text === '');

/* ---------------------------------------------------------------- links */
/* What the overlay stands on: finding the addressed thing in a Line's text and
   rewriting it, with no DOM anywhere near it. */

eq('a Line with no links reports none', L.links('plain words, (parens) and [brackets]'), []);
eq('one link is read back whole', L.links('see [the guide](/guides/a) for more'),
   [{ wording: 'the guide', href: '/guides/a', at: 4, end: 26 }]);
eq('several links come back in the order they appear',
   L.links('[a](/1) then [b](/2) then [c](/3)').map(function (k) {
     return k.wording + '=' + k.href; }),
   ['a=/1', 'b=/2', 'c=/3']);

/* the wording stops at the first closing bracket, exactly as inline() does */
eq('a wording that contains a bracket keeps it',
   L.links('[a [b](/x)'), [{ wording: 'a [b', href: '/x', at: 0, end: 10 }]);
eq('and one with a closing bracket in it is not a link at all',
   L.links('[a ] b](/x)'), []);

eq('two adjacent links are two links',
   L.links('[a](/1)[b](/2)').map(function (k) { return [k.wording, k.href, k.at, k.end]; }),
   [['a', '/1', 0, 7], ['b', '/2', 7, 14]]);

/* what links() finds is what the preview links: every safe one becomes an href */
var mixed = '[a](/1) [b](javascript:void) [c](https://example.com/)';
eq('links() finds what inline() matches, safe or not',
   L.links(mixed).length, 3);
ok('and the unsafe one is dropped by inline, not by links',
   L.inline(mixed).indexOf('javascript') < 0, L.inline(mixed));

/* ------------------------------------------------------------- rewriting */
var three = 'a [one](/1) b [two](/2) c [three](/3) d';
var two = L.setLink(three, 1, 'TWO', '/2b');
eq('replacing the nth link rewrites that link', L.links(two).map(function (k) {
     return k.wording + '=' + k.href; }), ['one=/1', 'TWO=/2b', 'three=/3']);
ok('and leaves everything before it byte-identical',
   two.slice(0, 14) === three.slice(0, 14), two);
ok('and everything after it byte-identical',
   two.slice(two.length - 16) === three.slice(three.length - 16), two);
eq('a replacement out of range changes nothing', L.setLink(three, 9, 'x', '/x'), three);
eq('a replacement with no target leaves the wording behind',
   L.setLink('go [here](/1) now', 0, 'here', ''), 'go here now');
eq('a wording that would break the syntax is cut down to what fits',
   L.setLink('[a](/1)', 0, 'b] c', '/2 x)'), '[b c](/2x)');
/* the overlay refuses empty wording with a message; the model refuses it too,
   so `[](...)` cannot be written by either half */
eq('a link with no wording is refused, leaving the text as it was',
   L.setLink(three, 1, '   ', '/2b'), three);

eq('unlinking keeps the wording exactly', L.unlink(three, 1), 'a [one](/1) b two c [three](/3) d');
eq('unlinking leaves the other links alone',
   L.links(L.unlink(three, 1)).map(function (k) { return k.wording; }), ['one', 'three']);
eq('unlinking out of range changes nothing', L.unlink(three, 9), three);

eq('appending to a Line that had none makes the only link',
   L.addLink('some words', 'a guide', '/guides/a'), 'some words [a guide](/guides/a)');
eq('appending to an empty Line writes the link alone',
   L.addLink('', 'a guide', '/guides/a'), '[a guide](/guides/a)');
eq('appending to a Line that had some puts the new one last',
   L.links(L.addLink(three, 'four', '/4')).map(function (k) { return k.href; }),
   ['/1', '/2', '/3', '/4']);
eq('appending does not double a space already there',
   L.addLink('words ', 'a', '/a'), 'words [a](/a)');
eq('appending nothing to point at changes nothing', L.addLink('words', 'a', ''), 'words');
eq('appending with no wording changes nothing', L.addLink('words', '', '/a'), 'words');

/* ------------------------------------------------------------ safe targets */
/* The same cases bin/test's `link targets` section lists, judged by the rule
   the site publishes by — a disagreement here is a preview that lies. */
var targets = {
  '/guides/a': true, '/guides/v1.2-notes': true, '#a-heading': true, '#': true,
  'https://example.com/': true, 'http://example.com/?a=1&b=2': true,
  'mailto:you@example.com': true,
  '//evil.example': false, '/../secret': false, '/a/../../secret': false,
  '&#47;&#47;evil.example': false, '\\evil.example': false,
  'http:///evil.example': false, 'javascript:void': false, 'data:text/html,x': false,
  'vbscript:x': false, 'ftp://example.com/': false, 'mailto:not-an-address': false,
  'relative.html': false
};
Object.keys(targets).forEach(function (t) {
  ok('the overlay judges ' + t + ' the way the site does',
     L.safeLinkHref(t) === targets[t],
     'safeLinkHref=' + L.safeLinkHref(t) + ' want ' + targets[t]);
  ok('and inline() agrees about ' + t,
     (L.inline('[x](' + t + ')').indexOf('<a href=') > -1) === targets[t],
     L.inline('[x](' + t + ')'));
});
ok('an empty href is nothing to point at', L.safeLinkHref('') === false);

/* ------------------------------------------------------- markdown still ok */
var md = '---\ntitle: t\n---\n\n# h\n\n```console\n$ ls\n```\n\n```output\nfile\n```\n';
var round = L.toMarkdown(L.parse(md));
eq('parse -> toMarkdown is still byte-stable', round, L.toMarkdown(L.parse(round)));

/* ---------------------------------------------------------- name and path */
d = new L.Doc([L.mk('meta', 'title: Hello World'), L.mk('p', 'x')]);
ok('the file name follows the title while none is set', d.fileName() === 'hello-world.md',
   d.fileName());
ok('and the path is under content/', d.path() === 'content/hello-world.md', d.path());
d.setMeta('category', 'Guides');
ok('a category meta names the directory', d.path() === 'content/guides/hello-world.md', d.path());
d.setName('Notes On Things.MD');
ok('a name that was set wins over the title', d.fileName() === 'notes-on-things.md', d.fileName());
d.setMeta('title', 'Renamed');
ok('and goes on winning when the title changes', d.fileName() === 'notes-on-things.md',
   d.fileName());
d.setName('../../etc/passwd');
ok('a name cannot escape the directory it names', d.fileName() === 'passwd.md', d.fileName());
d.setName('');
ok('clearing the name goes back to following the title', d.fileName() === 'renamed.md',
   d.fileName());
ok('a document with no title at all is still called something',
   new L.Doc([L.mk('p', 'x')]).fileName() === 'untitled.md');

/* a title is written in a language; the name it becomes is not */
ok('a title with diacritics keeps its letters in the file name',
   new L.Doc([L.mk('meta', 'title: Čo je php-terminal-cms')]).fileName()
     === 'co-je-php-terminal-cms.md',
   new L.Doc([L.mk('meta', 'title: Čo je php-terminal-cms')]).fileName());
d = new L.Doc([L.mk('meta', 'title: Hello World')]);
d.setName('what-it-is-sk.md');
ok('a language suffix is part of the name like any other word',
   d.fileName() === 'what-it-is-sk.md', d.fileName());

/* a fresh document is a document, not an empty screen */
var fresh = new L.Doc(L.blank({ date: '2026-01-02' }));
eq('a new document starts with its metadata and a heading',
   fresh.lines.map(function (l) { return l.type + ':' + l.text; }),
   ['meta:title: untitled', 'meta:date: 2026-01-02', 'h1:']);
eq('a new document can inherit the category it is filed under',
   new L.Doc(L.blank({ date: '2026-01-02', category: 'news' })).path(),
   'content/news/untitled.md');

/* load() keeps the Doc object, so the history and the UI keep their handle */
d = docOf(['p:a']);
var same = d.load(L.parse('# hi'), 'Some File.md');
ok('load returns the same document object', same === d);
eq('load replaces the lines', texts(d), ['hi']);
ok('load takes the name of the file it read', d.fileName() === 'some-file.md', d.fileName());
d.load(L.parse('# other'));
ok('and load without a name keeps the one it has', d.fileName() === 'some-file.md');

/* opening a file shows where that file came from, which is the whole point of
   showing a path at all */
d.load(L.parse('---\ntitle: Writing in the editor\ncategory: guides\n---\n\n# Writing\n'),
       'writing-in-the-editor.md');
eq('an opened file keeps its own name and category',
   d.path(), 'content/guides/writing-in-the-editor.md');

/* -------------------------------------------------------------- history */
d = docOf(['p:a', 'p:b']);
var h = new L.History();
h.reset(d);
ok('nothing to undo at the start', h.undo(d) === false);
d.line().text = 'a2';
ok('a change is recorded', h.record(d) === true);
ok('recording twice records nothing new', h.record(d) === false);
d.cur = 1;
ok('moving the cursor alone is not a step to undo', h.record(d) === false);
ok('undo goes back one step', h.undo(d) === true);
eq('and the text is what it was', texts(d), ['a', 'b']);
ok('redo comes forward again', h.redo(d) === true && d.lines[0].text === 'a2', texts(d));
ok('and there is nothing beyond the newest state', h.redo(d) === false);

/* the classic bug: a snapshot that shares its lines with the live document */
h.undo(d);
d.lines[0].text = 'clobbered';
h.redo(d);
h.undo(d);
ok('a snapshot is a copy, not a view of the live lines', d.lines[0].text === 'a', texts(d));

/* a fresh edit after an undo throws the redo branch away */
d = docOf(['p:a']);
h = new L.History();
h.reset(d);
d.line().text = 'b';
h.record(d);
h.undo(d);
d.line().text = 'c';
h.record(d);
ok('a new change after an undo drops the redo branch', h.redo(d) === false);
ok('and undo still reaches the state before it', h.undo(d) && d.lines[0].text === 'a', texts(d));

/* the name and the fold flags are document state, so history has to carry them */
d = docOf(['cli:ls', 'out:one']);
h = new L.History();
h.reset(d);
d.setName('renamed.md');
d.setFold(1, true);
ok('renaming and folding are one recorded step', h.record(d) === true);
h.undo(d);
ok('undo brings back the old name', d.name === null, d.fileName());
ok('and the old fold state', d.foldedAt(1) === false);

/* opening a line and filling it is one thing the writer did, so it is one undo */
d = docOf(['p:a']);
h = new L.History();
h.reset(d);
d.insert('below');
h.record(d);
h.coalesce();
d.line().text = 'typed';
h.record(d);
ok('a coalesced pair is one step', h.undo(d) === true && d.lines.length === 1, texts(d));
ok('and there is nothing left behind it', h.undo(d) === false);

h.reset(d);
h.coalesce();
h.record(d);                       /* nothing changed — the mark is spent anyway */
d.line().text = 'later';
h.record(d);
ok('a coalesce that caught nothing does not swallow the next change',
   h.undo(d) === true && d.lines[0].text === 'a', texts(d));

/* history does not grow without limit */
d = docOf(['p:a']);
h = new L.History(5);
for (var n = 0; n < 20; n++) { d.line().text = 'v' + n; h.record(d); }
ok('history keeps only its last few states', h.stack.length === 5, h.stack.length);

/* -------------------------------------------------- dialects and prompts */
var codeSubs = L.byId.code.subs, cliSubs = L.byId.cli.subs;
ok('code offers a broad set of languages', codeSubs.length >= 30, codeSubs.length);
ok('CLI offers every major shell',
   ['bash', 'sh', 'zsh', 'fish', 'powershell', 'cmd'].every(function (s) {
     return cliSubs.indexOf(s) > -1;
   }), cliSubs.join(' '));
ok('no dialect is a fence word that means something else',
   codeSubs.concat(cliSubs).every(function (s) {
     return ['output', 'text', 'console', 'shell-session', 'terminal', ''].indexOf(s) < 0;
   }));
ok('every dialect is a legal fence info string',
   codeSubs.concat(cliSubs).every(function (s) { return /^[a-z0-9_-]+$/.test(s); }));
ok('every CLI dialect has a prompt',
   cliSubs.every(function (s) { return !!L.PROMPTS[s]; }),
   cliSubs.filter(function (s) { return !L.PROMPTS[s]; }).join(' '));

var promptOf = {};
Object.keys(L.PROMPTS).forEach(function (k) { promptOf[L.PROMPTS[k]] = k; });
ok('no two dialects share a prompt',
   Object.keys(promptOf).length === Object.keys(L.PROMPTS).length);

/* the round trip that a shared prompt would silently break */
Object.keys(L.PROMPTS).forEach(function (dia) {
  var back = L.parse('```console\n' + L.PROMPTS[dia] + ' hello\n```');
  ok('a ' + dia + ' prompt reads back as ' + dia,
     back.length === 1 && back[0].type === 'cli' && back[0].sub === dia && back[0].text === 'hello',
     JSON.stringify(back));
});

process.stdout.write(JSON.stringify(results));
