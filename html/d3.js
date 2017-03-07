import 'babel-polyfill'
import * as d3 from 'd3' // eslint-disable-line import/no-unresolved, import/extensions
import { dirname } from 'path'
import ReactDOM from 'react-dom'
import App from './components/app'
import Node from './node'

const parse = (data) => {
  const nodes = {}

  const buildPath = (path) => {
    if (!nodes[path]) {
      const node = new Node(path)
      nodes[path] = node
      node.parent = path === '/' ? null : buildPath(dirname(path))
      if (node.parent) {
        node.parent.children.push(node)
      }
    }
    return nodes[path]
  }

  for (const filename of Object.keys(data.files)) {
    const file = data.files[filename]
    const node = buildPath(filename)
    for (const dependency of Object.keys(file.children)) {
      node.dependOn(buildPath(dependency))
    }
  }

  const cycles = data.cycles.map(cycle => cycle.map(buildPath))

  let root = nodes['/']
  while (root.children.length === 1) {
    root = root.children[0]
  }

  root.parent = null
  root.name = ''

  return { root, cycles }
}

d3.json('dependencies.json', (error, data) => {
  if (error) {
    throw error
  }
  const parsed = parse(data)

  const renderApp = () => {
    ReactDOM.render(
      App({ root: parsed.root, triggerRender: renderApp }),
      document.querySelector('#container'),
    )
  }

  renderApp()
})
