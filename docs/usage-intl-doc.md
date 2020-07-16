# Usage - Complete document translation
You can simply enable translations for your document type using the `i18n` parameter.
```javascript
export default {
    type: 'document',
    name: '...',
    title: '...',
    i18n: {
      base: '', // (OPTIONAL) id of the base language (if not passed the first one is considered base language)
      languages: ['..', '..', ...], // <-- eg. ['en', 'nl']
      messages: { // (OPTIONAL) You can pass a messages object to override the default messsages shown
        loading: 'Loading languages...',
        missing: 'Missing',
        draft: 'Draft',
        publishing: 'Publishing...',
        publish: 'Publish'
      },
      fieldName: { // (OPTIONAL) You can update the field name(s) the plugin injects
        lang: '__i18n_lang'
      }
    },
    fields: []
}
```