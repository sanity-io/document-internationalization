import {IdStructure, ReferenceBehavior} from '../constants'
import type {Ti18nConfig} from '../types'

type ApplyConfigOptionalKeys =
  | 'shouldReload'
  | 'languagesLoader'
  | 'fallbackLanguageSelect'
  | 'customFlagComponents'
  | 'onTranslationCreate'
export type ApplyConfigResult = Omit<
  Required<{
    [K in keyof Ti18nConfig]: Required<Ti18nConfig[K]>
  }>,
  ApplyConfigOptionalKeys
> &
  Pick<Ti18nConfig, ApplyConfigOptionalKeys>

export function applyConfig(
  baseConfig?: Ti18nConfig,
  incomingConfig?: Ti18nConfig | null
): ApplyConfigResult {
  return {
    base: incomingConfig?.base || baseConfig?.base || '',
    languages: incomingConfig?.languages || baseConfig?.languages || [],
    idStructure: baseConfig?.idStructure || IdStructure.DELIMITER,
    referenceBehavior: baseConfig?.referenceBehavior || ReferenceBehavior.STRONG,
    withTranslationsMaintenance: baseConfig?.withTranslationsMaintenance === true,
    shouldReload: baseConfig?.shouldReload,
    languagesLoader: baseConfig?.languagesLoader,
    fallbackLanguageSelect: baseConfig?.fallbackLanguageSelect,
    onTranslationCreate: incomingConfig?.onTranslationCreate,
    customFlagComponents: baseConfig?.customFlagComponents,
    fieldNames: {
      lang: incomingConfig?.fieldNames?.lang || baseConfig?.fieldNames?.lang || '__i18n_lang',
      references:
        incomingConfig?.fieldNames?.references ||
        baseConfig?.fieldNames?.references ||
        '__i18n_refs',
      baseReference:
        incomingConfig?.fieldNames?.baseReference ||
        baseConfig?.fieldNames?.baseReference ||
        '__i18n_base',
    },
  }
}
