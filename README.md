# @sanity/document-internationalization

- This is a completely new, **Sanity Studio v3 exclusive version** of @sanity/document-internationalization released as v2.0.0 which contains new features and requires content migrations to upgrade from previous versions. There is example code below.

- For the **Studio v3 compatible version** of the original plugin, please install v1.0.0 and above.

- For the **Studio v2 version** (plugin version 0), please refer to the [v2-branch](https://github.com/sanity-io/document-internationalization) and install v0.0.0 and above.

![v3 Studio with @sanity/document-internationalization v1 Installed](/img/sanity-document-internationalization-v2.png)

A complete rewrite of the original Document Internationalization plugin, exclusively for Sanity Studio v3. Major **benefits** from the previous versions include:

- Create new documents in any language and link references later
- Translation references are written to a separate "meta" document
- Updates to one translation no longer affect the change history of others
- Does not require custom - nor modify the built-in - Document Actions
- Changes made to one translation do not patch changes to other documents
- Configurable "language" field on documents
- Built-in static and parameterized initial value templates for new documents

## Note on Document counts

In previous versions of this plugin, translations were stored as an array of references on the actual documents. This required a base language and lead to messy transaction histories.

In this version of the plugin, translations of a document are stored as an array of references in a document of the `_type: translation.metadata`, and one is created for every document that has translations. A document with no translations will not have a metadata document.

This means if you have 100 documents and they are all translated into 3 languages, you will have 400 documents. Keep this in mind for extremely high-volume datasets.

## Install

```
npm install --save @sanity/document-internationalization@studio-v3-plugin-v2
```

or

```
yarn add @sanity/document-internationalization@studio-v3-plugin-v2
```

## Usage

Add it as a plugin in sanity.config.ts (or .js):

```ts

// sanity.config.ts
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
      // Requires access to the Publishing API
      bulkPublish: true // defaults to false
    })
  ]
})
```

The schema types that use document internationalization must also have a `string` field type with the same name configured in the `languageField` setting. You can hide this field since the plugin will handle writing patches to it.

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

Fortunately, the Sanity GraphQL API contains a similar filter for document references.

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

## Migrating from v0 / v1

There are two scripts in the `./migrations` folder of this repository. They contain scripts that should help move your content over – however, they may require updating to match your current settings.

**These have not been thoroughly tested on all platforms. Please take a backup before proceeding. Test on a duplicate dataset.**

- `./migrations/renameField.ts` will update the language field on translated documents
- `./migrations/createMetadata.ts` will create metadata documents for the arrays of references and unset those fields from translated documents

## Roadmap

- [ ] Asynchronous language plugin config option
- [ ] Export a validator to allow the same slug on connected translations
- [ ] Guidance to copy/paste changes between documents
- [ ] Add extra fields to the metadata document

## License

MIT © Simeon Griggs
See LICENSE

## License

MIT-licensed. See LICENSE.

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.

### Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/document-internationalization/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.

## License

[MIT](LICENSE) © Simeon Griggs
