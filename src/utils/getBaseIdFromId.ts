import {I18nPrefix, I18nDelimiter} from '../constants'

/*  Generic to support both string -> string & string? -> string? */
export const getBaseIdFromId = <T extends string | undefined>(id?: T): T => {
  if (!id) {
    return undefined as T
  }
  const nonDraftId = id.replace(/^drafts\./, '')

  // subpath
  const rx = new RegExp(`${I18nPrefix}\\.([^.]+)\\.[^.]+`)
  const match = nonDraftId.match(rx)
  if (match && match.length === 2) return match[1] as T

  // delimiter
  const split = nonDraftId.split(I18nDelimiter)
  if (split.length > 0) return split[0] as T

  return nonDraftId as T
}
