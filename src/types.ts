import type {
  FieldDefinition,
  KeyedObject,
  Reference,
  SanityClient,
} from 'sanity'

export type Language = {
  id: Intl.UnicodeBCP47LocaleIdentifier
  title: string
}

export type SupportedLanguages =
  | Language[]
  | ((client: SanityClient) => Promise<Language[]>)

export type DocumentInternationalizationPluginConfig = {
  supportedLanguages: SupportedLanguages
  schemaTypes: string[]
  languageField?: string
  bulkPublish?: boolean
  metadataFields?: FieldDefinition[]
}

export type TranslationReference = KeyedObject & {
  _type: 'internationalizedArrayReferenceValue'
  value: Reference
}

export type Metadata = {
  _id: string
  _createdAt: string
  translations: TranslationReference[]
}
