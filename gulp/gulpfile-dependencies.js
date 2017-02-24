import isUndefined from 'lodash.isundefined'
import uniqBy from 'lodash.uniqby'
import { resolve, delimiter } from 'path'

import gulp from 'gulp'
import { obj } from 'through2'
import { log, colors, File } from 'gulp-util'
import coffee from 'gulp-coffee'
import babel from 'gulp-babel'
import shebang from 'gulp-strip-shebang'
import streamify from 'stream-array'

import jade from './local-gulp-pug'
import stylus from './gulp-stylus'
import { parse } from './dependencies'

const { gray } = colors

const TARGET = resolve(process.env.TARGET || process.cwd())

let result = null

const recordDependencies = (filename, iterator) => {
  const { files } = result
  const { children } = files[filename] || (files[filename] = { children: {} })
  for (const target of iterator) {
    const count = children[target] || 0
    children[target] = count + 1
  }
  return children
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
  const files = {}
  result = { base: TARGET, files }
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

gulp.task('dependencies.json', ['depth'], () => {
  const contents = new Buffer(JSON.stringify(result))
  const json = new File({ contents })
  json.base = process.cwd()
  json.path = resolve(json.base, 'dependencies.json')
  return streamify([json]).pipe(gulp.dest('build'))
})

gulp.task('parents', ['dependencies'], () => {
  const { files } = result

  const _file = name => files[name] || (files[name] = {
    missing: true,
    children: {},
  })

  for (const filename of Object.keys(files)) {
    const file = files[filename]
    if (!file.parents) file.parents = {}
    for (const childFilename of Object.keys(file.children)) {
      const childFile = _file(childFilename)
      if (childFile.missing) {
        log('file %s missing', gray(childFilename))
      }
      if (!childFile.parents) childFile.parents = {}
      childFile.parents[filename] = file.children[childFilename]
    }
  }
})

gulp.task('depth', ['parents'], () => {
  const { files } = result
  const cycles = []

  const sortCycle = (cycle) => {
    const array = []
    let index = 0
    for (const filename of cycle) {
      const { depth } = files[filename]
      array.push({ index, filename, depth })
      index += 1
    }
    array.sort((a, b) => b.depth - a.depth)
    return cycle.slice(index).concat(cycle.slice(0, index))
  }

  const crawlUp = (filename, depth, ...visited) => {
    const file = files[filename]
    const cycle = visited.indexOf(filename)
    if (cycle >= 0) {
      cycles.push(visited.slice(0, cycle))
      return
    }
    if (!isUndefined(file.depth) && file.depth >= depth) {
      return
    }
    file.depth = depth
    for (const parent of Object.keys(file.parents)) {
      crawlUp(parent, depth + 1, filename, ...visited)
    }
  }

  for (const filename of Object.keys(files)) {
    const file = files[filename]
    if (isUndefined(file.depth) && Object.keys(file.children).length === 0) {
      crawlUp(filename, 0)
    }
  }

  result.cycles = uniqBy(cycles.map(sortCycle), a => a.join('|'))
})

export default () => result
