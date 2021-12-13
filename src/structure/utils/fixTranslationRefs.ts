import {ReferenceBehavior} from '../../constants'
import {ITranslationRef, Ti18nDocument} from '../../types'
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
      const relevantTranslations = translatedDocuments.filter(
        (dx) => getBaseIdFromId(dx._id) === d._id
      )
      const existingRefs = (d[refsFieldName] ?? []) as ITranslationRef[]
      const hasInvalidRefs =
        existingRefs.length !== relevantTranslations.length || // has more or less refs
        !relevantTranslations.every((doc) => existingRefs.find(({ref}) => ref._ref === doc._id)) // not all translations appear in the current refs array

      if (hasInvalidRefs) {
        const refs =
          config.referenceBehavior === ReferenceBehavior.DISABLED
            ? []
            : relevantTranslations.map((doc) => {
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

        await sanityClient
          .patch(d._id, {
            set: {
              [refsFieldName]: refs,
            },
          })
          .commit()
      }
    })
  )
}
