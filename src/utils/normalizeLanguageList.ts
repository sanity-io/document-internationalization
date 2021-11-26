import {ILanguageObject} from '../types'
import {LanguageCultures} from '../constants'

export const normalizeLanguageList = (languages: (string | ILanguageObject)[]) =>
  languages.map((l) => {
    if (typeof l === 'string') {
      const langCult = LanguageCultures.find((x) => x.value === l)
      if (langCult) return {title: langCult.title, name: l}
      return {title: l, name: l}
    }
    return l
  })
