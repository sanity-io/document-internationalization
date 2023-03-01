import chunk from 'lodash/chunk'
import compact from 'lodash/compact'
import {SanityClient, Transaction, SanityDocument} from '@sanity/client'
import type {Reference} from 'sanity'
import {ReferenceBehavior} from '../../constants'
import {
  ApplyConfigResult,
  createSanityReference,
  getBaseIdFromId,
  getLanguageFromDocument,
} from '../../utils'

export const fixTranslationRefs = (
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  baseDocuments: SanityDocument[],
  translatedDocuments: SanityDocument[]
  // eslint-disable-next-line max-params
): Transaction[] => {
  const refsFieldName = config.fieldNames.references
  const transactions = chunk(baseDocuments, 50).map((documentsChunk) => {
    const transaction = sanityClient.transaction()
    documentsChunk.forEach((d) => {
      let translatedRefs: Reference[] = []
      const relevantTranslations = translatedDocuments.filter(
        (dx) => getBaseIdFromId(dx._id) === d._id
      )
      if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
        translatedRefs = compact(
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
