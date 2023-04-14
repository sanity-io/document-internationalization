# @sanity/document-internationalization

- [@sanity/document-internationalization](#sanitydocument-internationalization)
  - [Upgrading](#upgrading)
  - [Install](#install)
  - [Usage](#usage)
    - [Basic configuration](#basic-configuration)
    - [Advanced configuration](#advanced-configuration)
    - [Language field](#language-field)
  - [Code examples](#code-examples)
    - [Querying with GROQ](#querying-with-groq)
    - [Querying with GraphQL](#querying-with-graphql)
    - [Allowing the same slug on different language versions](#allowing-the-same-slug-on-different-language-versions)
  - [Note on document quotas](#note-on-document-quotas)
  - [Content migrations](#content-migrations)
  - [License](#license)
  - [Develop \& test](#develop--test)
    - [Release new version](#release-new-version)

This is the all-new, **Sanity Studio v3 exclusive version** of @sanity/document-internationalization released as v2.0.0

![v3 Studio with @sanity/document-internationalization v1 Installed](/img/sanity-document-internationalization-v2.png)

A complete rewrite of the original Document Internationalization plugin, exclusively for Sanity Studio v3. Major **benefits** from the previous versions include:

- Create new documents in any language and link translated references later
- Translation references are written to a separate "meta" document
- Updates to one translation no longer affect the change history of others
- Does not require custom - nor modify the built-in - [Document Actions](https://www.sanity.io/docs/document-actions)
- Changes made to one translation do not patch changes to other documents
- Configurable "language" field on documents
- Built-in static and parameterized initial value templates for new documents

## Upgrading

If this is your first time installing Document Internationalization, skip to the [Install](#install) section.

**I'm on Sanity Studio v3 and upgrading from plugin v1**

- You will need to perform a content migration to upgrade.
- See the [Content migrations](#content-migrations) section below.
- Your queries will also need to change, as translation references have moved. See the [Querying](#querying-with-groq) and [Querying with GraphQL](#querying-with-graphql) sections below. [GraphQL](#)

**I'm on Sanity Studio v3 but will stay with the older plugin for now**

- Please refer to the [v2 branch](https://github.com/sanity-io/document-internationalization/tree/studio-v2)
- Install from `v1.0.0` and above
- This version of the plugin will not be updated with new features

**I'm on Sanity Studio v2**

- Please refer to the [studio-v2 branch](https://github.com/sanity-io/document-internationalization/tree/studio-v2)
- Install from `v0.0.0` and above
- This version of the plugin will not be updated with new features
- You will not need to perform a content migration to move to Sanity Studio v3, if you install the v1 plugin.

## Install

```
npm install --save @sanity/document-internationalization@studio-v3-plugin-v2
```

or

```
yarn add @sanity/document-internationalization@studio-v3-plugin-v2
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

### Basic configuration

The only required configuration is the `supportedLanguages` array and the `schemaTypes` array.

```ts
// sanity.config.ts

import {createConfig} from 'sanity'
import {documentInternationalization} from '@sanity/document-internationalization'

export const createConfig({
  // ... all other config
  plugins: [
    // ... all other plugins
    documentInternationalization({
      supportedLanguages: [
        {id: 'es', title: 'Spanish'},
        {id: 'en', title: 'English'}
      ],
      schemaTypes: ['lesson'],
    })
  ]
})
```

### Advanced configuration

The plugin also supports asynchronously retrieving languages from the dataset, modifying the language field, adding a bulk publishing feature and adding additional fields to the metadata document.

```ts
// sanity.config.ts

import {createConfig} from 'sanity'
import {documentInternationalization} from '@sanity/document-internationalization'

export const createConfig({
  // ... all other config
  plugins: [
    // ... all other plugins
    documentInternationalization({
      // Required
      // Either: an array of supported languages...
      supportedLanguages: [
        {id: 'nb', title: 'Norwegian (Bokmål)'},
        {id: 'nn', title: 'Norwegian (Nynorsk)'},
        {id: 'en', title: 'English'}
      ],
      // ...or a function that takes the client and returns a promise of an array of supported languages
      // MUST return an "id" and "title" as strings
      // supportedLanguages: (client) => client.fetch(`*[_type == "language"]{id, title}`),

      // Required
      // Translations UI will only appear on these schema types
      schemaTypes: ['lesson'],

      // Optional
      // Customizes the name of the language field
      languageField: `language` // defauts to "language"

      // Optional
      // Adds UI for publishing all translations at once. Requires access to the Scheduling API
      // https://www.sanity.io/docs/scheduling-api
      bulkPublish: true // defaults to false

      // Optional
      // Adds additional fields to the metadata document
      metadataFields: [
        defineField({ name: 'slug', type: 'slug' })
      ],
    })
  ]
})
```

### Language field

The schema types that use document internationalization must also have a `string` field type with the same name configured in the `languageField` setting. Unless you want content creators to be able to change the language of a document, you may hide this field since the plugin will handle writing patches to it.

```ts
// ./schema/lesson.ts

// ...all other settings
defineField({
  // should match 'languageField' plugin configuration setting, if customized
  name: 'language',
  type: 'string',
  readOnly: true,
  hidden: true,
})
```

## Code examples

### Querying with GROQ

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

### Querying with GraphQL

Fortunately, the Sanity GraphQL API contains a similar filter for document references.

```graphql
# In this example we retrieve a lesson by its `slug.current` field value
query GetLesson($language: String!, $slug: String!) {
  allLesson(
    limit: 1
    where: {language: {eq: $language}, slug: {current: {eq: $slug}}}
  ) {
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

### Allowing the same slug on different language versions

Often your translated documents will share the same slug. You might wish to move this into the metadata document itself using the `metadataFields` option in the plugin. Alternatively, you can customize the `isUnique` function on a [slug type field](https://www.sanity.io/docs/slug-type#isUnique-**3dd89e75a768**).

```ts
// Add the isUnique option to your slug field
defineField({
  name: 'slug',
  type: 'slug',
  options: {
    isUnique: isUniqueOtherThanLanguage
  },
}),

// Create the function
// This checks that there are no other documents
// With this published or draft _id
// Or this schema type
// With the same slug and language
export async function isUniqueOtherThanLanguage(slug: string, context: SlugValidationContext) {
  const {document, getClient} = context
  if (!document) {
    return false
  }
  const client = getClient({apiVersion: '2022-12-07'})
  const id = document._id.replace(/^drafts\./, '')
  const params = {
    draft: `drafts.${id}`,
    published: id,
    language: document.language,
    slug,
  }
  const query = `!defined(*[
    !(_id in [$draft, $published]) &&
    slug.current == $slug &&
    language == $language
  ][0]._id)`
  const result = await client.fetch(query, params)
  return result
}
```

## Note on document quotas

In previous versions of this plugin, translations were stored as an array of references on the actual documents. This required a base language, lead to messy transaction histories and made deleting documents difficult.

In this version of the plugin, translations of a document are stored as an array of references in a separate document of the type `translation.metadata`, and one is created for every document that has translations. A document with no translations will not have a metadata document.

This means if you have 100 documents and they are all translated into 3 languages, you will have 400 documents. Keep this in mind for extremely high-volume datasets.

## Content migrations

There are two scripts in the `./migrations` folder of this repository. They contain scripts that should help move your content over – however, they may require updating to match your current settings.

**These have not been thoroughly tested on all platforms. Please take a backup before proceeding. Test on a duplicate dataset.**

- `./migrations/renameField.ts` will update the language field on translated documents
- `./migrations/createMetadata.ts` will create metadata documents for the arrays of references and unset those fields from translated documents

## License

[MIT](LICENSE) © Sanity.io

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hot reload in the studio.

### Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/sanity-plugin-workflow/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run the release on any branch.
