export type TMessagesConfig = {
  publishing?: string;
  publish?: string;
  updatingIntlFields?: string;
  intlFieldsUpdated?: string;
  loading?: string;
  missing?: string;
  draft?: string;
  missingTranslations?: string;
  deleteAll?: {
    buttonTitle?: string;
    deleting?: string;
  };
  duplicateAll?: {
    buttonTitle?: string;
    duplicating?: string;
  };
  translationsMaintenance?: {
    title?: string;
    selectSchemaPlaceholder?: string;
    idStructureMismatch?: string;
    missingLanguageField?: string;
    missingDocumentRefs?: string;
    orphanDocuments?: string;
    referenceBehaviorMismatch?: string;
    baseLanguageMismatch?: string;
    fix?: string;
  };
};