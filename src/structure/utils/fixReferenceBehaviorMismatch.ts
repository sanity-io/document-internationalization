import _ from 'lodash'
import {ReferenceBehavior} from '../../constants'
import {ITranslationRef, Ti18nDocument} from '../../types'
import {createSanityReference, getConfig, getLanguageFromId, getSanityClient} from '../../utils'

export const fixReferenceBehaviorMismatch = async (
  schema: string,
  baseDocuments: Ti18nDocument[],
  translatedDocuments: Ti18nDocument[]
) => {
  const sanityClient = getSanityClient()
  const config = getConfig(schema)
  const refsFieldName = config.fieldNames.references
  await Promise.all(
    baseDocuments.map(async (d) => {
      let translatedRefs: ITranslationRef[] = []
      if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
        translatedRefs = _.compact(
          translatedDocuments.map((doc) => {
            const lang = getLanguageFromId(doc._id)
            if (!lang) return null
            return {
              _key: doc._id,
              lang,
              ref: createSanityReference(
                doc._id,
                config.referenceBehavior === ReferenceBehavior.WEAK
              ),
            }
          }, {})
        )
      }

      await sanityClient
        .patch(d._id, {
          set: {
            [refsFieldName]: translatedRefs,
          },
        })
        .commit()
    })
  )
}
