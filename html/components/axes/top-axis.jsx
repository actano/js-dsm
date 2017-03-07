import React from 'react'
import * as d3 from 'd3'
import { HEAD_WIDTH, getTotalSize } from '../../util/layout'
import Node from '../../node'
import TopAxisItem from './top-axis-item'

const TopAxis = (props) => {
  const scale = d3.scaleBand()
    .domain(props.nodes)
    .range([HEAD_WIDTH, getTotalSize(props.nodes.length)])

  const items = props.nodes.map(node =>
    <TopAxisItem
      node={node}
      scale={scale}
      key={node.path}
    />,
  )

  return (
    <g
      className="axisTop"
      transform={`translate(0,${HEAD_WIDTH})`}
    >
      {items}
    </g>
  )
}

TopAxis.propTypes = {
  nodes: React.PropTypes.arrayOf(
    React.PropTypes.instanceOf(Node),
  ).isRequired,
}

export default TopAxis
