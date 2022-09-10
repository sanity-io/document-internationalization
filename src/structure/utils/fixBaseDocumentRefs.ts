import type {SanityDocument} from '@sanity/client'
import {ReferenceBehavior} from '../../constants'
import {createSanityReference, getBaseIdFromId, getConfig, getSanityClient} from '../../utils'

export const fixBaseDocumentRefs = async (
  schema: string,
  translatedDocuments: SanityDocument[]
): Promise<void> => {
  const config = getConfig(schema)
  const sanityClient = getSanityClient()

  if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
    const baseRefFieldName = config.fieldNames.baseReference
    const transaction = sanityClient.transaction()
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
    await transaction.commit()
  }
}
