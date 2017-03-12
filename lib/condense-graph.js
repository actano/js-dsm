import { Graph, alg as graphAlg } from 'graphlib'
import sortBy from 'lodash/sortBy'

function getCanonicalId(array) {
  const sortedArray = sortBy(array)
  return sortedArray.join()
}

const edgeToCondensation = graphToCondensation => ({ v, w }) => ({
  v: graphToCondensation[v],
  w: graphToCondensation[w],
})

const isNoLoop = ({ v, w }) => v !== w

export default (graph) => {
  const sccs = graphAlg.tarjan(graph)
  const condensedGraph = new Graph({ directed: true })
  const graphToCondensation = {}
  const condensationToGraph = {}

  sccs.forEach((scc) => {
    const canonicalId = getCanonicalId(scc)
    scc.forEach((x) => { graphToCondensation[x] = canonicalId })
    condensationToGraph[canonicalId] = scc
    condensedGraph.setNode(canonicalId)
  })

  graph
    .edges()
    .map(edgeToCondensation(graphToCondensation))
    .filter(isNoLoop)
    .forEach((edge) => {
      condensedGraph.setEdge(edge)
    })

  return {
    condensedGraph,
    graphToCondensation,
    condensationToGraph,
    sccs,
  }
}
