'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _markdownIt = require('markdown-it');

var _markdownIt2 = _interopRequireDefault(_markdownIt);

var _markdownItMathLoose = require('markdown-it-math-loose');

var _markdownItMathLoose2 = _interopRequireDefault(_markdownItMathLoose);

var _markdownItMergeCells = require('markdown-it-merge-cells');

var _markdownItMergeCells2 = _interopRequireDefault(_markdownItMergeCells);

var _objectHash = require('object-hash');

var _objectHash2 = _interopRequireDefault(_objectHash);

var _objectAssignDeep = require('object-assign-deep');

var _objectAssignDeep2 = _interopRequireDefault(_objectAssignDeep);

var _mathRenderer = require('./internal/math-renderer');

var _mathRenderer2 = _interopRequireDefault(_mathRenderer);

var _highlightRenderer = require('./internal/highlight-renderer');

var _highlightRenderer2 = _interopRequireDefault(_highlightRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(input, cache, callbackFilter, options) {
    var cacheKey, cachedResult, uuidReplaces, mathRenderer, highlightRenderer, renderer, htmlResult, replacedHtmlResult, uuid;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // Check cache first.
            cacheKey = void 0;

            if (!cache) {
              _context.next = 8;
              break;
            }

            cacheKey = (0, _objectHash2.default)({
              type: "Markdown",
              task: input,
              options: options
            });

            _context.next = 5;
            return cache.get(cacheKey);

          case 5:
            cachedResult = _context.sent;

            if (!cachedResult) {
              _context.next = 8;
              break;
            }

            return _context.abrupt('return', cachedResult);

          case 8:

            // Merge options with default values and normalize non-object input for options.
            options = Object.assign({
              markdownItMergeCells: true
            }, options);

            // Maths and highlights are rendered asynchronously, so a UUID placeholder is
            // returned to markdown-it during markdown rendering process. After markdown
            // and these finish rendering, replace the placeholder with rendered content
            // in markdown rendering result.
            uuidReplaces = {};
            mathRenderer = new _mathRenderer2.default(cache, function (uuid, result) {
              uuidReplaces[uuid] = result;
            });
            highlightRenderer = new _highlightRenderer2.default(cache, function (uuid, result) {
              uuidReplaces[uuid] = result;
            }, options.highlight);
            renderer = new _markdownIt2.default((0, _objectAssignDeep2.default)({
              html: true,
              breaks: false,
              linkify: true,
              typographer: false,
              highlight: function highlight(code, language) {
                return highlightRenderer.addRenderTask(code, language);
              }
            }, options.markdownIt));


            renderer.use(_markdownItMathLoose2.default, (0, _objectAssignDeep2.default)({
              inlineOpen: '$',
              inlineClose: '$',
              blockOpen: '$$',
              blockClose: '$$',
              inlineRenderer: function inlineRenderer(str) {
                return mathRenderer.addRenderTask(str, false);
              },
              blockRenderer: function blockRenderer(str) {
                return mathRenderer.addRenderTask(str, true);
              }
            }, options.markdownItMath));

            // Inject merge table cell support.
            if (options.markdownItMergeCells) {
              renderer.use(_markdownItMergeCells2.default);
            }

            htmlResult = renderer.render(input);

            if (callbackFilter) {
              // Useful for XSS filtering.
              htmlResult = callbackFilter(htmlResult);
            }

            // Do math and highlight rendering.
            _context.next = 19;
            return mathRenderer.doRender(function (uuid) {
              return htmlResult.indexOf(uuid) === -1;
            });

          case 19:
            _context.next = 21;
            return highlightRenderer.doRender(function (uuid) {
              return htmlResult.indexOf(uuid) === -1;
            });

          case 21:

            // Replace placeholders back.
            replacedHtmlResult = htmlResult;

            for (uuid in uuidReplaces) {
              replacedHtmlResult = replacedHtmlResult.replace(uuid, uuidReplaces[uuid]);
            }

            // Set cache.

            if (!cache) {
              _context.next = 26;
              break;
            }

            _context.next = 26;
            return cache.set(cacheKey, replacedHtmlResult);

          case 26:
            return _context.abrupt('return', replacedHtmlResult);

          case 27:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function render(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  }

  return render;
}();