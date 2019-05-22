"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPercentage = exports.roundToDecimal = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var R = _interopRequireWildcard(require("ramda"));

var _recursiveReaddir = _interopRequireDefault(require("recursive-readdir"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _ink = require("ink");

var _inkBox = _interopRequireDefault(require("ink-box"));

var _inkSpinner = _interopRequireDefault(require("ink-spinner"));

var _inkGradient = _interopRequireDefault(require("ink-gradient"));

var _inkBigText = _interopRequireDefault(require("ink-big-text"));

const roundToDecimal = num => parseFloat(Math.floor(num));

exports.roundToDecimal = roundToDecimal;

const getPercentage = num => roundToDecimal(num * 100, 0);

exports.getPercentage = getPercentage;
console.log(getPercentage(0.998, 0));

class TSConversionProgress extends _react.PureComponent {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      invalidArgs: false,
      readingFiles: true,
      files: [],
      readError: null
    });
    (0, _defineProperty2.default)(this, "isJSFile", file => R.anyPass(['.js', '.jsx'].map(e => R.equals(e)))(_path.default.extname(file)));
    (0, _defineProperty2.default)(this, "isTSFile", file => R.anyPass(['.ts', '.tsx'].map(e => R.equals(e)))(_path.default.extname(file)));
    (0, _defineProperty2.default)(this, "getFileTypeCount", (files, extensions = []) => R.compose(R.length, R.filter(fileExtension => R.anyPass(extensions.map(e => R.equals(e)))(fileExtension)), R.map(_path.default.extname))(files));
    (0, _defineProperty2.default)(this, "askUserIfShouldIgnore", file => {
      const ignore = R.prop(3, process.argv);

      if (!ignore) {
        return false;
      }

      const regex = new RegExp(ignore);
      return regex.test(file);
    });
    (0, _defineProperty2.default)(this, "anyValidReasonsToIncludeFile", file => {
      if (this.askUserIfShouldIgnore(file)) {
        return false;
      }

      return R.anyPass([file => _path.default.extname(file) === '.js', file => _path.default.extname(file) === '.ts', file => _path.default.extname(file) === '.tsx', file => _path.default.extname(file) === '.jsx'])(file);
    });
    (0, _defineProperty2.default)(this, "shouldIgnoreFile", (file, stats) => {
      const anyValidReason = this.anyValidReasonsToIncludeFile(file);
      return !stats.isDirectory() && !anyValidReason;
    });
    (0, _defineProperty2.default)(this, "readFiles", async () => {
      const directory = R.prop(2, process.argv);

      if (!_fs.default.existsSync(directory)) {
        return this.setState({
          readingFiles: false,
          readError: `Directory "${directory} not found`
        });
      }

      try {
        const files = await (0, _recursiveReaddir.default)(directory, [this.shouldIgnoreFile], this.onFilesRead);
        this.setState({
          readingFiles: false,
          files
        });
      } catch (err) {
        this.setState({
          readingFiles: false,
          readError: err
        });
      }
    });
    (0, _defineProperty2.default)(this, "renderFile", (f, index) => {
      const searchDir = `${R.prop(2, process.argv)}${_path.default.sep}`;
      const file = f.replace(searchDir, '');

      const fileDir = _path.default.dirname(file);

      const prevFile = index === 0 ? '' : this.state.files[index - 1].replace(searchDir, '');

      const prevFileDir = _path.default.dirname(prevFile);

      const newDir = prevFileDir !== fileDir;
      const color = this.isJSFile(file) ? {
        red: true
      } : {
        green: true
      };
      return _react.default.createElement("div", {
        key: file
      }, newDir && _react.default.createElement("div", null, _react.default.createElement("div", {
        style: {
          marginTop: 1
        }
      }), _react.default.createElement(_ink.Color, {
        whiteBright: true
      }, fileDir)), _react.default.createElement(_ink.Color, color, '- ', file));
    });
  }

  componentDidMount() {
    if (process.argv.length <= 2) {
      this.setState({
        invalidArgs: true
      });
      return;
    }

    return this.readFiles();
  }

  renderInvalidArgs() {
    return _react.default.createElement(_inkBox.default, {
      borderStyle: "round",
      borderColor: "cyan",
      padding: 1
    }, "Path argument is required e.g. ", `${_path.default.basename(__filename)}`, ' ', _react.default.createElement(_ink.Color, {
      magenta: true
    }, "src/"));
  }

  render() {
    const {
      files,
      invalidArgs,
      readingFiles,
      readError
    } = this.state;

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

    const jsFileCount = this.getFileTypeCount(files, ['.js', '.jsx']);
    const tsFileCount = this.getFileTypeCount(files, ['.ts', '.tsx']);
    const total = jsFileCount + tsFileCount;
    const progress = total <= 0 ? 0 : getPercentage(tsFileCount / total);
    return _react.default.createElement("div", null, _react.default.createElement(_inkBox.default, {
      borderStyle: "round",
      borderColor: "cyan"
    }, _react.default.createElement(_ink.Color, {
      white: true
    }, "Files")), files.map(this.renderFile), _react.default.createElement("div", {
      style: {
        marginTop: 1
      }
    }), _react.default.createElement(_inkBox.default, {
      borderStyle: "round",
      borderColor: "cyan"
    }, _react.default.createElement(_ink.Color, {
      white: true
    }, "Total Files: ", total)), _react.default.createElement(_inkBox.default, {
      borderStyle: "round",
      borderColor: "cyan"
    }, _react.default.createElement(_ink.Color, {
      red: true
    }, "Javascript Files: ", jsFileCount)), _react.default.createElement(_inkBox.default, {
      borderStyle: "round",
      borderColor: "cyan"
    }, _react.default.createElement(_ink.Color, {
      green: true
    }, "TypeScript Files: ", tsFileCount)), _react.default.createElement(_inkGradient.default, {
      name: "pastel"
    }, _react.default.createElement(_inkBigText.default, {
      text: `${progress}% Complete`
    })));
  }

}

(0, _ink.render)(_react.default.createElement(TSConversionProgress, null));
