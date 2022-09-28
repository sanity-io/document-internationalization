# @sanity/document-internationalization

⚠️ This is only a POC for a future version of this plugin. It should not be used in Production and may significantly change.

![v3 Studio with @sanity/document-internationalization v1 Installed](/img/v3-studio-with-doc-intl-v1.png)

A complete rewrite of the original v0 Document Internationalization plugin, exclusively for Sanity Studio v3. The major benefits include:

- Start new documents in any language and create linking references later
- Stores translation references in a separate "meta" document
- Updates to one translation no longer effect the change history of others
- Does not require or modify on Document Actions
- Configurable "language" field on documents
- Built-in static and parameterized initial value templates for new documents

## Installation

```
npm install --save @sanity/document-internationalization@studio-v3-plugin-v1
```

or

```
yarn add @sanity/document-internationalization@studio-v3-plugin-v1
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
      schemaTypes: ['lesson'],
      // Optional
      languageField: `language` // defauts to "language"
    })
  ]
})
```

The schema types that use document internationalization must also have a string field with the same name configured in the `languageField` setting. You can hide this field since the plugin will handle writing patches to it.

```ts
// ./schema/lesson.ts

// ...all other settings
defineField({
  name: 'language',
  type: 'string',
  readOnly: true,
  hidden: true,
})
```

## Querying with GROQ

To query a single document and all its translations, we use the `references()` function in GROQ.

```json5
// All `lesson` documents of a single language
*[_type == "lesson" && language == $language]{
  // Just these fields
  title,
  slug,
  language,
  // Get the translations metadata
  // And resolve the `value` field in each array item
  "_translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    title,
    slug,
    language
  },
}
```

## Querying with GraphQL

Fortunately the Sanity GraphQL API contains a similar filter for document references.

```graphql
# In this example we retrieve a lesson by its `slug.current` field value
query GetLesson($language: String!, $slug: String!) {
  allLesson(limit: 1, where: {language: {eq: $language}, slug: {current: {eq: $slug}}}) {
    _id
    title
    language
    slug {
      current
    }
  }
}

# And then can run this query to find translation metadata documents that use its ID
query GetTranslations($id: ID!) {
  allTranslationMetadata(where: {_: {references: $id}}) {
    translations {
      _key
      value {
        title
        slug {
          current
        }
      }
    }
  }
}
```

## Migrating from v0

There are two scripts in the `./migrations` folder of this repository. They contain scripts which should help move your content over – however they may require updating to match your current settings.

**These have not been thoroughly tested on all platforms. Use at your own risk. Please take a backup before proceeding.**

- `./migrations/renameField.ts` will update the language field on translated documents
- `./migrations/createMetadata.ts` will create metadata documents for the arrays of references and unset those fields from translated documents

## Roadmap

The major missing feature at this time is asynchronously loading languages. There may be others.

## License

MIT © Simeon Griggs
See LICENSE
