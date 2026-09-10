/* The editor's tables and its tokenizer's output, as JSON, so bin/test can
   compare them with the PHP half's. Prompts and dialects exist twice — here
   and in site/src/Line.php — and the language tables once, in
   shared/langs.json; this is how the copies are stopped from drifting apart.

   The samples are declared here and echoed back so that bin/test feeds the PHP
   tokenizer exactly the same input — one source, no second list to keep.

     $ node tests/js-tables.js */
'use strict';
var path = require('path'), fs = require('fs');
var root = path.dirname(__dirname);
global.window = { LANGS: JSON.parse(fs.readFileSync(path.join(root, 'shared', 'langs.json'), 'utf8')) };
var L = require(path.join(root, 'editor', 'editor.js'));

/* one line each, the way the renderer highlights: comments, strings, numbers,
   keywords, variables, an apostrophe, characters that have to be escaped, and
   letters outside ASCII — one tokenizer walks bytes and the other characters,
   so a multibyte letter is where they drift apart first */
var SAMPLES = [
  'function foo($bar) { return "a string"; } // done',
  "if x == 1 and y != 2: print('hi')  # comment",
  'SELECT count(*) FROM t WHERE a = 0x1f -- note',
  '<div class="x">a & b</div> <!-- c -->',
  '+added line',
  '@@ -1,2 +1,2 @@',
  "it's <b>not</b> markup & never was",
  'let ľubovoľné = "prílišné"; // žltučký kôň → 5 €'
];

var hl = {};
Object.keys(window.LANGS).forEach(function (d) {
  if (d === '_comment') return;
  hl[d] = SAMPLES.map(function (s) { return L.highlight(s, d); });
});

process.stdout.write(JSON.stringify({
  prompts: L.PROMPTS,
  code: L.byId.code.subs,
  cli: L.byId.cli.subs,
  samples: SAMPLES,
  highlighted: hl
}));
