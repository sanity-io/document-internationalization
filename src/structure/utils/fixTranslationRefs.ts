import compact from 'lodash/compact'
import {SanityClient} from '@sanity/client'
import {ReferenceBehavior} from '../../constants'
import {ITranslationRef, Ti18nDocument} from '../../types'
import {
  ApplyConfigResult,
  batch,
  createSanityReference,
  getBaseIdFromId,
  getLanguageFromDocument,
} from '../../utils'

export const fixTranslationRefs = (
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  baseDocuments: Ti18nDocument[],
  translatedDocuments: Ti18nDocument[]
  // eslint-disable-next-line max-params
): Promise<void> => {
  const refsFieldName = config.fieldNames.references
  return batch(baseDocuments, async (chunk) => {
    const transaction = sanityClient.transaction()
    chunk.forEach((d) => {
      let translatedRefs: ITranslationRef[] = []
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
    await transaction.commit()
  })
}
