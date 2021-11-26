export function makeObjectKey(input: string) {
  return input.replace(/[^a-zA-Z0-9_]/g, '_')
}
