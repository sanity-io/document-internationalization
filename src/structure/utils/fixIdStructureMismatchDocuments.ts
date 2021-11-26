import {ReferenceBehavior} from '../../constants'
import {Ti18nDocument} from '../../types'
import {
  buildDocId,
  getBaseIdFromId,
  getConfig,
  getLanguageFromId,
  getSanityClient,
} from '../../utils'

export const fixIdStructureMismatchDocuments = async (
  schema: string,
  documents: Ti18nDocument[]
) => {
  const config = getConfig()
  const sanityClient = getSanityClient()
  const refsFieldName = config.fieldNames.references

  // remove old refs
  await Promise.all(
    Array.from(new Set(documents.map((d) => getBaseIdFromId(d._id)))).map(async (id) => {
      await sanityClient
        .patch(id)
        .set({
          [refsFieldName]: [],
        })
        .commit()
    })
  )

  // create new document ids
  await Promise.all(
    documents.map(async (d) => {
      const baseId = getBaseIdFromId(d._id)
      const lang = getLanguageFromId(d._id)
      const newId = buildDocId(baseId, lang)
      const transaction = sanityClient.transaction()
      transaction.createIfNotExists({
        ...d,
        _id: newId,
        _type: schema,
      })
      transaction.delete(d._id)
      await transaction.commit()

      // update base document refsFieldName
      if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
        await sanityClient
          .patch(baseId)
          .setIfMissing({[refsFieldName]: []})
          .append(refsFieldName, [
            {
              _key: newId,
              lang: lang,
              ref: {
                _type: 'reference',
                _ref: newId,
                _weak: config.referenceBehavior === ReferenceBehavior.WEAK,
              },
            },
          ])
          .commit()
      }
    })
  )
}
