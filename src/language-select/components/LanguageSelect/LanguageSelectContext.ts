import {createContext} from 'react'
import {ILanguageObject} from '../../../types'

type ContextValue = {
  currentDocumentId: string | null
  currentDocumentType: string | null
  baseLanguage: ILanguageObject | null
  currentLanguage: ILanguageObject | null
}

export const LanguageSelectContext = createContext<ContextValue>({
  currentDocumentId: null,
  currentDocumentType: null,
  baseLanguage: null,
  currentLanguage: null,
})
