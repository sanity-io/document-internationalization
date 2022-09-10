import type {SanityDocument, Transaction} from '@sanity/client'
import {Ti18nSchema} from '../../types'
import {getConfig, getLanguageFromId, getSanityClient, getSchema} from '../../utils'

export const fixLanguageFields = (schema: string, documents: SanityDocument[]): Transaction => {
  const sanityClient = getSanityClient()
  const config = getConfig(schema)
  const langFieldName = config.fieldNames?.lang
  const transaction = sanityClient.transaction()

  documents.forEach((d) => {
    const schemaObject = getSchema<Ti18nSchema>(d._type)
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
