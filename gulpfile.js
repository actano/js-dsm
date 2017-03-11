require('babel-register')({
  presets: [
    ['env', { targets: { node: 'current' } }],
  ],
})
require('./gulp/gulpfile.es6')
require('./gulp/gulpfile-html.js')
