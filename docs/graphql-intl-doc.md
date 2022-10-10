# GraphQL support

The custom fields for document translation are not available in GraphQL by default because they have to be defined in the schema.

Also, these field names cannot start with an underscore (`_`) as these are reserved for system fields.

Here is an code example for a document schema named `product`, with hidden fields for the language and connected references metadata.

```js
{
  name: 'product',
  title: 'Product'
  type: 'document',
  i18n: {
    fieldNames: {
      lang: 'i18n_lang'
      baseReference: 'i18n_base',
      references: 'i18n_refs'
    }
  }
  fields: [
    {
      name: 'i18n_lang',
      type: 'string',
      hidden: true,
    },
    {
      name: 'i18n_base',
      type: 'reference',
      to: [{type: 'product'}],
      hidden: true,
    },
    {
      name: 'i18n_refs',
      type: 'array',
      hidden: true,
      of: [
        {
          type: 'reference',
          to: [{type: 'product'}],
        },
      ],
    },
  ],
}
```

This way the GraphQL deployment will consider the `i18n_lang`, `i18n_refs` and `i18n_base` properties as part of your structure and you will be able to query by them.
