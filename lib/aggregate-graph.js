import { dirname } from 'path'
import { Graph } from 'graphlib'

export default (graph, ids) => {
  const buckets = {}
  for (const bucket of ids) {
    buckets[bucket] = 1
  }

  const bucketOf = (node) => {
    if (buckets[node]) return node
    if (node === '.' || node === '/') return null
    return bucketOf(dirname(node))
  }

  const node2bucket = {}
  for (const node of graph.nodes()) {
    const bucket = bucketOf(node)
    if (bucket === null) throw new Error(`No bucket for node ${node}`)
    node2bucket[node] = bucket
    buckets[bucket] += 1
  }

  const result = new Graph({ directed: graph.isDirected() })
  for (const bucket of Object.keys(buckets)) {
    if (buckets[bucket] > 1) {
      result.setNode(bucket, buckets[bucket] - 1)
    }
  }

  for (const { v, w } of graph.edges()) {
    const vBucket = node2bucket[v]
    const wBucket = node2bucket[w]
    if (vBucket !== wBucket) {
      const label = (result.edge(vBucket, wBucket) || 0) + 1
      result.setEdge(vBucket, wBucket, label)
    }
  }
  return result
}
