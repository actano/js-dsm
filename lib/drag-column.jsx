import React from 'react'
import { handleDragStart, handleDragEnd, EFFECT_LINK, EFFECT_COPY } from './dnd'

export default class DragColumn extends React.PureComponent {
  constructor() {
    super()
    this.state = { dragging: false }
  }

  render() {
    const _handleDragStart = (e) => {
      this.setState({ dragging: true })
      handleDragStart(e, {
        'text/plain': 'test',
        'text/x-test': 'test',
      }, EFFECT_LINK, EFFECT_COPY)
    }

    const _handleDragEnd = (e) => {
      this.setState({ dragging: false })
      const dropEffect = handleDragEnd(e)
      if (dropEffect) {
        console.log('dragend: %s', dropEffect)
      }
    }

    const classes = ['column']
    if (this.state.dragging) {
      classes.push('column--dragging')
    }

    return (
      <div
        className={classes.join(' ')}
        draggable="true"
        onDragStart={_handleDragStart}
        onDragEnd={_handleDragEnd}
      >
        <header>{this.props.title}</header>
        {this.props.children}
      </div>
    )
  }
}

DragColumn.propTypes = {
  title: React.PropTypes.string.isRequired,
}
