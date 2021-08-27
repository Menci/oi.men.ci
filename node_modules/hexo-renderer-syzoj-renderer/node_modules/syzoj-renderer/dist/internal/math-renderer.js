'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

var _asyncRenderer = require('./async-renderer');

var _asyncRenderer2 = _interopRequireDefault(_asyncRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var getMathjax = function getMathjax() {
  var _require = require('mathjax-full/js/mathjax.js'),
      mathjax = _require.mathjax;

  var _require2 = require('mathjax-full/js/input/tex.js'),
      TeX = _require2.TeX;

  var _require3 = require('mathjax-full/js/output/svg.js'),
      SVG = _require3.SVG;

  var _require4 = require('mathjax-full/js/adaptors/liteAdaptor.js'),
      liteAdaptor = _require4.liteAdaptor;

  var _require5 = require('mathjax-full/js/handlers/html.js'),
      RegisterHTMLHandler = _require5.RegisterHTMLHandler;

  var _require6 = require('mathjax-full/js/input/tex/AllPackages.js'),
      AllPackages = _require6.AllPackages;

  var adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);
  var tex = new TeX({ packages: AllPackages });
  var svg = new SVG();
  var html = mathjax.document('', { InputJax: tex, OutputJax: svg });

  /**
   * @param input {string}
   * @param displayMode {boolean}
   */
  return function (input, displayMode) {
    var node = html.convert(input, { display: displayMode });
    return adaptor.innerHTML(node);
  };
};

function formatErrorMessage(message) {
  var htmlContext = (0, _escapeHtml2.default)(message.trim('\n')).split('\n').join('<br>');
  return '<span class="math-rendering-error-message">' + htmlContext + '</span>';
};

// This class is previously intented to call KaTeX and MathJax in _doRender
// to render asynchronously, but then I moved to render all maths within
// a single call to MathJax, so now this class overrides doRender and handle
// all tasks in a single function. And cache is NOT used.

var MathRenderer = function (_AsyncRenderer) {
  _inherits(MathRenderer, _AsyncRenderer);

  function MathRenderer(cache, callbackAddReplace) {
    _classCallCheck(this, MathRenderer);

    // Don't cache it since a page must be rendered in the same time.
    return _possibleConstructorReturn(this, (MathRenderer.__proto__ || Object.getPrototypeOf(MathRenderer)).call(this, null, callbackAddReplace));
  }

  _createClass(MathRenderer, [{
    key: 'addRenderTask',
    value: function addRenderTask(texCode, displayMode) {
      return this._addRenderTask({
        texCode: texCode,
        displayMode: displayMode
      });
    }
  }, {
    key: 'doRender',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(callbackCheckFiltered) {
        var mathjax, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, task, result, errorMessage;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                mathjax = getMathjax();
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 4;
                _iterator = this.tasks[Symbol.iterator]();

              case 6:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 17;
                  break;
                }

                task = _step.value;

                if (!callbackCheckFiltered(task.uuid)) {
                  _context.next = 10;
                  break;
                }

                return _context.abrupt('continue', 14);

              case 10:
                result = null;

                try {
                  result = mathjax(task.task.texCode, task.task.displayMode);
                } catch (e) {
                  errorMessage = 'Failed to render ' + (task.task.displayMode ? 'display' : 'inline') + ' math: ' + _util2.default.inspect(task.task.texCode) + '\n' + e.toString();

                  result = formatErrorMessage(errorMessage);
                }

                if (task.task.displayMode) result = '<p><span style="margin-left: 50%; transform: translateX(-50%); display: inline-block; ">' + result + '</span></p>';
                this.callbackAddReplace(task.uuid, result);

              case 14:
                _iteratorNormalCompletion = true;
                _context.next = 6;
                break;

              case 17:
                _context.next = 23;
                break;

              case 19:
                _context.prev = 19;
                _context.t0 = _context['catch'](4);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 23:
                _context.prev = 23;
                _context.prev = 24;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 26:
                _context.prev = 26;

                if (!_didIteratorError) {
                  _context.next = 29;
                  break;
                }

                throw _iteratorError;

              case 29:
                return _context.finish(26);

              case 30:
                return _context.finish(23);

              case 31:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 19, 23, 31], [24,, 26, 30]]);
      }));

      function doRender(_x) {
        return _ref.apply(this, arguments);
      }

      return doRender;
    }()
  }]);

  return MathRenderer;
}(_asyncRenderer2.default);

exports.default = MathRenderer;