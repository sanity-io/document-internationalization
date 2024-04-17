import type {TranslationReference} from '../types'

export function createReference(
  key: string,
  ref: string,
  type: string,
  strengthenOnPublish: boolean = true
): TranslationReference {
  return {
    _key: key,
    _type: 'internationalizedArrayReferenceValue',
    value: {
      _type: 'reference',
      _ref: ref,
      _weak: true,
      // If the user has configured weakReferences, we won't want to strengthen them
      ...(strengthenOnPublish ? {_strengthenOnPublish: {type}} : {}),
    },
  }
}
