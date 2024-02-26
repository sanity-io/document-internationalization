/* eslint-disable no-unused-vars */

import type {
  FieldDefinition,
  KeyedObject,
  ObjectSchemaType,
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

export type PluginConfig = {
  supportedLanguages: SupportedLanguages
  schemaTypes: string[]
  languageField?: string
  weakReferences?: boolean
  bulkPublish?: boolean
  metadataFields?: FieldDefinition[]
  apiVersion?: string
}

// Context version of config
// should have processed the
// supportedLanguages function
export type PluginConfigContext = Required<PluginConfig> & {
  supportedLanguages: Language[]
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

export type DocumentInternationalizationMenuProps = {
  schemaType: ObjectSchemaType
  documentId: string
}

// Extend Sanity schema definitions
export interface DocumentInternationalizationSchemaOpts {
  documentInternationalization?: {
    /** Set to true to disable duplication of this field or type */
    exclude?: boolean
  }
}

declare module 'sanity' {
  interface ArrayOptions extends DocumentInternationalizationSchemaOpts {}
  interface BlockOptions extends DocumentInternationalizationSchemaOpts {}
  interface BooleanOptions extends DocumentInternationalizationSchemaOpts {}
  interface CrossDatasetReferenceOptions
    extends DocumentInternationalizationSchemaOpts {}
  interface DateOptions extends DocumentInternationalizationSchemaOpts {}
  interface DatetimeOptions extends DocumentInternationalizationSchemaOpts {}
  interface FileOptions extends DocumentInternationalizationSchemaOpts {}
  interface GeopointOptions extends DocumentInternationalizationSchemaOpts {}
  interface ImageOptions extends DocumentInternationalizationSchemaOpts {}
  interface NumberOptions extends DocumentInternationalizationSchemaOpts {}
  interface ObjectOptions extends DocumentInternationalizationSchemaOpts {}
  interface ReferenceBaseOptions
    extends DocumentInternationalizationSchemaOpts {}
  interface SlugOptions extends DocumentInternationalizationSchemaOpts {}
  interface StringOptions extends DocumentInternationalizationSchemaOpts {}
  interface TextOptions extends DocumentInternationalizationSchemaOpts {}
  interface UrlOptions extends DocumentInternationalizationSchemaOpts {}
  interface EmailOptions extends DocumentInternationalizationSchemaOpts {}
}
