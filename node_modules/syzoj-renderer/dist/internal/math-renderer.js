'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mathjaxNodePage = require('mathjax-node-page');

var _mathjaxNodePage2 = _interopRequireDefault(_mathjaxNodePage);

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _randomstring = require('randomstring');

var _randomstring2 = _interopRequireDefault(_randomstring);

var _asyncRenderer = require('./async-renderer');

var _asyncRenderer2 = _interopRequireDefault(_asyncRenderer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Generate a random macro name for MathJax's reset macro.
var resetMacroName = 'resetMacro' + _randomstring2.default.generate({
  length: 16,
  charset: 'alphabetic'
});

function formatErrorMessage(message) {
  var htmlContext = (0, _escapeHtml2.default)(message.trim('\n')).split('\n').join('<br>');
  return '<span class="math-rendering-error-message">' + htmlContext + '</span>';
}

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
        var jsdom, document, tasks, tasksAndReset, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, task, uuid, math, scriptTag, divTag, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _task, result, errorMessage;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                jsdom = new _mathjaxNodePage2.default.JSDOM(), document = jsdom.window.document;
                tasks = this.tasks.filter(function (task) {
                  return !callbackCheckFiltered(task.uuid);
                }), tasksAndReset = [{
                  uuid: (0, _uuid2.default)(),
                  task: {
                    texCode: '\\' + resetMacroName,
                    displayMode: false
                  }
                }].concat(_toConsumableArray(tasks));
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 5;

                for (_iterator = tasksAndReset[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  task = _step.value;
                  uuid = task.uuid, math = task.task;
                  scriptTag = document.createElement('script');

                  scriptTag.type = 'math/tex';
                  if (math.displayMode) scriptTag.type += '; mode=display';
                  scriptTag.text = math.texCode;

                  divTag = document.createElement('div');

                  divTag.id = uuid;
                  divTag.appendChild(scriptTag);

                  document.body.appendChild(divTag);
                }

                _context.next = 13;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context['catch'](5);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 13:
                _context.prev = 13;
                _context.prev = 14;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 16:
                _context.prev = 16;

                if (!_didIteratorError) {
                  _context.next = 19;
                  break;
                }

                throw _iteratorError;

              case 19:
                return _context.finish(16);

              case 20:
                return _context.finish(13);

              case 21:
                _context.next = 23;
                return new Promise(function (resolve, reject) {
                  _mathjaxNodePage2.default.mjpage(jsdom, {
                    output: 'svg',
                    cssInline: false,
                    errorHandler: function errorHandler(id, wrapperNode, sourceFormula, sourceFormat, errors) {
                      wrapperNode.innerHTML = formatErrorMessage(errors.join('\n'));
                    },
                    extensions: '[syzoj-renderer-mathjax]/reset.js,TeX/begingroup.js,TeX/newcommand.js,Safe.js',
                    paths: {
                      'syzoj-renderer-mathjax': _path2.default.join(__dirname, 'mathjax/')
                    },
                    MathJax: {
                      Safe: {
                        allow: {
                          require: 'none'
                        }
                      },
                      Reset: {
                        resetMacroName: resetMacroName
                      }
                    }
                  }, {}, resolve);
                });

              case 23:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context.prev = 26;


                for (_iterator2 = tasks[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  _task = _step2.value;
                  result = null;

                  try {
                    result = document.getElementById(_task.uuid).innerHTML;
                  } catch (e) {
                    errorMessage = 'Failed to render ' + (_task.task.displayMode ? 'display' : 'inline') + ' math: ' + _util2.default.inspect(_task.task.texCode) + '\n' + e.toString();

                    result = formatErrorMessage(errorMessage);
                  }

                  if (_task.task.displayMode) result = '<p style="text-align: center; ">' + result + '</p>';
                  this.callbackAddReplace(_task.uuid, result);
                }
                _context.next = 34;
                break;

              case 30:
                _context.prev = 30;
                _context.t1 = _context['catch'](26);
                _didIteratorError2 = true;
                _iteratorError2 = _context.t1;

              case 34:
                _context.prev = 34;
                _context.prev = 35;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 37:
                _context.prev = 37;

                if (!_didIteratorError2) {
                  _context.next = 40;
                  break;
                }

                throw _iteratorError2;

              case 40:
                return _context.finish(37);

              case 41:
                return _context.finish(34);

              case 42:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[5, 9, 13, 21], [14,, 16, 20], [26, 30, 34, 42], [35,, 37, 41]]);
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