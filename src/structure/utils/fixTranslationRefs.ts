import {ReferenceBehavior} from '../../constants'
import {Ti18nDocument} from '../../types'
import {
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
  await Promise.all(
    baseDocuments.map(async (d) => {
      const docs = translatedDocuments.filter((dx) => getBaseIdFromId(dx._id) === d._id)
      const refsCount = Object.keys(d[refsFieldName] || {}).length
      await sanityClient
        .patch(d._id, {
          set: {
            [refsFieldName]:
              refsCount != docs.length && config.referenceBehavior !== ReferenceBehavior.DISABLED
                ? translatedDocuments.map((doc) => {
                    const lang = getLanguageFromId(doc._id)
                    return {
                      _key: doc._id,
                      lang,
                      ref: createSanityReference(
                        doc._id,
                        config.referenceBehavior === ReferenceBehavior.WEAK
                      ),
                    }
                  }, {})
                : [],
          },
        })
        .commit()
    })
  )
}
