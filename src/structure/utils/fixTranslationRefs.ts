import type {SanityDocument} from '@sanity/client'
import _ from 'lodash'
import {ReferenceBehavior} from '../../constants'
import {ITranslationRef} from '../../types'
import {
  batch,
  createSanityReference,
  getBaseIdFromId,
  getConfig,
  getLanguageFromDocument,
  getSanityClient,
} from '../../utils'

export const fixTranslationRefs = async (
  schema: string,
  baseDocuments: SanityDocument[],
  translatedDocuments: SanityDocument[]
): Promise<void> => {
  const sanityClient = getSanityClient()
  const config = getConfig(schema)
  const refsFieldName = config.fieldNames.references
  await batch(baseDocuments, async (chunk) => {
    const transaction = sanityClient.transaction()
    chunk.map(async (d) => {
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
    await transaction.commit()
  })
}
