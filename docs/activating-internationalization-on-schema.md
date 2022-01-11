# Activating internationalization on schema

To enable document wide translations for a schemas you need to add the `i18n` key in a schema.

Adding `i18n: true` to a schema will use the defaults in your configuration file.

Alternatively you can set an object like `i18n: {...}` to override those defaults.

- `base`: Override the globally configured base language ID. If there is no base language ID configured at all, the first language in the list will be used.
- `referenceBehavior`: Can be `hard` (default), `weak` or `disabled`. This option defines how the translated documents are referenced in the parent document
- `languages`: Override the globally configured languages option. If the languages aren't configured globally, this option is required.
- `fieldNames`
  - `lang`: Override the globally configured language field name (defaults to `__i18n_lang`)
  - `references`: Override the globally configured references field name (defaults to `__i18n_refs`)
  - `baseReference`: Override the globally configured base document reference field name (defaults to `__i18n_base`)

## Initial value

Consider setting [Initial Values](https://www.sanity.io/guides/getting-started-with-initial-values-for-new-documents) so that the base language value is already set on new documents.

## Example

```js
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
      baseReference: '__i18n_base',
    },
  },
  initialValue: {
    __i18n_lang: 'en_US',
  },
  fields: [],
}
```

With desk structure and your schema setup, you should now see the "Translations" View Pane in your Studio!
