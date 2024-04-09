import type {SanityDocument} from 'sanity'

import {METADATA_SCHEMA_NAME} from '../../constants'

export function separateReferences(data: SanityDocument[] | null = []): {
  translations: SanityDocument[]
  otherReferences: SanityDocument[]
} {
  const translations: SanityDocument[] = []
  const otherReferences: SanityDocument[] = []

  if (data && data.length > 0) {
    data.forEach((doc) => {
      if (doc._type === METADATA_SCHEMA_NAME) {
        translations.push(doc)
      } else {
        otherReferences.push(doc)
      }
    })
  }

  return {translations, otherReferences}
}
