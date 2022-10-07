import type {SanityClient, SanityDocument, Transaction} from '@sanity/client'
import type {Reference} from 'sanity'
import type {ApplyConfigResult} from 'src/utils'

export const fixOrphanedDocuments = (
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  basedocuments: SanityDocument[],
  translatedDocuments: SanityDocument[]
): Transaction => {
  const transaction = sanityClient.transaction()
  translatedDocuments.forEach((d) => {
    const base = basedocuments.find(
      (doc) =>
        (Array.isArray(d?.[config.fieldNames.references]) &&
          d?.[config.fieldNames.references]?.some((ref: Reference) => ref._ref === d._id)) ||
        doc._id === d?.[config.fieldNames.baseReference]?._ref
    )
    if (!base) transaction.delete(d._id)
  })
  return transaction
}
