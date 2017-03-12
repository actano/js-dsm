export default (graph) => {
  const selection = {}
  for (const id of graph.nodes()) {
    selection[id.split('/').splice(0, 2).join('/')] = true
  }
  return Object.keys(selection)
}
