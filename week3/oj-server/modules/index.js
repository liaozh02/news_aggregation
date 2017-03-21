var requirejs = require('requirejs')

requirejs.config({
  baseUrl: __dirname,
  nodeRequire: require
})

var Document = requirejs('document').Document;
var apply_delta = requirejs('apply_delta');
var range = requirejs('range');


module.exports = Document
