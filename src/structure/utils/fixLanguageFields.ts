import {Ti18nDocument, Ti18nSchema} from '../../types'
import {getConfig, getLanguageFromId, getSanityClient, getSchema} from '../../utils'

export const fixLanguageFields = async (schema: string, documents: Ti18nDocument[]) => {
  const sanityClient = getSanityClient()
  const config = getConfig(schema)
  const langFieldName = config.fieldNames?.lang
  await Promise.all(
    documents.map(async (d) => {
      const schemaObject = getSchema<Ti18nSchema>(d._type)
      const base =
        (typeof schemaObject.i18n === 'object' ? schemaObject.i18n.base : undefined) || config.base
      if (!d[langFieldName]) {
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
