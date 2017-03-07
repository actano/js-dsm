import { basename } from 'path'

class Node {
  constructor(path) {
    this.parent = null
    this.name = basename(path)
    this.children = []
    this.dependencies = []
    this.reverseDependencies = []
    this.expanded = false
  }

  get path() {
    return this.parent ? `${this.parent.path}/${this.name}` : this.name
  }

  dependOn(node) {
    this.dependencies.push(node)
    node.reverseDependencies.push(this)
  }

  * allDependencies() {
    yield* this.dependencies
    for (const child of this.children) {
      yield* child.allDependencies()
    }
  }

  cachedDeps() {
    if (!this._deps) {
      this._deps = Array.from(this.allDependencies())
    }

    return this._deps
  }

  isChildOf(node) {
    if (this === node) return true
    if (this.parent === null) return false
    return this.parent.isChildOf(node)
  }

  toString() {
    return `${this.path}`
  }
}

export default Node
