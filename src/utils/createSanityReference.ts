import {Reference} from 'sanity'

type Ref = Omit<Reference, '_type'> & {_type: 'reference'}

export function createSanityReference(id: string, weak = false): Ref {
  return {
    _type: 'reference' as const,
    _ref: id.replace(`drafts.`, ``),
    ...(weak === true ? {_weak: true} : {}),
  }
}
