import { resolve, delimiter, relative } from 'path'

import { Graph, json as graphJson } from 'graphlib'
import gulp from 'gulp'
import { obj } from 'through2'
import { File, log, colors } from 'gulp-util'
import coffee from 'gulp-coffee'
import babel from 'gulp-babel'
import shebang from 'gulp-strip-shebang'
import streamify from 'stream-array'

import jade from './local-gulp-pug'
import stylus from './gulp-stylus'
import yieldDependencies, { ERROR_MODULE_NOT_FOUND, ERROR_ARGUMENT_NOT_LITERAL, ERROR_TOO_MANY_ARGUMENTS } from '../lib/dependencies'

const { red, gray } = colors

const TARGET = resolve(process.env.TARGET || process.cwd())

let graph = null

const recordDependencies = (filename, iterator) => {
  const srcId = relative(TARGET, filename)
  for (const target of iterator) {
    const targetId = relative(TARGET, target)
    graph.setEdge(srcId, targetId)
  }
}

function* parse(filename, contents) {
  try {
    for (const action of yieldDependencies(filename, contents)) {
      if (action.type === ERROR_MODULE_NOT_FOUND) {
        log('%s: Cannot resolve: %s', red(action.filename), gray(action.range))
      } else if (action.type === ERROR_ARGUMENT_NOT_LITERAL) {
        log('%s: Expected literal argument: %s', red(action.filename), gray(action.range))
      } else if (action.type === ERROR_TOO_MANY_ARGUMENTS) {
        log('%s: Expected only one argument: %s', red(action.filename), gray(action.range))
      } else {
        yield action
      }
    }
  } catch (e) {
    log('cannot parse %s: %s', red(filename), e.toString())
  }
}

const parseDependencies = () => obj((file, enc, callback) => {
  const filename = file.history[0]
  recordDependencies(filename, parse(filename, String(file.contents)))
  callback(null)
})

const dataDependencies = () => obj((file, enc, callback) => {
  if (file.data && file.data.dependencies) {
    recordDependencies(file.history[0], file.data.dependencies)
  }
  callback(null, file)
})

gulp.task('reset', () => {
  graph = new Graph({ directed: true })
})

const src = (type) => {
  const pattern = process.env[type] || `**/*.${type}`
  const patternArray = pattern.split(delimiter)
  patternArray.push('!**/node_modules/**')
  return gulp.src(patternArray, { cwd: TARGET })
}

gulp.task('js', ['reset'], () => src('js')
  .pipe(shebang())
  .pipe(babel())
  .pipe(parseDependencies()))

gulp.task('coffee', ['reset'], () => src('coffee')
  .pipe(shebang())
  .pipe(coffee())
  .pipe(parseDependencies()))

gulp.task('pug', ['reset'], () => src('pug')
  .pipe(shebang())
  .pipe(jade())
  .pipe(dataDependencies())
  .pipe(parseDependencies()))

gulp.task('styl', ['reset'], () => src('styl')
  .pipe(shebang())
  .pipe(stylus())
  .pipe(dataDependencies()))

gulp.task('dependencies', ['js', 'coffee', 'pug', 'styl'])

gulp.task('dependencies.json', ['dependencies'], () => {
  const contents = Buffer.from(JSON.stringify(graphJson.write(graph)))
  const json = new File({ contents })
  json.base = process.cwd()
  json.path = resolve(json.base, 'dependencies.json')
  return streamify([json]).pipe(gulp.dest('build'))
})

export default () => graph
