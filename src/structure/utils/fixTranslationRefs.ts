import type {SanityDocument, Transaction} from '@sanity/client'
import _ from 'lodash'
import {ReferenceBehavior} from '../../constants'
import {ITranslationRef} from '../../types'
import {
  createSanityReference,
  getBaseIdFromId,
  getConfig,
  getLanguageFromDocument,
  getSanityClient,
} from '../../utils'

export const fixTranslationRefs = (
  schema: string,
  baseDocuments: SanityDocument[],
  translatedDocuments: SanityDocument[]
): Transaction[] => {
  const sanityClient = getSanityClient()
  const config = getConfig(schema)
  const refsFieldName = config.fieldNames.references
  const transactions = _.chunk(baseDocuments, 50).map((chunk) => {
    const transaction = sanityClient.transaction()
    chunk.forEach((d) => {
      let translatedRefs: ITranslationRef[] = []
      const relevantTranslations = translatedDocuments.filter(
        (dx) => getBaseIdFromId(dx._id) === d._id
      )
      if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
        translatedRefs = _.compact(
          relevantTranslations.map((doc) => {
            const lang = getLanguageFromDocument(doc, config)
            if (!lang) return null
            return {
              _key: lang,
              ...createSanityReference(
                doc._id,
                config.referenceBehavior === ReferenceBehavior.WEAK
              ),
            }
          }, {})
        )
      }
      transaction.patch(d._id, {
        set: {[refsFieldName]: translatedRefs},
      })
    })
    return transaction
  })
  return transactions
}
