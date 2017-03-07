import 'babel-polyfill'
import * as d3 from 'd3' // eslint-disable-line import/no-unresolved, import/extensions
import { interpolateReds, interpolateGreens } from 'd3-scale-chromatic'
import { dirname, basename } from 'path'
import { tap, flow, reject, filter, map, find, concat, flatMap, take } from 'lodash/fp'
import createLowerLeftDsm from './dsm'

class Node {
  constructor(path) {
    this.parent = null
    this.name = basename(path)
    this.children = []
    this.dependencies = []
    this.reverseDependencies = []
  }

  get path() {
    return this.parent ? `${this.parent.path}/${this.name}` : this.name
  }

  dependOn(node) {
    this.dependencies.push(node)
    node.reverseDependencies.push(this)
  }

  * allDependencies() {
    yield* this.dependencies
    for (const child of this.children) {
      yield* child.allDependencies()
    }
  }

  isChildOf(node) {
    if (this === node) return true
    if (this.parent === null) return false
    return this.parent.isChildOf(node)
  }

  toString() {
    return `${this.path}`
  }
}

function collectLeafs(node) {
  if (node.children.length) {
    return flatMap(collectLeafs, node.children)
  }

  return node
}

const isTestFile = node => /^.*\/test\/.*$/.test(node.path)

const dsm = (data) => {
  const { root } = data

  const selection = flow(
    collectLeafs,
    reject(isTestFile),
    take(500),
  )(root)

  const headWidth = 80
  const cellSize = 20
  const totalSize = headWidth + (selection.length * cellSize)
  const { matrix, dsmNodes } = createLowerLeftDsm(selection)
  const xAxisData = dsmNodes
  const yAxisData = dsmNodes

  const xScale = d3.scaleBand()
    .domain(xAxisData)
    .range([headWidth, totalSize])

  const yScale = d3.scaleBand()
    .domain(yAxisData)
    .range([headWidth, totalSize])

  const maxDeps = d3.max(matrix, row => d3.max(row, x => x.deps))
  const redScale = d3.scaleSequential(interpolateReds).domain([0, maxDeps + 1])
  const greenScale = d3.scaleSequential(interpolateGreens).domain([0, maxDeps + 1])

  const chart = d3.select('.chart')
    .attr('width', totalSize)
    .attr('height', totalSize)

  chart.append('g').attr('class', 'axisLeft').attr('transform', `translate(${headWidth},0)`)
    .selectAll('g')
    .data(yScale.domain())
    .enter()
    .append('g')
    .attr('transform', node => `translate(0,${yScale(node) + (yScale.step() / 2)})`)
    .append('text')
    .attr('dx', '-0.5em')
    .text(node => node.path)

  chart.append('g').attr('class', 'axisTop').attr('transform', `translate(0,${headWidth})`)
    .selectAll('g')
    .data(xScale.domain())
    .enter()
    .append('g')
    .attr('transform', node => `translate(${xScale(node) + (xScale.step() / 2)},0)`)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('dx', '0.5em')
    .text(node => node.path)

  chart.append('g').attr('class', 'table')
    .selectAll('g')
    .data(yAxisData)
    .enter()
    .append('g')
    .attr('transform', node => `translate(0,${yScale(node)})`)
    .each((yNode, y, nodes) => {
      const cell = d3.select(nodes[y]).selectAll('g').data(xAxisData).enter()
        .append('g')
        .attr('transform', node => `translate(${xScale(node)},0)`)
      cell.append('rect')
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', (xNode, x) => {
          const value = matrix[y][x].deps
          if (x === y) {
            return 'rgb(128, 128, 128)'
          }
          if (value === 0) {
            if (matrix[y][x].isScc) {
              return 'rgb(230, 184, 0)'
            }
            return 'none'
          }
          if (y > x) {
            return greenScale(value)
          }
          return redScale(value)
        })
      cell.append('text')
        .attr('transform', `translate(${xScale.step() / 2},${yScale.step() / 2})`)
        .attr('x', 0.5)
        .attr('y', 0.5)
        .attr('dy', '0.2em')
        .text((xNode, x) => matrix[y][x].deps || '')
    })
}

const parse = (data) => {
  const nodes = {}

  const buildPath = (path) => {
    if (!nodes[path]) {
      const node = new Node(path)
      nodes[path] = node
      node.parent = path === '/' ? null : buildPath(dirname(path))
      if (node.parent) {
        node.parent.children.push(node)
      }
    }
    return nodes[path]
  }

  for (const filename of Object.keys(data.files)) {
    const file = data.files[filename]
    const node = buildPath(filename)
    for (const dependency of Object.keys(file.children)) {
      node.dependOn(buildPath(dependency))
    }
  }

  const cycles = data.cycles.map(cycle => cycle.map(buildPath))

  let root = nodes['/']
  while (root.children.length === 1) {
    root = root.children[0]
  }

  root.parent = null
  root.name = ''

  return { root, cycles }
}

d3.json('dependencies.json', (error, data) => {
  if (error) {
    throw error
  }
  dsm(parse(data))
})
