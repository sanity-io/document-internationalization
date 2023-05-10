import {PluginConfig} from './types'

export const METADATA_SCHEMA_NAME = `translation.metadata`
export const TRANSLATIONS_ARRAY_NAME = `translations`
export const API_VERSION = `2022-11-27`
export const DEFAULT_CONFIG: Required<PluginConfig> = {
  supportedLanguages: [],
  schemaTypes: [],
  languageField: `language`,
  bulkPublish: false,
  metadataFields: [],
}
