import type {SanityDocument} from '@sanity/client'
import type {Reference} from '@sanity/types'
import {getConfig, getSanityClient} from '../../utils'

export const fixOrphanedDocuments = async (
  basedocuments: SanityDocument[],
  translatedDocuments: SanityDocument[]
): Promise<void> => {
  const sanityClient = getSanityClient()
  const transaction = sanityClient.transaction()
  translatedDocuments.forEach((d) => {
    const config = getConfig(d._type)
    const base = basedocuments.find(
      (doc) =>
        (Array.isArray(d?.[config.fieldNames.references]) &&
          d?.[config.fieldNames.references]?.some((ref: Reference) => ref._ref === d._id)) ||
        doc._id === d?.[config.fieldNames.baseReference]?._ref
    )
    if (!base) transaction.delete(d._id)
  })
  await transaction.commit()
}
