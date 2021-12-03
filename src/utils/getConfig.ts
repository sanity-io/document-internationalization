import config from 'config:intl-input'
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
  const schema = getI18nConfigFromType(type)
  const cfg = config
  return {
    base: schema?.base || cfg?.base || '',
    idStructure: cfg.idStructure || IdStructure.DELIMITER,
    referenceBehavior: cfg.referenceBehavior || ReferenceBehavior.HARD,
    withTranslationsMaintenance: cfg?.withTranslationsMaintenance !== false,
    fieldNames: {
      lang: schema?.fieldNames?.lang || cfg?.fieldNames?.lang || '__i18n_lang',
      references: schema?.fieldNames?.references || cfg?.fieldNames?.references || '__i18n_refs',
      baseReference:
        schema?.fieldNames?.baseReference || cfg?.fieldNames?.baseReference || '__18n_base',
    },
    languages: schema?.languages || cfg?.languages || [],
    // @TODO improve the i18n of the plugin itself
    // also the studio
    messages: {
      publishing: schema?.messages?.publishing || cfg?.messages?.publishing || 'Publishing...',
      publish: schema?.messages?.publish || cfg?.messages?.publish || 'Publish',
      updatingIntlFields:
        schema?.messages?.updatingIntlFields ||
        cfg?.messages?.updatingIntlFields ||
        'Updating i18n fields...',
      intlFieldsUpdated:
        schema?.messages?.intlFieldsUpdated ||
        cfg?.messages?.intlFieldsUpdated ||
        'I18n fields updated',
      loading: schema?.messages?.loading || cfg?.messages?.loading || 'Loading languages...',
      draft: schema?.messages?.draft || cfg?.messages?.draft || 'Draft',
      missingTranslations:
        schema?.messages?.missingTranslations ||
        cfg?.messages?.missingTranslations ||
        'Following languages are missing some translations compared to the base language',
      missing: schema?.messages?.missing || cfg?.messages?.missing || 'Missing',
      deleteAll: {
        buttonTitle:
          schema?.messages?.deleteAll?.buttonTitle ||
          cfg?.messages?.deleteAll?.buttonTitle ||
          'Delete (incl. translations)',
        deleting:
          schema?.messages?.deleteAll?.deleting ||
          cfg?.messages?.deleteAll?.deleting ||
          'Deleting...',
      },
      duplicateAll: {
        buttonTitle:
          schema?.messages?.duplicateAll?.buttonTitle ||
          cfg?.messages?.duplicateAll?.buttonTitle ||
          'Duplicate (incl. translations)',
        duplicating:
          schema?.messages?.duplicateAll?.duplicating ||
          cfg?.messages?.duplicateAll?.duplicating ||
          'Duplicating...',
      },
      translationsMaintenance: {
        title:
          schema?.messages?.translationsMaintenance?.title ||
          cfg?.messages?.translationsMaintenance?.title ||
          'Translation Maintenance',
        selectSchemaPlaceholder:
          cfg?.messages?.translationsMaintenance?.selectSchemaPlaceholder || 'Select schema type',
        idStructureMismatch:
          cfg?.messages?.translationsMaintenance?.idStructureMismatch ||
          'document(s) with mismatched ID structures',
        missingLanguageField:
          cfg?.messages?.translationsMaintenance?.missingLanguageField ||
          'document(s) are missing the language field',
        missingDocumentRefs:
          cfg?.messages?.translationsMaintenance?.missingDocumentRefs ||
          'document(s) have missing translation references',
        missingBaseDocumentRefs:
          cfg.messages?.translationsMaintenance?.missingBaseDocumentRefs ||
          'documnt(s) have missing base document references',
        orphanDocuments:
          cfg?.messages?.translationsMaintenance?.orphanDocuments ||
          'orphaned translation document(s)',
        referenceBehaviorMismatch:
          cfg?.messages?.translationsMaintenance?.referenceBehaviorMismatch ||
          'document(s) with mismatched reference behaviors',
        baseLanguageMismatch:
          cfg?.messages?.translationsMaintenance?.baseLanguageMismatch ||
          'base document(s) with mismatched language field',
        fix: cfg?.messages?.translationsMaintenance?.fix || 'Fix',
      },
    },
  }
}
