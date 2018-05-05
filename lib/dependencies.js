import { parse } from 'esprima'
import Module, { _resolveFilename } from 'module'

export const ERROR_TOO_MANY_ARGUMENTS = 'TOO_MANY_ARGUMENTS'
export const ERROR_ARGUMENT_NOT_LITERAL = 'ARGUMENT_NOT_LITERAL'
export const ERROR_MODULE_NOT_FOUND = 'MODULE_NOT_FOUND'

const isRelative = module => module.startsWith('/') || module.startsWith('./') || module.startsWith('../')

function* walk(module, ast) {
  const range = _range => module.src.substring(_range[0], _range[1]).replace(/\n([\s\S]*)$/, ' …')
  const createError = type => ({ type, filename: module.filename, range: range(ast.range) })

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
      yield createError(ERROR_TOO_MANY_ARGUMENTS)
    }
    const argument = ast.arguments[0]
    if (argument.type !== 'Literal') {
      yield createError(ERROR_ARGUMENT_NOT_LITERAL)
    } else if (isRelative(argument.value)) {
      try {
        yield _resolveFilename(argument.value, module)
      } catch (e) {
        if (e.code === ERROR_MODULE_NOT_FOUND) {
          yield createError(e.code)
        } else {
          throw e
        }
      }
    }
  }
}

export default function* yieldDependencies(filename, contents) {
  const module = new Module(filename, null)
  module.filename = filename
  module.src = String(contents)
  const ast = parse(module.src, { range: true })
  yield* walk(module, ast)
}
