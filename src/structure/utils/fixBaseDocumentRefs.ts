import type {SanityDocument, Transaction} from '@sanity/client'
import {ReferenceBehavior} from '../../constants'
import {createSanityReference, getBaseIdFromId, getConfig, getSanityClient} from '../../utils'

export const fixBaseDocumentRefs = (
  schema: string,
  translatedDocuments: SanityDocument[]
): Transaction => {
  const config = getConfig(schema)
  const sanityClient = getSanityClient()
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
