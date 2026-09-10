/* Dumps what the JS half makes of a markdown file, so bin/test can compare it
   with the PHP half. Usage: node tests/js-dump.js <file.md> */
'use strict';
var fs = require('fs'), path = require('path');
var root = path.dirname(__dirname);
global.window = {};
require(path.join(root, 'editor', 'langs.js'));
var L = require(path.join(root, 'editor', 'editor.js'));

var md = fs.readFileSync(process.argv[2], 'utf8');
var lines = L.parse(md);
var html = L.renderDoc(lines, { meta: false });

process.stdout.write(JSON.stringify({
  types: lines.map(function (l) { return l.type + (l.sub ? ':' + l.sub : ''); }),
  markdown: L.toMarkdown(lines),
  blocks: html.split('\n').map(function (line) {
    var m = /^<([a-z0-9]+)/i.exec(line);
    return m ? m[1] : '?';
  })
}, null, 0));
