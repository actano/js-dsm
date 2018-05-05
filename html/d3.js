import 'babel-polyfill'
import { json as graphJson } from 'graphlib'
import * as d3 from 'd3'
import { interpolateReds, interpolateGreens } from 'd3-scale-chromatic'
import createLowerLeftDsmFromGraph from '../lib/dsm'
import autoSelection from '../lib/auto-selection'
import aggregateGraph from '../lib/aggregate-graph'

const dsm = (graph) => {
  const selection = autoSelection(graph)
  const aggregatedGraph = aggregateGraph(graph, selection)
  const { matrix, dsmNodes } = createLowerLeftDsmFromGraph(aggregatedGraph)
  const headWidth = 80
  const cellSize = 20
  const totalSize = headWidth + (dsmNodes.length * cellSize)
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
    .text(node => node)

  chart.append('g').attr('class', 'axisTop').attr('transform', `translate(0,${headWidth})`)
    .selectAll('g')
    .data(xScale.domain())
    .enter()
    .append('g')
    .attr('transform', node => `translate(${xScale(node) + (xScale.step() / 2)},0)`)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('dx', '0.5em')
    .text(node => node)

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

d3.json('dependencies.json').then((data) => {
  dsm(graphJson.read(data))
}).catch((e) => {
  throw e
})
