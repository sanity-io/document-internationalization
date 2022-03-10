import {I18nDelimiter, IdStructure} from '../constants'
import {Ti18nDocument} from '../types'
import {buildDocId} from './buildDocId'
import {getConfig} from './getConfig'
import {getSanityClient} from './getSanityClient'

export const getTranslationsFor = async (
  baseDocumentId: string,
  includeDrafts = false
): Promise<Ti18nDocument[]> => {
  const config = getConfig()
  const client = getSanityClient()
  if (config.idStructure === IdStructure.DELIMITER) {
    const segments = baseDocumentId.split('-')
    segments[segments.length - 1] = `${segments[segments.length - 1]}${I18nDelimiter}*`
    const documents = await client.fetch<Ti18nDocument[]>(
      includeDrafts
        ? '*[_id match $segments]'
        : `*[_id match $segments && !(_id in path('drafts.**'))]`,
      {segments}
    )
    return documents
      ? documents.filter(
          (d) =>
            d._id.startsWith(baseDocumentId) ||
            (includeDrafts && d._id.startsWith(`drafts.${baseDocumentId}`))
        )
      : []
  }
  const documents = await client.fetch<Ti18nDocument[]>(
    includeDrafts ? '*[_id in path($path) || _id in path($draftPath)]' : '*[_id in path($path)]',
    {
      path: buildDocId(baseDocumentId, '*'),
      draftPath: `drafts.${buildDocId(baseDocumentId, '*')}`,
    }
  )
  return documents ?? []
}
