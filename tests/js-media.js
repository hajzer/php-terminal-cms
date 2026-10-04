/* Dumps the src the JS half writes for a list of Image Lines, each in a
   Document's Media directory, so bin/test can compare it with the PHP half.
   The preview has to show the picture the page would.
   Usage: node tests/js-media.js <cases.json>, each case { line, media } */
'use strict';
var fs = require('fs'), path = require('path');
var root = path.dirname(__dirname);
global.window = {};
require(path.join(root, 'editor', 'langs.js'));
var L = require(path.join(root, 'editor', 'editor.js'));

function unesc(s) {
  return s.replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

var cases = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
process.stdout.write(JSON.stringify(cases.map(function (c) {
  var m = /<img src="([^"]*)"/.exec(L.renderDoc(L.parse(c.line + '\n'), { meta: false, media: c.media }));
  return m ? unesc(m[1]) : null;
})));
