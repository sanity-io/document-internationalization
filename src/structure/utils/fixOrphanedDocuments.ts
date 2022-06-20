import {SanityClient} from '@sanity/client'
import {Ti18nDocument} from '../../types'

export function fixOrphanedDocuments(
  sanityClient: SanityClient,
  basedocuments: Ti18nDocument[],
  translatedDocuments: Ti18nDocument[]
): Promise<void[]> {
  return Promise.all(
    translatedDocuments.map(async (d) => {
      const base = basedocuments.find((doc) => d._id.startsWith(doc._id))
      if (!base) await sanityClient.delete(d._id)
    })
  )
}
