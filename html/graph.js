import assert from 'assert'
import { Graph, json as graphJson, alg as graphAlg } from 'graphlib'
import sortBy from 'lodash/sortBy'

export function graphFromAdjacency(matrix, ids) {
  assert(matrix.length === ids.length, 'mismatch between matrix and ids')

  const graph = new Graph({ directed: true })
  ids.forEach((id) => { graph.setNode(id) })

  matrix.forEach((row, toIndex) => {
    row
      .forEach((col, fromIndex) => {
        if (col > 0) {
          graph.setEdge(ids[fromIndex], ids[toIndex])
        }
      })
  })

  return graph
}

function getCanonicalId(array) {
  const sortedArray = sortBy(array)
  return sortedArray.join()
}

const edgeToCondensation = graphToCondensation => ({ v, w }) => ({
  v: graphToCondensation[v],
  w: graphToCondensation[w],
})

const isNoLoop = ({ v, w }) => v !== w

export function condense(graph) {
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

export function toJson(graph) {
  return graphJson.write(graph)
}
