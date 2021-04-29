'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _highlight = require('./highlight');

Object.defineProperty(exports, 'highlight', {
  enumerable: true,
  get: function get() {
    return _highlight.highlight;
  }
});

var _markdown = require('./markdown');

Object.defineProperty(exports, 'markdown', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_markdown).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }