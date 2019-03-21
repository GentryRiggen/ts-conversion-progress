"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPercentage = exports.roundToDecimal = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var R = _interopRequireWildcard(require("ramda"));

var _recursiveReaddir = _interopRequireDefault(require("recursive-readdir"));

var _path = _interopRequireDefault(require("path"));

var _ink = require("ink");

var _inkBox = _interopRequireDefault(require("ink-box"));

var _inkSpinner = _interopRequireDefault(require("ink-spinner"));

var _inkGradient = _interopRequireDefault(require("ink-gradient"));

var _inkBigText = _interopRequireDefault(require("ink-big-text"));

var roundToDecimal = function roundToDecimal(num) {
  var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
  return parseFloat(num.toFixed(count));
};

exports.roundToDecimal = roundToDecimal;

var getPercentage = function getPercentage(num) {
  return roundToDecimal(num * 100, 0);
};

exports.getPercentage = getPercentage;

var TSConversionProgress =
/*#__PURE__*/
function (_PureComponent) {
  (0, _inherits2.default)(TSConversionProgress, _PureComponent);

  function TSConversionProgress() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2.default)(this, TSConversionProgress);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2.default)(this, (_getPrototypeOf2 = (0, _getPrototypeOf3.default)(TSConversionProgress)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "state", {
      invalidArgs: false,
      readingFiles: true,
      files: [],
      readError: null
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "getFileTypeCount", function (files) {
      var extensions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      return R.compose(R.length, R.filter(function (fileExtension) {
        return R.anyPass(extensions.map(function (e) {
          return R.equals(e);
        }))(fileExtension);
      }), R.map(_path.default.extname))(files);
    });
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "readFiles",
    /*#__PURE__*/
    (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee() {
      var directory, ignoreFile, files;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              directory = R.prop(2, process.argv);

              ignoreFile = function ignoreFile(file, stats) {
                var extension = _path.default.extname(file);

                var ignoring = !stats.isDirectory() && extension !== '.js' && extension !== '.ts' && extension !== '.tsx' && extension !== '.jsx';
                return ignoring;
              };

              _context.prev = 2;
              _context.next = 5;
              return (0, _recursiveReaddir.default)(directory, [ignoreFile], _this.onFilesRead);

            case 5:
              files = _context.sent;

              _this.setState({
                readingFiles: false,
                files: files
              });

              _context.next = 12;
              break;

            case 9:
              _context.prev = 9;
              _context.t0 = _context["catch"](2);

              _this.setState({
                readingFiles: false,
                readError: _context.t0
              });

            case 12:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 9]]);
    })));
    return _this;
  }

  (0, _createClass2.default)(TSConversionProgress, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      if (process.argv.length <= 2) {
        this.setState({
          invalidArgs: true
        });
        return;
      }

      return this.readFiles();
    }
  }, {
    key: "renderInvalidArgs",
    value: function renderInvalidArgs() {
      return _react.default.createElement(_inkBox.default, {
        borderStyle: "round",
        borderColor: "cyan",
        padding: 1
      }, "Path required: ", "".concat(_path.default.basename(__filename)), ' ', _react.default.createElement(_ink.Color, {
        magenta: true
      }, "./src"));
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state = this.state,
          files = _this$state.files,
          invalidArgs = _this$state.invalidArgs,
          readingFiles = _this$state.readingFiles,
          readError = _this$state.readError;

      if (invalidArgs) {
        return this.renderInvalidArgs();
      }

      if (readingFiles) {
        return _react.default.createElement(_ink.Color, {
          green: true
        }, _react.default.createElement(_inkSpinner.default, null), _react.default.createElement(_ink.Color, {
          white: true
        }, " Reading files..."));
      }

      if (readError) {
        return _react.default.createElement(_ink.Color, {
          white: true
        }, "Error reading files...", _react.default.createElement("div", null, _react.default.createElement(_ink.Color, {
          red: true
        }, readError)));
      }

      var jsFileCount = this.getFileTypeCount(files, ['.js', '.jsx']);
      var tsFileCount = this.getFileTypeCount(files, ['.ts', '.tsx']);
      var total = jsFileCount + tsFileCount;
      var progress = total <= 0 ? 0 : getPercentage(tsFileCount / total);
      return _react.default.createElement("div", null, _react.default.createElement(_inkGradient.default, {
        name: "pastel"
      }, _react.default.createElement(_inkBigText.default, {
        text: "".concat(progress, "% Complete")
      })), _react.default.createElement(_inkBox.default, {
        borderStyle: "round",
        borderColor: "cyan",
        padding: 1
      }, _react.default.createElement(_ink.Color, {
        red: true
      }, "Javascript Files: ", jsFileCount)), _react.default.createElement(_inkBox.default, {
        borderStyle: "round",
        borderColor: "cyan",
        padding: 1
      }, _react.default.createElement(_ink.Color, {
        green: true
      }, "TypeScript Files: ", tsFileCount)));
    }
  }]);
  return TSConversionProgress;
}(_react.PureComponent);

(0, _ink.render)(_react.default.createElement(TSConversionProgress, null));
