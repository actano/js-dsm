import * as d3 from 'd3'
import React from 'react'
import { getTotalSize, HEAD_WIDTH } from '../../util/layout'
import LeftAxisItem from './left-axis-item'
import Node from '../../node'

const LeftAxis = (props) => {
  const scale = d3.scaleBand()
    .domain(props.nodes)
    .range([HEAD_WIDTH, getTotalSize(props.nodes.length)])
  const items = props.nodes.map(node =>
    <LeftAxisItem
      node={node}
      scale={scale}
      key={node.path}
      triggerRender={props.triggerRender}
    />,
  )
  return (
    <g
      className="axisLeft"
      transform={`translate(${HEAD_WIDTH - 14},0)`}
    >
      {items}
    </g>
  )
}

LeftAxis.propTypes = {
  nodes: React.PropTypes.arrayOf(
    React.PropTypes.instanceOf(Node),
  ).isRequired,
  triggerRender: React.PropTypes.func.isRequired,
}

export default LeftAxis
