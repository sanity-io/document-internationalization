import {SanityDocument} from '@sanity/client'
import {I18nDelimiter, IdStructure} from '../constants'
import {buildDocId} from './buildDocId'
import {getConfig} from './getConfig'
import {getSanityClient} from './getSanityClient'

export const getTranslationsFor = async (baseDocumentId: string) => {
  const config = getConfig()
  const client = getSanityClient()
  if (config.idStructure === IdStructure.DELIMITER) {
    const segments = baseDocumentId.split('-')
    segments[segments.length - 1] = `${segments[segments.length - 1]}${I18nDelimiter}*`
    const documents = await client.fetch<SanityDocument[]>('*[_id match $segments]', {segments})
    return documents ? documents.filter((d) => d._id.startsWith(baseDocumentId)) : []
  }
  const documents = await client.fetch<SanityDocument[]>('*[_id in path($path)]', {
    path: buildDocId(baseDocumentId, '*'),
  })
  return documents ?? []
}
