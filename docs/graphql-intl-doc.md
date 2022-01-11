# GraphQL support

The custom fields for document translation are not available in GraphQL by default because they have to be defined in the schema. However it is not possible to define "system" type fields in a Sanity schema, due to this we need to take some steps to make this work correctly:

1. Change the field names to **not** start with underscores as these are reserved names.

```js
const schema = {
  i18n: {
    fieldNames: {
      lang: 'i18n_lang'
      baseReference: 'i18n_base',
      references: 'i18n_refs'
    }
  }
}
```

2. We need to add them as actual fields in the schema

```js
const schema = {
  type: 'schema',
  fields: [
    {
      name: 'i18n_lang',
      type: 'string',
      hidden: true,
    },
    {
      name: 'i18n_base',
      type: 'reference',
      hidden: true,
    },
    {
      name: 'i18n_refs',
      type: 'array',
      hidden: true,
      of: [
        {
          type: 'reference',
          name: 'ref',
          to: [{type: 'schema'}],
        },
      ],
    },
  ],
}
```

This way the GraphQL deployment will consider the `i18n_lang`, `i18n_refs` and `i18n_base` properties as part of your structure and you will be able to query by them.
