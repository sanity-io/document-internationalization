# Usage - Complete document translation
To enable document wide translations for a schema type you have to enable the `i18n` option in the schema configuration. Either by setting it to `true` or by using it to configure the localization.  
Following options can be passed in the `i18n` object if not set to `true` to simply use the global configuration.  
* `base`: *OPTIONAL* Override the globally configured base language ID. If there is no base language ID configured at all, the first language in the list will be used.
* `languages`: *OPTIONAL* Override the globally configured languages option. If the languages aren't configured globally, this option is required.
* `fieldName`
  * `lang`: *OPTIONAL* Override the globally configured language field name (defaults to `__i18n_lang`)
  * `references`: *OPTIONAL* Override the globally configured references field name (defaults to `__i18n_refs`)
* `messages`: : Use this to override the default or globally configured messages. Following keys are relevant here:  
  * `publishing`
  * `publish`
  * `loading`
  * `missing`
  * `draft`
  * `missingTranslations`
  * `deleteAll`
  * `translationsMaintenance`

**Example**
```javascript
export default {
    type: 'document',
    name: '...',
    title: '...',
    i18n: {
      base: 'en_US',
      languages: ['en_US', 'nl_NL'],
      messages: {
        loading: 'Loading languages...',
        missing: 'Missing',
        draft: 'Draft',
        publishing: 'Publishing...',
        publish: 'Publish',
        deleteAll: {
          buttonTitle: 'Delete (incl. translations)',
          deleting: 'Deleting...',
        },
        translationsMaintenance: {
          title: 'Translation Maintenance',
          selectSchemaPlaceholder: 'Select schema type',
          oldIdStructure: 'document(s) are using the old ID structure',
          missingLanguageField: 'document(s) are missing the language field',
          missingDocumentRefs: 'document(s) have missing translation references',
          orphanDocuments: 'orphaned translation document(s)',
          fix: 'Fix'
        }
      },
      fieldName: {
        lang: '__i18n_lang',
        references: '__i18n_refs'
      }
    },
    fields: []
}
```