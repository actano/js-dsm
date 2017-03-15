import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import DragColumn from '../lib/drag-column'
import DropColumn from '../lib/drop-column'

const sample = () => (
  <div>
    <h1>Drag Side</h1>
    <DragColumn title="A" />
    <DragColumn title="B" />
    <DragColumn title="C" />
    <h1>Drop Side</h1>
    <DropColumn title="A" />
    <DropColumn title="B" />
    <DropColumn title="C" />
  </div>
)

ReactDOM.render(sample(), document.getElementById('dnd'))
