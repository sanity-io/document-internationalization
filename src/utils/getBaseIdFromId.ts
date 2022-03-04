import {I18nPrefix, I18nDelimiter} from '../constants'

export const getBaseIdFromId = (id: string): string => {
  const nonDraftId = id.replace(/^drafts\./, '')

  // subpath
  const rx = new RegExp(`${I18nPrefix}\\.([^.]+)\\.[^.]+`)
  const match = nonDraftId.match(rx)
  if (match && match.length === 2) return match[1]

  // delimiter
  const split = nonDraftId.split(I18nDelimiter)
  if (split.length > 0) return split[0]

  return nonDraftId
}
