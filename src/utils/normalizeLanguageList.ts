import {ILanguageObject} from '../types'
import {LanguageCultures} from '../constants'

type LanguageConfigObject =
  | ILanguageObject
  | (Omit<ILanguageObject, 'id'> & {
      name: string
    })

export const normalizeLanguageList = (languages: (string | LanguageConfigObject)[]) =>
  languages.map<ILanguageObject>((l) => {
    if (typeof l === 'string') {
      const langCult = LanguageCultures.find((x) => x.value === l)
      if (langCult) return {title: langCult.title, id: l}
      return {title: l, id: l}
    }

    if ('name' in l) {
      console.warn(
        `The "name" field in your language configuration is deprecatd, please replace it with "id".`
      )
      return {title: l.title, id: l.name}
    }

    return {title: l.title, id: l.id}
  })
