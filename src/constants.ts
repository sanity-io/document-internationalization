import type {PluginConfigContext} from './types'

export const METADATA_SCHEMA_NAME = `translation.metadata`
export const TRANSLATIONS_ARRAY_NAME = `translations`
export const API_VERSION = `2025-02-19`
export const DEFAULT_CONFIG: PluginConfigContext = {
  supportedLanguages: [],
  schemaTypes: [],
  languageField: `language`,
  weakReferences: false,
  bulkPublish: false,
  metadataFields: [],
  apiVersion: API_VERSION,
  allowCreateMetaDoc: false,
  callback: null,
}
