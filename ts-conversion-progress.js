import React, { PureComponent } from 'react'
import * as R from 'ramda'
import recursive from 'recursive-readdir'
import fs from 'fs'
import path from 'path'
import { render, Color } from 'ink'
import Box from 'ink-box'
import Spinner from 'ink-spinner'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'

export const roundToDecimal = num => parseFloat(Math.floor(num))
export const getPercentage = num => roundToDecimal(num * 100, 0)

class TSConversionProgress extends PureComponent {
  state = {
    invalidArgs: false,
    readingFiles: true,
    files: [],
    readError: null,
  }

  componentDidMount() {
    if (process.argv.length <= 2) {
      this.setState({ invalidArgs: true })
      return
    }

    return this.readFiles()
  }

  isJSFile = file =>
    R.anyPass(['.js', '.jsx'].map(e => R.equals(e)))(path.extname(file))
  isTSFile = file =>
    R.anyPass(['.ts', '.tsx'].map(e => R.equals(e)))(path.extname(file))

  getFileTypeCount = (files, extensions = []) =>
    R.compose(
      R.length,
      R.filter(fileExtension =>
        R.anyPass(extensions.map(e => R.equals(e)))(fileExtension),
      ),
      R.map(path.extname),
    )(files)

  askUserIfShouldIgnore = file => {
    const ignore = R.prop(3, process.argv)
    if (!ignore) {
      return false
    }
    const regex = new RegExp(ignore)
    return regex.test(file)
  }

  anyValidReasonsToIncludeFile = file => {
    if (this.askUserIfShouldIgnore(file)) {
      return false
    }
    return R.anyPass([
      file => path.extname(file) === '.js',
      file => path.extname(file) === '.ts',
      file => path.extname(file) === '.tsx',
      file => path.extname(file) === '.jsx',
    ])(file)
  }

  shouldIgnoreFile = (file, stats) => {
    const anyValidReason = this.anyValidReasonsToIncludeFile(file)
    return !stats.isDirectory() && !anyValidReason
  }

  readFiles = async () => {
    const directory = R.prop(2, process.argv)
    if (!fs.existsSync(directory)) {
      return this.setState({
        readingFiles: false,
        readError: `Directory "${directory} not found`,
      })
    }
    try {
      const files = await recursive(
        directory,
        [this.shouldIgnoreFile],
        this.onFilesRead,
      )
      this.setState({ readingFiles: false, files })
    } catch (err) {
      this.setState({ readingFiles: false, readError: err })
    }
  }

  renderInvalidArgs() {
    return (
      <Box borderStyle="round" borderColor="cyan" padding={1}>
        Path argument is required e.g. {`${path.basename(__filename)}`}{' '}
        <Color magenta>src/</Color>
      </Box>
    )
  }

  renderFile = (f, index) => {
    const searchDir = `${R.prop(2, process.argv)}${path.sep}`
    const file = f.replace(searchDir, '')
    const fileDir = path.dirname(file)

    const prevFile =
      index === 0 ? '' : this.state.files[index - 1].replace(searchDir, '')
    const prevFileDir = path.dirname(prevFile)
    const newDir = prevFileDir !== fileDir
    const color = this.isJSFile(file) ? { red: true } : { green: true }

    return (
      <div key={file}>
        {newDir && (
          <div>
            <div style={{ marginTop: 1 }} />
            <Color whiteBright>{fileDir}</Color>
          </div>
        )}
        <Color {...color}>
          {'- '}
          {file}
        </Color>
      </div>
    )
  }

  render() {
    const { files, invalidArgs, readingFiles, readError } = this.state
    if (invalidArgs) {
      return this.renderInvalidArgs()
    }

    if (readingFiles) {
      return (
        <Color green>
          <Spinner />
          <Color white> Reading files...</Color>
        </Color>
      )
    }

    if (readError) {
      return (
        <Color white>
          Error reading files...
          <div>
            <Color red>{readError}</Color>
          </div>
        </Color>
      )
    }

    const jsFileCount = this.getFileTypeCount(files, ['.js', '.jsx'])
    const tsFileCount = this.getFileTypeCount(files, ['.ts', '.tsx'])
    const total = jsFileCount + tsFileCount
    const progress = total <= 0 ? 0 : getPercentage(tsFileCount / total)
    return (
      <div>
        <Box borderStyle="round" borderColor="cyan">
          <Color white>Files</Color>
        </Box>
        {files.map(this.renderFile)}

        <div style={{ marginTop: 1 }} />
        <Box borderStyle="round" borderColor="cyan">
          <Color white>Total Files: {total}</Color>
        </Box>
        <Box borderStyle="round" borderColor="cyan">
          <Color red>Javascript Files: {jsFileCount}</Color>
        </Box>
        <Box borderStyle="round" borderColor="cyan">
          <Color green>TypeScript Files: {tsFileCount}</Color>
        </Box>

        <Gradient name="pastel">
          <BigText text={`${progress}% Complete`} />
        </Gradient>
      </div>
    )
  }
}

render(<TSConversionProgress />)
