import {ILanguageObject} from '../types'

export const getBaseLanguage = (langs: ILanguageObject[], base?: string) => {
  if (base) return langs.find((l) => l.id === base) || null
  return langs.length > 0 ? langs[0] : null
}
