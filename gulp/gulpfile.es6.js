import { relative } from 'path'

import gulp from 'gulp'
import { log, colors } from 'gulp-util'

import './gulpfile-html'
import getDependencies from './gulpfile-dependencies'

const { red } = colors


gulp.task('default', ['dependencies.json', 'html', 'watch'], () => {
  const result = getDependencies()

  const relativePath = s => relative(result.base, s)

  log('Found %s cycles', red(`${result.cycles.length}`))
  for (const cycle of result.cycles) {
    log('%s', cycle.map(relativePath).join(' -> '))
  }
})
