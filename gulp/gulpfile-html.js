import gulp from 'gulp'
import pug from 'gulp-pug'
import stylus from 'gulp-stylus'
import webpackStream from 'webpack-stream'
import named from 'vinyl-named'

const webpackConfig = {
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
    ],
  },
}

gulp.task('html-js', () =>
  gulp.src('html/*.js')
    .pipe(named())
    .pipe(webpackStream(webpackConfig))
    .pipe(gulp.dest('build')))

gulp.task('html-css', () =>
  gulp.src('html/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('build')))

gulp.task('html', ['html-js', 'html-css'], () =>
  gulp.src('html/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('build')))

gulp.task('watch', () => {
  gulp.watch(['html/**', 'lib/**'], ['html'])
})
