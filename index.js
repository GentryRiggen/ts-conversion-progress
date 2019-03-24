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

const roundToDecimal = (num, count = 2) => parseFloat(num.toFixed(count));

exports.roundToDecimal = roundToDecimal;

const getPercentage = num => roundToDecimal(num * 100, 0);

exports.getPercentage = getPercentage;

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
    (0, _defineProperty2.default)(this, "readFiles", async () => {
      const directory = R.prop(2, process.argv);

      if (!_fs.default.existsSync(directory)) {
        return this.setState({
          readingFiles: false,
          readError: `Directory "${directory} not found`
        });
      }

      const ignoreFile = (file, stats) => {
        const extension = _path.default.extname(file);

        const ignoring = !stats.isDirectory() && extension !== '.js' && extension !== '.ts' && extension !== '.tsx' && extension !== '.jsx';
        return ignoring;
      };

      try {
        const files = await (0, _recursiveReaddir.default)(directory, [ignoreFile], this.onFilesRead);
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
    (0, _defineProperty2.default)(this, "renderFile", file => {
      const color = this.isJSFile(file) ? {
        red: true
      } : {
        green: true
      };
      return _react.default.createElement("div", {
        key: file
      }, _react.default.createElement(_ink.Color, color, file));
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
    const progress = total <= 0 ? 0 : getPercentage(tsFileCount / total); // return (
    //   <div>
    //     <Gradient name="pastel">
    //       <BigText text={`${progress}% Complete`} />
    //     </Gradient>
    //     <Box borderStyle="round" borderColor="cyan" padding={1}>
    //       <Color red>Javascript Files: {jsFileCount}</Color>
    //     </Box>
    //     <Box borderStyle="round" borderColor="cyan" padding={1}>
    //       <Color green>TypeScript Files: {tsFileCount}</Color>
    //     </Box>
    //   </div>
    // )

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
