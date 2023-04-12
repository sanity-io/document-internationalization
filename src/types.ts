import type {SanityClient, SanityDocumentLike} from 'sanity'

export type Language = {
  id: Intl.UnicodeBCP47LocaleIdentifier
  title: string
}

export type SupportedLanguages =
  | Language[]
  | ((client: SanityClient) => Promise<Language[]>)

export type PluginConfig = {
  supportedLanguages: SupportedLanguages
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
