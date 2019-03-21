import React, { PureComponent } from 'react'
import * as R from 'ramda'
import recursive from 'recursive-readdir'
import path from 'path'
import { render, Color } from 'ink'
import Box from 'ink-box'
import Spinner from 'ink-spinner'
import Gradient from 'ink-gradient'
import BigText from 'ink-big-text'

export const roundToDecimal = (num, count = 2) => parseFloat(num.toFixed(count))
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

  getFileTypeCount = (files, extensions = []) =>
    R.compose(
      R.length,
      R.filter(fileExtension =>
        R.anyPass(extensions.map(e => R.equals(e)))(fileExtension),
      ),
      R.map(path.extname),
    )(files)

  readFiles = async () => {
    const directory = R.prop(2, process.argv)
    const ignoreFile = (file, stats) => {
      const extension = path.extname(file)
      const ignoring =
        !stats.isDirectory() &&
        extension !== '.js' &&
        extension !== '.ts' &&
        extension !== '.tsx' &&
        extension !== '.jsx'
      return ignoring
    }
    try {
      const files = await recursive(directory, [ignoreFile], this.onFilesRead)
      this.setState({ readingFiles: false, files })
    } catch (err) {
      this.setState({ readingFiles: false, readError: err })
    }
  }

  renderInvalidArgs() {
    return (
      <Box borderStyle="round" borderColor="cyan" padding={1}>
        Path required: {`${path.basename(__filename)}`}{' '}
        <Color magenta>./src</Color>
      </Box>
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
        <Gradient name="pastel">
          <BigText text={`${progress}% Complete`} />
        </Gradient>
        <Box borderStyle="round" borderColor="cyan" padding={1}>
          <Color red>Javascript Files: {jsFileCount}</Color>
        </Box>
        <Box borderStyle="round" borderColor="cyan" padding={1}>
          <Color green>TypeScript Files: {tsFileCount}</Color>
        </Box>
      </div>
    )
  }
}

render(<TSConversionProgress />)
