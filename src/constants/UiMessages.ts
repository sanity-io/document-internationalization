export const UiMessages = {
  publishing: 'Publishing...',
  publish: 'Publish',
  updatingIntlFields: 'Updating i18n fields',
  intlFieldsUpdated: 'I18n fields updated',
  baseDocumentCopied: 'Base document copied',
  loading: 'Loading languages...',
  draft: 'Draft',
  missingTranslations:
    'Following languages are missing some translations compared to the base language',
  base: 'Base',
  missing: 'Missing',
  deleteAll: {
    buttonTitle: 'Delete (incl. translations)',
    deleting: 'Deleting...',
  },
  duplicateAll: {
    buttonTitle: 'Duplicate (incl. translations)',
    duplicating: 'Duplicating...',
  },
  translationsMaintenance: {
    title: 'Translation Maintenance',
    selectSchemaPlaceholder: 'Select schema type',
    idStructureMismatch: 'document(s) with mismatched ID structures',
    missingLanguageField: 'document(s) are missing the language field',
    missingDocumentRefs: 'document(s) have missing translation references',
    missingBaseDocumentRefs: 'document(s) have missing base document references',
    orphanDocuments: 'orphaned translation document(s)',
    referenceBehaviorMismatch: 'document(s) with mismatched reference behaviors',
    baseLanguageMismatch: 'base document(s) with mismatched language field',
    fix: 'Fix',
  },
  errors: {
    baseDocumentNotPublished:
      'It looks like you have not published your base translation yet. When using strong references it is required to publish the base document before publishing any translated entries',
  },
}
