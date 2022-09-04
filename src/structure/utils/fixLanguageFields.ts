import {SanityClient} from '@sanity/client'
import type {Schema} from 'sanity'
import {Ti18nDocument, Ti18nSchema} from '../../types'
import {ApplyConfigResult, getLanguageFromId} from '../../utils'

export function fixLanguageFields(
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  schemaRegistry: Schema,
  documents: Ti18nDocument[]
): Promise<void[]> {
  const langFieldName = config.fieldNames?.lang
  return Promise.all(
    documents.map(async (d) => {
      const schemaObject = schemaRegistry.get(d._type) as Ti18nSchema
      const base =
        (typeof schemaObject.i18n === 'object' ? schemaObject.i18n.base : undefined) || config.base
      if (!d[langFieldName]) {
        // @README keep the language from ID behavior
        // because in this case we expect the language field not to be available
        const language = getLanguageFromId(d._id) || base
        await sanityClient
          .patch(d._id, {
            set: {
              [langFieldName]: language,
            },
          })
          .commit()
      }
    })
  )
}
