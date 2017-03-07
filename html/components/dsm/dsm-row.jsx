import React from 'react'
import * as d3 from 'd3'
import Node from '../../node'
import { HEAD_WIDTH, getTotalSize } from '../../util/layout'
import DsmCell from './dsm-cell'

const DsmRow = ({ node, columns, scale, matrixRow, y, redScale, greenScale }) => {
  const xScale = d3.scaleBand()
    .domain(columns)
    .range([HEAD_WIDTH, getTotalSize(columns.length)])

  const cells = columns.map((columnNode, index) =>
    <DsmCell
      scale={xScale}
      node={columnNode}
      matrixCell={matrixRow[index]}
      x={index}
      y={y}
      redScale={redScale}
      greenScale={greenScale}
      key={columnNode.path}
    />,
  )

  return (
    <g
      transform={`translate(0,${scale(node)})`}
    >
      {cells}
    </g>
  )
}

DsmRow.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired,
  columns: React.PropTypes.arrayOf(
    React.PropTypes.instanceOf(Node),
  ).isRequired,
  scale: React.PropTypes.func.isRequired,
  matrixRow: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      deps: React.PropTypes.number,
      isScc: React.PropTypes.bool,
    }),
  ).isRequired,
  y: React.PropTypes.number.isRequired,
  redScale: React.PropTypes.func.isRequired,
  greenScale: React.PropTypes.func.isRequired,
}

export default DsmRow
