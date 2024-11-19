import {defineLocaleResourceBundle} from 'sanity'

/**
 * The locale namespace for the document internationalization plugin.
 *
 * @public
 */
export const documenti18nLocaleNamespace =
  'document-internationalization' as const

/**
 * The default locale bundle for the document internationalization plugin, which is US English.
 *
 * @internal
 */
export const documentInternationalizationUsEnglishLocaleBundle =
  defineLocaleResourceBundle({
    locale: 'en-US',
    namespace: documenti18nLocaleNamespace,
    resources: () => import('./resources'),
  })
