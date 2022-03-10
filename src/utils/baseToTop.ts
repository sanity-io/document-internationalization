import type {IExtendedLanguageObject} from '../types'

export const baseToTop = (a: IExtendedLanguageObject, b: IExtendedLanguageObject): number => {
  return Number(a.isBase ?? 0) - Number(b.isBase ?? 0)
}
