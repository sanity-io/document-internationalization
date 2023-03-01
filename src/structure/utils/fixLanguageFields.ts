import type {SanityClient, SanityDocument, Transaction} from '@sanity/client'
import type {Schema} from 'sanity'
import {Ti18nSchema} from '../../types'
import {ApplyConfigResult, getLanguageFromId} from '../../utils'

export const fixLanguageFields = (
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  schemaRegistry: Schema,
  documents: SanityDocument[]
): Transaction => {
  const langFieldName = config.fieldNames?.lang
  const transaction = sanityClient.transaction()

  documents.forEach((d) => {
    const schemaObject = schemaRegistry.get(d._type) as Ti18nSchema
    const base =
      (typeof schemaObject.i18n === 'object' ? schemaObject.i18n.base : undefined) || config.base
    if (!d[langFieldName]) {
      // @README keep the language from ID behavior
      // because in this case we expect the language field not to be available
      const language = getLanguageFromId(d._id) || base
      transaction.patch(d._id, {
        set: {
          [langFieldName]: language,
        },
      })
    }
  })

  return transaction
}
