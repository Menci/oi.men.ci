'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AsyncRenderer = function () {
  function AsyncRenderer(cache, callbackAddReplace) {
    _classCallCheck(this, AsyncRenderer);

    this.cache = cache;
    this.callbackAddReplace = callbackAddReplace;
    this.tasks = [];
  }

  _createClass(AsyncRenderer, [{
    key: '_generateUUID',
    value: function _generateUUID(uuidGenerator) {
      return uuidGenerator();
    }
  }, {
    key: '_addRenderTask',
    value: function _addRenderTask(task) {
      var uuid = this._generateUUID(_uuid2.default);
      this.tasks.push({
        uuid: uuid,
        task: task
      });
      return uuid;
    }
  }, {
    key: 'doRender',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(callbackCheckFiltered) {
        var _this = this;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return Promise.all(this.tasks.filter(function (task) {
                  return !callbackCheckFiltered(task.uuid);
                }).map(function () {
                  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(task) {
                    return _regenerator2.default.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.t0 = _this;
                            _context.t1 = task.uuid;
                            _context.next = 4;
                            return _this._doRender(task.task);

                          case 4:
                            _context.t2 = _context.sent;
                            return _context.abrupt('return', _context.t0.callbackAddReplace.call(_context.t0, _context.t1, _context.t2));

                          case 6:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this);
                  }));

                  return function (_x2) {
                    return _ref2.apply(this, arguments);
                  };
                }()));

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function doRender(_x) {
        return _ref.apply(this, arguments);
      }

      return doRender;
    }()
  }]);

  return AsyncRenderer;
}();

exports.default = AsyncRenderer;