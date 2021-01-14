import config from 'config:intl-input';
import { getSchema } from './getSchema';
import { Ti18nSchema, Ti18nConfig, TLanguagesOption, TMessagesConfig, TFieldNamesConfig } from '../types';
import { ReferenceBehavior } from '../constants';

export function getConfig(type?: string | Ti18nSchema): Required<{
  [K in keyof Ti18nConfig]: Required<Ti18nConfig[K]>
}> & {
  withTranslationsMaintenance: boolean;
} {
  const schema = (() => {
    const schema = type
      ?  (typeof type === 'string' ? getSchema<Ti18nSchema>(type)?.i18n : type.i18n)
      : false
    if (typeof schema !== 'boolean') return schema;
    return {}
  })();
  const cfg = config;
  return {
    base: schema?.base || cfg?.base || '',
    referenceBehavior: ReferenceBehavior.HARD,
    withTranslationsMaintenance: cfg?.withTranslationsMaintenance === false ? false : true,
    fieldNames: {
      lang: schema?.fieldNames?.lang || cfg?.fieldNames?.lang || '__i18n_lang',
      references: schema?.fieldNames?.references || cfg?.fieldNames?.references || '__i18n_refs',
    },
    languages: schema?.languages || cfg?.languages || [],
    messages: {
      publishing: schema?.messages?.publishing || cfg?.messages?.publishing || 'Publishing...',
      publish: schema?.messages?.publish || cfg?.messages?.publish || 'Publish',
      loading: schema?.messages?.loading || cfg?.messages?.loading || 'Loading languages...',
      draft: schema?.messages?.draft || cfg?.messages?.draft || 'Draft',
      missingTranslations: schema?.messages?.missingTranslations || cfg?.messages?.missingTranslations || 'Following languages are missing some translations compared to the base language',
      missing: schema?.messages?.missing || cfg?.messages?.missing || 'Missing',
      deleteAll: {
        buttonTitle: schema?.messages?.deleteAll?.buttonTitle || cfg?.messages?.deleteAll?.buttonTitle || 'Delete (incl. translations)',
        deleting: schema?.messages?.deleteAll?.deleting || cfg?.messages?.deleteAll?.deleting || 'Deleting...'
      },
      translationsMaintenance: {
        title: schema?.messages?.translationsMaintenance?.title || cfg?.messages?.translationsMaintenance?.title || 'Translation Maintenance',
        selectSchemaPlaceholder: cfg?.messages?.translationsMaintenance?.selectSchemaPlaceholder || 'Select schema type',
        oldIdStructure: cfg?.messages?.translationsMaintenance?.oldIdStructure || 'document(s) are using the old ID structure',
        missingLanguageField: cfg?.messages?.translationsMaintenance?.missingLanguageField || 'document(s) are missing the language field',
        missingDocumentRefs: cfg?.messages?.translationsMaintenance?.missingDocumentRefs || 'document(s) have missing translation references',
        orphanDocuments: cfg?.messages?.translationsMaintenance?.orphanDocuments || 'orphaned translation document(s)',
        referenceBehaviorMismatch: cfg?.messages?.translationsMaintenance?.referenceBehaviorMismatch || 'document(s) with mismatched reference behaviors',
        fix: cfg?.messages?.translationsMaintenance?.fix || 'Fix'
      }
    }
  };
}