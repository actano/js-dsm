/* eslint-disable no-param-reassign */
import through from 'through2'
import stylus from 'stylus'

export default function (options) {
  const opts = Object.assign({}, options)

  return through.obj((file, enc, cb) => {
    opts.filename = file.history[0]
    if (!file.data) file.data = {}
    file.data.dependencies = stylus(String(file.contents), opts).deps()
    cb(null, file)
  })
}
