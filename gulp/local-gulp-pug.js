/* eslint-disable no-param-reassign */

import through from 'through2'
import { replaceExtension, PluginError } from 'gulp-util'
import relative from 'require-relative'

export default function (options) {
  const opts = Object.assign({}, options)
  opts.data = Object.assign(opts.data || {}, opts.locals || {})

  return through.obj((file, enc, cb) => {
    opts.filename = file.history[0]
    const pug = relative('jade', opts.filename)
    file.path = replaceExtension(file.path, '.js')

    try {
      const contents = String(file.contents)
      const compiled = pug.compileClientWithDependenciesTracked(contents, opts)
      file.contents = new Buffer(compiled.body)
      if (!file.data) file.data = {}
      file.data.dependencies = compiled.dependencies
    } catch (e) {
      cb(new PluginError('gulp-pug', e))
      return
    }
    cb(null, file)
  })
}
