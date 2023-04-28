import {DocumentInternationalizationPluginConfig} from '../types'

export const validateConfig = (
  config: DocumentInternationalizationPluginConfig
): DocumentInternationalizationPluginConfig => {
  if (!config?.supportedLanguages) {
    throw new Error(
      'Document Internationalization: "supportedLanguages" missing: You must provide an array of languages'
    )
  }

  if (
    Array.isArray(config.supportedLanguages) &&
    !config.supportedLanguages.length
  ) {
    throw new Error(
      'Document Internationalization: "supportedLanguages" must provide at least one language'
    )
  }

  if (!config?.schemaTypes) {
    throw new Error(
      'Document Internationalization: "schemaTypes" missing: You must provide an array of schema types to display the document-internationalization plugin'
    )
  }

  if (!config.schemaTypes.length) {
    throw new Error(
      'Document Internationalization: "schemaTypes" must contain at least one type'
    )
  }

  return config
}
