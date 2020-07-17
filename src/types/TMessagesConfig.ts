export type TMessagesConfig = {
  publishing?: string;
  publish?: string;
  loading?: string;
  missing?: string;
  draft?: string;
  missingTranslations?: string;
  deleteAll?: {
    buttonTitle?: string;
    deleting?: string;
  };
  translationsMaintenance?: {
    title?: string;
    selectSchemaPlaceholder?: string;
    missingLanguageField?: string;
    missingDocumentRefs?: string;
    orphanDocuments?: string;
    fix?: string;
  };
};