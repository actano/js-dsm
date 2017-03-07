import React from 'react'
import Node from '../../node'

const getFill = (cell, x, y, redScale, greenScale) => {
  const deps = cell.deps
  if (x === y) {
    return 'rgb(128, 128, 128)'
  }

  if (deps === 0) {
    if (cell.isScc) {
      return 'rgb(230, 184, 0)'
    }
    return 'none'
  }
  if (y > x) {
    return greenScale(deps)
  }
  return redScale(deps)
}

const DsmCell = (props) => {
  const fill = getFill(
    props.matrixCell,
    props.x,
    props.y,
    props.redScale,
    props.greenScale,
  )

  return (
    <g
      transform={`translate(${props.scale(props.node)},0)`}
    >
      <rect
        width={props.scale.bandwidth()}
        height={props.scale.bandwidth()}
        fill={fill}
      />
      <text
        transform={`translate(${props.scale.step() / 2},${props.scale.step() / 2})`}
        x={0.5}
        y={0.5}
        dy="0.2em"
      >
        {props.matrixCell.deps || ''}
      </text>
    </g>
  )
}

DsmCell.propTypes = {
  scale: React.PropTypes.func.isRequired,
  node: React.PropTypes.instanceOf(Node).isRequired,
  matrixCell: React.PropTypes.shape({
    deps: React.PropTypes.number,
    isScc: React.PropTypes.bool,
  }).isRequired,
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired,
  redScale: React.PropTypes.func.isRequired,
  greenScale: React.PropTypes.func.isRequired,
}

export default DsmCell
