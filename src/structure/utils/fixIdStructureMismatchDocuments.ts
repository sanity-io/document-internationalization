import type {SanityDocument, Transaction} from '@sanity/client'
import chunk from 'just-split'
import {SanityClient} from '@sanity/client'
import {ReferenceBehavior} from '../../constants'
import {
  ApplyConfigResult,
  buildDocId,
  createSanityReference,
  getBaseIdFromId,
  getLanguageFromDocument,
} from '../../utils'

export const fixIdStructureMismatchDocuments = (
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  schema: string,
  documents: SanityDocument[]
): Transaction[] => {
  const refsFieldName = config.fieldNames.references

  // remove old refs
  const existingBaseDocumentIds = new Set(documents.map((d) => getBaseIdFromId(d._id)))
  const removeOldRefsTransaction = sanityClient.transaction()
  existingBaseDocumentIds.forEach((id) => {
    removeOldRefsTransaction.patch(id, {
      set: {[refsFieldName]: []},
    })
  })

  // create new document ids
  const newDocumentTransactions = chunk(
    documents.filter((d) => d._id !== getBaseIdFromId(d._id)),
    100
  ).map((documentsChunk) => {
    const transaction = sanityClient.transaction()
    documentsChunk.forEach((d) => {
      const baseId = getBaseIdFromId(d._id)
      const lang = getLanguageFromDocument(d, config)
      if (lang) {
        const newId = buildDocId(config, baseId, lang)
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
    return transaction
  })

  return [removeOldRefsTransaction, ...newDocumentTransactions]
}
