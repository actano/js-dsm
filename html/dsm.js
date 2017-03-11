import { alg as graphAlg } from 'graphlib'
import flatMap from 'lodash/flatMap'
import _sortBy from 'lodash/sortBy'
import flow from 'lodash/flow'
import { graphFromAdjacency, condense } from './graph'

const sortBy = iteratees => collection => _sortBy(collection, iteratees)

const deps = (fromNode, toNode) => {
  if (fromNode === toNode) return NaN
  let result = 0
  for (const dep of fromNode.allDependencies()) {
    if (dep.isChildOf(toNode)) result += 1
  }
  return result
}

export default function createLowerLeftDsm(nodes) {
  const dependencyMatrix = nodes.map(y => nodes.map(x => deps(x, y)))
  const dependencyGraph = graphFromAdjacency(dependencyMatrix, nodes.map(x => x.toString()))
  const { condensedGraph, condensationToGraph, sccs } = condense(dependencyGraph)
  const condensedOrder = graphAlg.topsort(condensedGraph)
  const orderedClusters = condensedOrder.map(x => condensationToGraph[x])
  const isMemberOf = array => candidate => array.indexOf(candidate) >= 0
  const contains = candidate => array => array.indexOf(candidate) >= 0
  const orderedClustersWithCounts = orderedClusters.map(cluster => cluster.map(nodeId => ({
    id: nodeId,
    inCount: dependencyGraph
      .predecessors(nodeId)
      .filter(isMemberOf(cluster))
      .length,
    outCount: dependencyGraph
      .successors(nodeId)
      .filter(isMemberOf(cluster))
      .length,
  })))
  const decreasingOutCount = i => -i.outCount
  const inCount = i => i.inCount
  const sortToLowerLeft = sortBy([inCount, decreasingOutCount])
  const order = flatMap(orderedClustersWithCounts, flow(
    sortToLowerLeft,
    cluster => cluster.map(i => i.id),
  ))
  const sccOfNode = node => sccs.find(contains(node.toString()))

  const sortedNodes = sortBy(node => order.indexOf(node.toString()))(nodes)
  const matrix = sortedNodes.map((y) => {
    const sccOfY = sccOfNode(y)

    return sortedNodes.map((x) => {
      const isScc = sccOfY.length > 1 && sccOfNode(x) === sccOfY
      return {
        deps: deps(x, y),
        isScc,
      }
    })
  })

  return {
    matrix,
    dsmNodes: sortedNodes,
  }
}
