import {TranslationReference} from '../types'

export function createReference(
  key: string,
  ref: string,
  type: string
): TranslationReference {
  return {
    _key: key,
    _type: 'internationalizedArrayReferenceValue',
    value: {
      _type: 'reference',
      _ref: ref,
      _weak: true,
      _strengthenOnPublish: {
        type,
      },
    },
  }
}
