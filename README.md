# @sanity/document-internationalization

This is a complete rewrite of the original v0 Document Internationalization plugin, exclusively for Sanity Studio v3. The major differences include:

- Start new documents in any language and create references later
- Storing translation references in a separate "meta" document
- Updates to one document no longer effect the change history of other translations
- No use of Document Actions
- Configurable "language" field on documents

## Installation

```
npm install --save @sanity/document-internationalization
```

or

```
yarn add @sanity/document-internationalization
```

## Usage

Add it as a plugin in sanity.config.ts (or .js):

```ts
 import {createConfig} from 'sanity'
 import {documentInternationalization} from '@sanity/document-internationalization'

export const createConfig({
  // ...
  plugins: [
    documentInternationalization({
      // Required
      supportedLanguages: [
        {id: 'nb', title: 'Norwegian (Bokmål)'},
        {id: 'nn', title: 'Norwegian (Nynorsk)'},
        {id: 'en', title: 'English'}
      ],
      schemaTypes: ['product', 'post'],
      // Optional
      languageField: `language` // defauts to "language"
    })
  ]
})
```

The schema types that use document internationalization should also have a string field with the same name configured in the `languageField` setting. You can hide this field since the plugin will handle writing patches to it.

```ts
// ./schema/product.ts

// ...all other settings
defineField({
  name: 'language',
  type: 'string',
  readOnly: true,
  hidden: true,
})
```

## License

MIT © Simeon Griggs
See LICENSE
