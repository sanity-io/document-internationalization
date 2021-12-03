# Usage - Complete document translation
To enable document wide translations for a schema type you have to enable the `i18n` option in the schema configuration. Either by setting it to `true` or by using it to configure the localization.  
Following options can be passed in the `i18n` object if not set to `true` to simply use the global configuration.  
* `base`: *OPTIONAL* Override the globally configured base language ID. If there is no base language ID configured at all, the first language in the list will be used.
* `referenceBehavior`: Can be `hard` (default), `weak` or `disabled`. This option defines how the translated documents are referenced in the parent document
* `languages`: *OPTIONAL* Override the globally configured languages option. If the languages aren't configured globally, this option is required.
* `fieldNames`
  * `lang`: *OPTIONAL* Override the globally configured language field name (defaults to `__i18n_lang`)
  * `references`: *OPTIONAL* Override the globally configured references field name (defaults to `__i18n_refs`)
  * `baseReference`: *OPTIONAL* Override the globally configured base document reference fiel dname (defaults to `__i18n_base`)

**Example**
```javascript
export default {
    type: 'document',
    name: '...',
    title: '...',
    i18n: {
      base: 'en_US',
      languages: ['en_US', 'nl_NL'],
      fieldNames: {
        lang: '__i18n_lang',
        references: '__i18n_refs',
        baseReference: '__i18n_base'
      }
    },
    fields: []
}
```
