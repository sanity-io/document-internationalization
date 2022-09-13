import {SanityDocumentLike} from 'sanity'

export type Language = {
  id: string
  title: string
}

export type PluginConfig = {
  supportedLanguages: Language[]
  schemaTypes: string[]
  languageField?: string
}

export type TranslationReference = {
  _key: string
  value?: {
    _ref: string
    _type: 'reference'
  }
}

export type Metadata = SanityDocumentLike & {
  translations: TranslationReference[]
}
