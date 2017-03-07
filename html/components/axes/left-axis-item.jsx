import React from 'react'
import Node from '../../node'

const toggleNode = (node, render) => () => {
  node.expanded = !node.expanded
  render()
}

const canBeExpanded = node => !node.expanded && node.children.length

const LeftAxisItem = (props) => {
  const nodePath = props.node.path !== '' ? props.node.path : '/'
  const fillOpacity = canBeExpanded(props.node) ? 1 : 0

  return (
    <g
      transform={`translate(0,${props.scale(props.node) + (props.scale.step() / 2)})`}
    >
      <text
        dx="-0.5em"
      >
        {nodePath}
      </text>
      <rect
        width={10}
        height={10}
        y={-5}
        fillOpacity={fillOpacity}
        stroke="black"
        strokeWidth={1}
        onClick={toggleNode(props.node, props.triggerRender)}
      />
    </g>
  )
}

LeftAxisItem.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired,
  scale: React.PropTypes.func.isRequired,
  triggerRender: React.PropTypes.func.isRequired,
}

export default LeftAxisItem
