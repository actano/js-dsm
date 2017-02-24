import * as d3 from 'd3' // eslint-disable-line import/no-unresolved, import/extensions
import { interpolateReds, interpolateGreens } from 'd3-scale-chromatic'
import { dirname, basename } from 'path'

class Node {
  constructor(path) {
    this.parent = null
    this.name = basename(path)
    this.children = []
    this.dependencies = []
    this.reverseDependencies = []
    this._depth = NaN
  }

  get path() {
    return this.parent ? `${this.parent.path}/${this.name}` : this.name
  }

  get depth() {
    return Math.max(this._depth, ...this.children.map(child => child.depth))
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
    return `${this.path} (${this.depth})`
  }
}

const dsm = (data) => {
  const { root, cycles } = data
  console.log(cycles[0].join(' -> ')) // eslint-disable-line no-console

  const selection = []
  for (const node of root.children) {
    selection.push(...node.children)
  }
  selection.sort((a, b) => b.depth - a.depth)

  const deps = (fromNode, toNode) => {
    if (fromNode === toNode) return NaN
    let result = 0
    for (const dep of fromNode.allDependencies()) {
      if (dep.isChildOf(toNode)) result += 1
    }
    return result
  }
  const yAxisData = selection
  const xAxisData = selection
  const matrix = yAxisData.map(y => xAxisData.map(x => deps(x, y)))
  const headWidth = 80

  const xScale = d3.scaleBand()
    .domain(xAxisData)
    .range([headWidth, 2048])

  const yScale = d3.scaleBand()
    .domain(yAxisData)
    .range([headWidth, 2048])

  const maxDeps = d3.max(matrix, row => d3.max(row))
  const redScale = d3.scaleSequential(interpolateReds).domain([1, maxDeps])
  const greenScale = d3.scaleSequential(interpolateGreens).domain([1, maxDeps])

  const chart = d3.select('.chart')
    .attr('width', 2048)
    .attr('height', 2048)

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
          const value = matrix[y][x]
          if (value === 0 || x === y) {
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
        .text((xNode, x) => matrix[y][x] || '')
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
        node.parent._depth = 0
      }
    }
    return nodes[path]
  }

  for (const filename of Object.keys(data.files)) {
    const file = data.files[filename]
    const node = buildPath(filename)
    node._depth = file.depth
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
