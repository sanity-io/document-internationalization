import get from 'just-safe-get'
import type {SanityClient, SanityDocument} from '@sanity/client'
import {ILanguageObject, ILanguageQuery, TLanguagesOption} from '../types'
import type {ApplyConfigResult} from '../utils'
import {normalizeLanguageList} from './normalizeLanguageList'

export const getLanguagesFromOption = async <D extends SanityDocument>(
  client: SanityClient,
  config: ApplyConfigResult,
  langs: TLanguagesOption,
  document?: D | null
): Promise<ILanguageObject[]> => {
  const languages = normalizeLanguageList(
    await (async () => {
      if (Array.isArray(langs)) return langs
      const r = await client.fetch<ILanguageQuery['value'][]>(langs.query)
      const value = langs.value

      if (typeof value === 'string') return r.map((l) => get(l, value))
      return r.map((l) => {
        // @deprecated
        if ('name' in value) {
          return {
            name: get(l, value.name),
            title: get(l, value.title),
          }
        }

        return {
          id: get(l, value.id),
          title: get(l, value.title),
        }
      })
    })()
  )
  if (config.languagesLoader) {
    return config.languagesLoader(languages, document ?? undefined)
  }
  return languages
}
