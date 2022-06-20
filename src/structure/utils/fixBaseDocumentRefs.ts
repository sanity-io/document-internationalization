import {SanityClient} from '@sanity/client'
import {ReferenceBehavior} from '../../constants'
import {Ti18nDocument} from '../../types'
import {ApplyConfigResult, createSanityReference, getBaseIdFromId} from '../../utils'

export const fixBaseDocumentRefs = async (
  sanityClient: SanityClient,
  config: ApplyConfigResult,
  translatedDocuments: Ti18nDocument[]
): Promise<void> => {
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
