import { alg } from 'graphlib'

import gulp from 'gulp'
import { log, colors } from 'gulp-util'

import './gulpfile-html'
import getDependencies from './gulpfile-dependencies'

const { red } = colors


gulp.task('default', ['dependencies.json', 'html', 'watch'], () => {
  const graph = getDependencies()
  const cycles = alg.findCycles(graph)

  log('Found %s cycles', red(`${cycles.length}`))
  for (const cycle of cycles) {
    log('%s', cycle.join(' -> '))
  }
})
