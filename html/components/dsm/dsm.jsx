import React from 'react'
import * as d3 from 'd3'
import { interpolateReds, interpolateGreens } from 'd3-scale-chromatic'
import Node from '../../node'
import { HEAD_WIDTH, getTotalSize } from '../../util/layout'
import DsmRow from './dsm-row'

const Dsm = (props) => {
  const yScale = d3.scaleBand()
    .domain(props.data.dsmNodes)
    .range([HEAD_WIDTH, getTotalSize(props.data.dsmNodes.length)])

  const maxDeps = d3.max(props.data.matrix, row => d3.max(row, x => x.deps))
  const redScale = d3.scaleSequential(interpolateReds).domain([0, maxDeps + 1])
  const greenScale = d3.scaleSequential(interpolateGreens).domain([0, maxDeps + 1])

  const rows = props.data.dsmNodes.map((node, index) =>
    <DsmRow
      node={node}
      matrixRow={props.data.matrix[index]}
      scale={yScale}
      columns={props.data.dsmNodes}
      y={index}
      redScale={redScale}
      greenScale={greenScale}
      key={node.path}
    />,
  )

  return (
    <g
      className="table"
    >
      {rows}
    </g>
  )
}

Dsm.propTypes = {
  data: React.PropTypes.shape({
    matrix: React.PropTypes.arrayOf(
      React.PropTypes.arrayOf(
        React.PropTypes.shape({
          deps: React.PropTypes.number,
          isScc: React.PropTypes.bool,
        }),
      ),
    ),
    dsmNodes: React.PropTypes.arrayOf(
      React.PropTypes.instanceOf(Node),
    ),
  }).isRequired,
}

export default Dsm
