import type {SanityDocument} from '@sanity/client'
import chunk from 'just-split'
import {ReferenceBehavior} from '../../constants'
import {
  buildDocId,
  createSanityReference,
  getBaseIdFromId,
  getConfig,
  getLanguageFromDocument,
  getSanityClient,
} from '../../utils'

export const fixIdStructureMismatchDocuments = async (
  schema: string,
  documents: SanityDocument[]
): Promise<void> => {
  const config = getConfig()
  const sanityClient = getSanityClient()
  const refsFieldName = config.fieldNames.references

  // remove old refs
  const existingBaseDocumentIds = new Set(documents.map((d) => getBaseIdFromId(d._id)))
  const removeOldRefsTransaction = sanityClient.transaction()
  existingBaseDocumentIds.forEach((id) => {
    removeOldRefsTransaction.patch(id, {
      set: {[refsFieldName]: []},
    })
  })
  await removeOldRefsTransaction.commit()

  // create new document ids
  await Promise.all(
    chunk(
      documents.filter((d) => d._id !== getBaseIdFromId(d._id)),
      100
    ).map(async (documentsChunk) => {
      const transaction = sanityClient.transaction()
      documentsChunk.forEach((d) => {
        const baseId = getBaseIdFromId(d._id)
        const lang = getLanguageFromDocument(d, config)
        if (lang) {
          const newId = buildDocId(baseId, lang)
          transaction.createIfNotExists({
            ...d,
            _id: newId,
            _type: schema,
          })
          transaction.delete(d._id)

          // patch base document with updated refs
          if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
            transaction.patch(baseId, {setIfMissing: {[refsFieldName]: []}})
            transaction.patch(baseId, {
              insert: {
                after: `${refsFieldName}[-1]`,
                items: [
                  {
                    _key: lang,
                    ...createSanityReference(
                      newId,
                      config.referenceBehavior === ReferenceBehavior.WEAK
                    ),
                  },
                ],
              },
            })
          }
        }
      })
      await transaction.commit()
    })
  )
}
