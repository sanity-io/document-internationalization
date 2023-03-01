import type {SanityDocument, SanityClient, Transaction} from '@sanity/client'
import {ReferenceBehavior} from '../../constants'
import {ApplyConfigResult, createSanityReference, getBaseIdFromId} from '../../utils'

export const fixBaseDocumentRefs = (
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  translatedDocuments: SanityDocument[]
): Transaction => {
  const transaction = sanityClient.transaction()

  if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
    const baseRefFieldName = config.fieldNames.baseReference
    translatedDocuments.forEach((d) => {
      if (!d[baseRefFieldName]) {
        const baseId = getBaseIdFromId(d._id)
        transaction.patch(d._id, {
          set: {
            [baseRefFieldName]: createSanityReference(
              baseId,
              config.referenceBehavior === ReferenceBehavior.WEAK
            ),
          },
        })
      }
    })
  }

  return transaction
}
