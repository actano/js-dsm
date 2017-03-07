import React from 'react'
import { reject, flow, take, flatMap } from 'lodash/fp'
import LeftAxis from './axes/left-axis'
import TopAxis from './axes/top-axis'
import { getTotalSize } from '../util/layout'
import Node from '../node'
import createLowerLeftDsm from '../dsm'
import Dsm from './dsm/dsm'

function collectLeafs(node) {
  if (node.children.length && node.expanded) {
    return flatMap(collectLeafs, node.children)
  }

  return [node]
}

const isTestFile = node => /^.*\/test\/.*$/.test(node.path)

const App = (props) => {
  const nodesToRender = flow(
    collectLeafs,
    reject(isTestFile),
    take(500),
  )(props.root)

  const totalSize = getTotalSize(nodesToRender.length)
  const dsm = createLowerLeftDsm(nodesToRender)

  return (
    <svg
      width={totalSize}
      height={totalSize}
      className="chart"
    >
      <LeftAxis nodes={dsm.dsmNodes} triggerRender={props.triggerRender} />
      <TopAxis nodes={dsm.dsmNodes} />
      <Dsm data={dsm} />
    </svg>
  )
}

App.propTypes = {
  root: React.PropTypes.instanceOf(Node).isRequired,
  triggerRender: React.PropTypes.func.isRequired,
}

export default App
