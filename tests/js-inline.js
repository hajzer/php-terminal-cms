/* Dumps what the JS half makes of a list of inline markup strings, so bin/test
   can compare it with the PHP half character for character. The two renderers
   have to agree about which link targets become links, or the editor's preview
   stops being the bytes the site would send.
   Usage: node tests/js-inline.js <cases.json> */
'use strict';
var fs = require('fs'), path = require('path');
var root = path.dirname(__dirname);
global.window = {};
require(path.join(root, 'editor', 'langs.js'));
var L = require(path.join(root, 'editor', 'editor.js'));

var cases = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
process.stdout.write(JSON.stringify(cases.map(function (c) { return L.inline(c); })));
