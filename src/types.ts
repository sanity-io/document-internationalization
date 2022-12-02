import type {SanityDocumentLike} from 'sanity'

export type Language = {
  id: string
  title: string
}

export type SupportedLanguagesConfig = Language[] | (() => Promise<Language[]>)

export type PluginConfig = {
  supportedLanguages: SupportedLanguagesConfig
  schemaTypes: string[]
  languageField?: string
  bulkPublish?: boolean
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
