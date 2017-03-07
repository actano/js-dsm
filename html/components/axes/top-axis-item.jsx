import React from 'react'
import Node from '../../node'

const TopAxisItem = (props) => {
  const nodePath = props.node.path !== '' ? props.node.path : '/'

  return (
    <g
      transform={`translate(${props.scale(props.node) + (props.scale.step() / 2)},0)`}
    >
      <text
        dx="0.5em"
        transform="rotate(-90)"
      >
        {nodePath}
      </text>
    </g>
  )
}

TopAxisItem.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired,
  scale: React.PropTypes.func.isRequired,
}

export default TopAxisItem
