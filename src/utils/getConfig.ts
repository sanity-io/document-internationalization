import config from 'config:sanity';
import { getSchema } from './getSchema';
import { Ti18nSchema, Ti18nConfig } from '../types';

export function getConfig(type?: string | Ti18nSchema): Required<Ti18nConfig> & {
  withTranslationsMaintenance: boolean;
} {
  const schema = type
    ? (typeof type === 'string' ? getSchema<Ti18nSchema>(type)?.i18n : type.i18n)
    : null;
  const cfg = config?.config?.plugins?.['intl-input'];
  return {
    base: schema?.base || cfg?.base,
    withTranslationsMaintenance: cfg?.withTranslationsMaintenance === false ? false : true,
    fieldNames: {
      lang: schema?.fieldNames?.lang || cfg?.fieldNames?.lang || '__i18n_lang',
      references: schema?.fieldNames?.references || cfg?.fieldNames?.references || '__i18n_refs',
    },
    languages: schema?.languages || cfg?.languages,
    messages: {
      publishing: schema?.messages?.publishing || cfg?.messages?.publishing || 'Publishing...',
      publish: schema?.messages?.publish || cfg?.messages?.publish || 'Publish',
      loading: schema?.messages?.loading || cfg?.messages?.loading || 'Loading languages...',
      draft: schema?.messages?.draft || cfg?.messages?.draft || 'Draft',
      missingTranslations: schema?.messages?.missingTranslations || cfg?.messages?.missingTranslations || 'Following languages are missing some translations compared to the base language',
      translationsMaintenance: {
        title: schema?.messages?.translationsMaintenance?.title || cfg?.messages?.translationsMaintenance?.title || 'Translation Maintenance',
        selectSchemaPlaceholder: cfg?.messages?.translationsMaintenance?.selectSchemaPlaceholder || 'Select schema type',
        missingLanguageField: cfg?.messages?.translationsMaintenance?.missingLanguageField || 'document(s) are missing the language field',
        missingDocumentRefs: cfg?.messages?.translationsMaintenance?.missingDocumentRefs || 'document(s) have missing translation references',
        orphanDocuments: cfg?.messages?.translationsMaintenance?.orphanDocuments || 'orphaned translation document(s)',
        fix: cfg?.messages?.translationsMaintenance?.fix || 'Fix'
      }
    }
  };
}