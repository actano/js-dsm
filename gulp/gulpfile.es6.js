import gulp from 'gulp'

import './gulpfile-dependencies'
import './gulpfile-html'

gulp.task('default', ['dependencies.json', 'html', 'watch', 'server'])
