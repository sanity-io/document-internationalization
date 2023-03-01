import type {ILanguageObject} from './ILanguageObject'

export interface IExtendedLanguageObject extends ILanguageObject {
  isCurrentLanguage?: boolean
  isBase?: boolean
}
