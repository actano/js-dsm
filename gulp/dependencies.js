import esprima from 'esprima'
import Module, { _resolveFilename } from 'module'

import { log, colors } from 'gulp-util'

const { red, gray } = colors

const isRelative = module => module.startsWith('/') || module.startsWith('./') || module.startsWith('../')

export function* walk(module, ast) {
  const range = _range => module.src.substring(_range[0], _range[1]).replace(/\n([\s\S]*)$/, ' …')

  if (!ast) return
  if (Array.isArray(ast)) {
    for (const sub of ast) {
      yield* walk(module, sub)
    }
    return
  }
  if (typeof ast !== 'object') return
  for (const sub of Object.values(ast)) {
    yield* walk(module, sub)
  }
  if (((ast.type === 'CallExpression') || (ast.type === 'NewExpression')) &&
    (ast.callee.type === 'Identifier') &&
    (ast.callee.name === 'require')) {
    if (ast.arguments.length !== 1) {
      log('%s: Expected only one argument: %s', red(module.filename), gray(range(ast.range)))
    }
    const argument = ast.arguments[0]
    if (argument.type !== 'Literal') {
      log('%s: Expected literal argument: %s', red(module.filename), gray(range(ast.range)))
    } else if (isRelative(argument.value)) {
      try {
        yield _resolveFilename(argument.value, module)
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          log('%s: Cannot resolve: %s', red(module.filename), gray(range(ast.range)))
        } else {
          throw e
        }
      }
    }
  }
}

export function* parse(filename, contents) {
  const module = new Module(filename, null)
  module.filename = filename
  module.src = String(contents)
  try {
    const ast = esprima.parse(module.src, { range: true })
    yield* walk(module, ast)
  } catch (e) {
    log('cannot parse %s: %s', red(module.filename), e.toString())
  }
}

