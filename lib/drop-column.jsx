import React from 'react'
import { EFFECT_LINK, EFFECT_COPY, handleDragOver, handleDragEnter, handleDragLeave, handleDrop } from './dnd'

export default class DropColumn extends React.PureComponent {
  constructor() {
    super()
    this.state = { dropEffect: null }
  }

  render() {
    const _handleDragOver = (e) => {
      const dropEffect = handleDragOver(e, EFFECT_LINK, EFFECT_COPY)
      this.setState({ dropEffect })
    }

    const _handleDragEnter = (e) => {
      const dropEffect = handleDragEnter(e, EFFECT_LINK, EFFECT_COPY)
      this.setState({ dropEffect })
    }

    const _handleDragLeave = () => {
      handleDragLeave()
      this.setState({ dropEffect: null })
    }

    const _handleDrop = (e) => {
      const dndEffect = handleDrop(e, EFFECT_LINK, EFFECT_COPY)
      const dropEffect = this.state.dropEffect || dndEffect
      this.setState({ dropEffect: null })
      if (!dropEffect) return
      console.log('drop: %s', dropEffect)
    }

    const classNames = ['column']
    if (this.state.dropEffect) {
      classNames.push('column--over')
    }

    return (
      <div
        className={classNames.join(' ')}
        onDragEnter={_handleDragEnter}
        onDragOver={_handleDragOver}
        onDragLeave={_handleDragLeave}
        onDrop={_handleDrop}
      >
        <header>{this.props.title}</header>
        {this.props.children}
      </div>
    )
  }
}

DropColumn.propTypes = {
  title: React.PropTypes.string.isRequired,
}
