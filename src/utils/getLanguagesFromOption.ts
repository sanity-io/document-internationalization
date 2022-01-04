import get from 'just-safe-get'
import languagesLoaderFn from 'part:sanity-plugin-intl-input/languages/loader?'
import type {SanityDocument} from '@sanity/client'
import {ILanguageObject, TLanguagesOption} from '../types'
import {normalizeLanguageList} from './normalizeLanguageList'
import {getSanityClient} from './getSanityClient'

export const getLanguagesFromOption = async <D extends SanityDocument>(
  langs: TLanguagesOption,
  document?: D | null
): Promise<ILanguageObject[]> => {
  const languages = normalizeLanguageList(
    await (async () => {
      if (Array.isArray(langs)) return langs
      const r = await getSanityClient().fetch(langs.query)
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
  if (languagesLoaderFn) {
    const possiblePromise = languagesLoaderFn(languages, document)
    return possiblePromise
  }
  return languages
}
