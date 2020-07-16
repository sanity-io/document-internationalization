# GraphQL support for document wide translation
The custom fields for document wide translation are not available in GraphQL by default because they have to be defined in the schema. However it is not possible to define "system" type fields in a Sanity schema, due to this we need to take some steps to make this work correctly:

1. We need to change the field names to not start with underscores as these are reserved names.
```javascript
const schema = {
  i18n: {
    fieldNames: {
      lang: 'i18n_lang'
      references: 'i18n_refs'
    }
  }
};
```

2. We need to add them as actual fields in the schema
```javascript
const schema = {
  type: 'schema',
  fields: [
    {
      name: 'i18n_lang',
      type: 'string',
      hidden: true
    },
    {
      name: 'i18n_refs',
      type: 'object',
      hidden: true,
      fields: [{
        name: 'nl_NL',
        type: 'reference',
        to: [{ type: 'schema' }]
      }, {
        ... // we need one field per language
      }]
    }
  ]
}
```

This way the GraphQL deployment will consider the `i18n_lang` and `i18n_refs` properties as part of your structure.