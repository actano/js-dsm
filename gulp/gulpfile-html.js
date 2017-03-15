import gulp from 'gulp'
import pug from 'gulp-pug'
import stylus from 'gulp-stylus'
import webpackStream from 'webpack-stream'
import named from 'vinyl-named'
import postcss from 'gulp-postcss'
import autoprefixer from 'autoprefixer'
import { log, colors, PluginError } from 'gulp-util'
import { resolve } from 'path'
import express from 'express'
// import webpack from 'webpack'
// import WebpackDevServer from 'webpack-dev-server'

const { green } = colors

const webpackConfig = {
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json'],
  },
  devServer: {
    contentBase: resolve(__dirname, '../build'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            ['env', { targets: { browsers: ['last 2 versions'] } }],
          ],
        },
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [
            ['env', { targets: { browsers: ['last 2 versions'] } }],
          ],
          plugins: ['transform-react-jsx', 'transform-object-rest-spread'],
        },
      },
    ],
  },
}

gulp.task('html-js', () =>
  gulp.src(['html/*.js', 'html/*.jsx'])
    .pipe(named())
    .pipe(webpackStream(webpackConfig))
    .pipe(gulp.dest('build')))

gulp.task('html-css', () =>
  gulp.src('html/*.styl')
    .pipe(stylus())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest('build')))

gulp.task('html', ['html-js', 'html-css'], () =>
  gulp.src('html/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('build')))

gulp.task('watch', () => {
  gulp.watch(['html/**', 'lib/**'], ['html'])
})

gulp.task('server', (cb) => {
  const app = express()

  app.use('/', express.static('build'))

  const port = 8080
  app.listen(port, (err) => {
    log(green('Development server running on http://127.0.0.1:%s'), port)
    cb(err)
  })
})

/*
gulp.task('server', (callback) => {
  // modify some webpack config options
  const myConfig = Object.create(webpackConfig)
  myConfig.devtool = 'eval'
  myConfig.debug = true

  // Start a webpack-dev-server
  new WebpackDevServer(webpack(myConfig), {
    publicPath: '/',
    stats: {
      colors: true,
    },
  }).listen(8080, 'localhost', (err) => {
    if (err) throw new PluginError('webpack-dev-server', err)
    log('[webpack-dev-server]', green('http://localhost:8080/webpack-dev-server/index.html'))
    callback()
  })
})
*/
