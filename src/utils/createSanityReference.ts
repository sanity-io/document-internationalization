export function createSanityReference(id: string, weak = false) {
  return {
    _type: 'reference' as const,
    _ref: id,
    ...(weak === true ? {_weak: true} : {}),
  }
}
