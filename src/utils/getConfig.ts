import config from 'config:document-internationalization'
import {Ti18nSchema, Ti18nConfig} from '../types'
import {IdStructure, ReferenceBehavior} from '../constants'
import {getSchema} from './getSchema'

const getI18nConfigFromType = (type?: string | Ti18nSchema) => {
  let i18nconfig: Ti18nConfig = {}

  if (type) {
    if (typeof type === 'string') {
      const schema = getSchema<Ti18nSchema>(type)
      if (schema && typeof schema.i18n !== 'boolean') {
        i18nconfig = schema.i18n
      }
    } else if (typeof type.i18n !== 'boolean') {
      i18nconfig = type.i18n
    }
  }

  return i18nconfig
}

export function getConfig(type?: string | Ti18nSchema): Required<{
  [K in keyof Ti18nConfig]: Required<Ti18nConfig[K]>
}> & {
  withTranslationsMaintenance: boolean
} {
  const schemaConfig = getI18nConfigFromType(type)
  const cfg = config

  return {
    base: schemaConfig?.base || cfg?.base || '',
    idStructure: cfg.idStructure || IdStructure.DELIMITER,
    referenceBehavior: cfg.referenceBehavior || ReferenceBehavior.HARD,
    withTranslationsMaintenance: cfg?.withTranslationsMaintenance !== false,
    fieldNames: {
      lang: schemaConfig?.fieldNames?.lang || cfg?.fieldNames?.lang || '__i18n_lang',
      references:
        schemaConfig?.fieldNames?.references || cfg?.fieldNames?.references || '__i18n_refs',
      baseReference:
        schemaConfig?.fieldNames?.baseReference || cfg?.fieldNames?.baseReference || '__18n_base',
    },
    languages: schemaConfig?.languages || cfg?.languages || [],
  }
}
