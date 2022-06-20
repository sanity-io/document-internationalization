import {Path, isKeyedObject} from 'sanity'

export function serializePath(path: Path): string {
  return path.reduce<string>((target, part, i) => {
    const isIndex = typeof part === 'number'
    const isKey = isKeyedObject(part)
    const separator = i === 0 ? '' : '.'
    const add = isIndex || isKey ? '[]' : `${separator}${part}`
    return `${target}${add}`
  }, '')
}
