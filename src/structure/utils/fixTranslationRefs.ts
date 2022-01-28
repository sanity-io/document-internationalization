import _ from 'lodash'
import {ReferenceBehavior} from '../../constants'
import {ITranslationRef, Ti18nDocument} from '../../types'
import {
  batch,
  createSanityReference,
  getBaseIdFromId,
  getConfig,
  getLanguageFromId,
  getSanityClient,
} from '../../utils'

export const fixTranslationRefs = async (
  schema: string,
  baseDocuments: Ti18nDocument[],
  translatedDocuments: Ti18nDocument[]
) => {
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
            const lang = getLanguageFromId(doc._id)
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
