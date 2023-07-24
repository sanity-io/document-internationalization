# Upgrading from v1 of @sanity/document-internationalization

## Where you are now:

**I'm on Sanity Studio v3 and upgrading from plugin v1.0.0 and above**

- You will need to perform a content migration to upgrade. See ["Upgrading from v1 to v2"](#upgrading-from-v1-to-v2)
- Your queries will also need to change, as translation references have moved. See the [Querying](#querying-with-groq) and [Querying with GraphQL](#querying-with-graphql) sections below. [GraphQL](#)

**I'm on Sanity Studio v3 but will stay with the older plugin for now**

- Please refer to the [v1 branch](https://github.com/sanity-io/document-internationalization/tree/v1)
- Install from `v1.0.0` and above
- This version of the plugin will not be updated with new features

**I'm on Sanity Studio v2**

- Please refer to the [studio-v2 branch](https://github.com/sanity-io/document-internationalization/tree/studio-v2)
- Install from `v0.0.0` and above
- This version of the plugin will not be updated with new features
- You will not need to perform a content migration to move to Sanity Studio v3, if you install the v1 plugin.

### Upgrading from v1 to v2

Upgrading from v1 to v2 of this plugin will require:

1. Migrations of internationalized documents in your dataset
2. Updates to your `sanity.config.ts` plugins array
3. Updated queries in your front-end application(s)

We have provided migration scripts and guidance on this page. Please submit an issue if anything is unclear.

### How v2 is different from v1

A complete rewrite of the original Document Internationalization plugin, exclusively for Sanity Studio v3. Major **benefits** from the previous versions include:

- Create new documents in any language and link translated references later
- Translation references are written to a separate "meta" document
- Updates to one translation no longer affect the change history of others
- Does not require custom - nor modify the built-in - [Document Actions](https://www.sanity.io/docs/document-actions)
- Changes made to one translation do not patch changes to other documents
- Configurable "language" field on documents
- Built-in static and parameterized initial value templates for new documents

## 1. Migrating content

In this repository are two scripts to help migrate content. One is required, the other is not.

### 1.1 Required: `createMetadata.ts`

Please backup your dataset before running migration scripts.

Instructions for how to perform this migration are written in the script itself: [https://github.com/sanity-io/document-internationalization/blob/main/scripts/createMetadata.ts](https://github.com/sanity-io/document-internationalization/blob/main/scripts/createMetadata.ts)

The [createMetadata.ts](https://github.com/sanity-io/document-internationalization/blob/main/scripts/createMetadata.ts) script will look for all documents of a specific `_type` that contain the previous plugin's `__i18n_refs` array of references. Those arrays were written by the plugin and should look like this:

```json
"__i18n_refs": [
  {
    "_key": "en_GB",
    "_ref": "32cb7277-1cfb-4ab1-ae1e-ab844dc8ab72__i18n_en_GB",
    "_type": "reference",
  },
  {
    "_key": "no",
    "_ref": "32cb7277-1cfb-4ab1-ae1e-ab844dc8ab72__i18n_nl",
    "_type": "reference",
  },
],
```

The script will create a new `translation.metadata` document which contains the `__i18n_refs` array of references in a field named `translations`.

(This is the new way to query for translations of a document – to find the `translation.metadata` document that references it, and then look through the `translations` array.)

The benefits of this method include no longer needing document actions to write changes to content documents – and being able to start documents in any language and attach translations.

The resultant document looks like this:

```json
{
  "_id": "b4ed5f0b-8e01-44b7-ac4c-09f2fb233b26",
  "_type": "translation.metadata",
  "translations": [
    {
      "_key": "en",
      "value": {
        "_ref": "32cb7277-1cfb-4ab1-ae1e-ab844dc8ab72__i18n_en_GB",
        "_type": "reference"
      }
    },
    {
      "_key": "no",
      "value": {
        "_ref": "32cb7277-1cfb-4ab1-ae1e-ab844dc8ab72__i18n_nl",
        "_type": "reference"
      }
    }
  ]
}
```

The previous `__i18n_refs` and `__i18n_base` fields will be removed from the document.

Make sure to configure the new plugin with your existing `languageField` setting, or run the script below to rewrite the name of that field.

### 1.2 Optional: `renameLanguageField.ts`

Please backup your dataset before running migration scripts.

Instructions for how to perform this migration are written in the script itself: [https://github.com/sanity-io/document-internationalization/blob/main/scripts/renameLanguageField.ts](https://github.com/sanity-io/document-internationalization/blob/main/scripts/renameLanguageField.ts)

The previous plugin by default would write fields with double underscore prefixes (example: `__lang`) which did not work with GraphQL deployments.

For data hygiene, you may prefer to have a normalized field name for the language field in your translated documents. The default field name for a document's language in the new plugin is `language`.

[This script will update the field name](https://github.com/sanity-io/document-internationalization/blob/main/scripts/renameLanguageField.ts) `__i18n_lang` to `language` or can be customized to use the field name you used in the previous version of the plugin.

## 2. Updating `sanity.config.ts`

### 2.1 Install the new version of the plugin

```sh
npm install @sanity/document-internationalization@latest
```

### 2.2 Update your plugins array

The previous version of the plugin recommended you wrap your plugins array and modify your desk structure using the `withDocumentI18nPlugin()` function. This is no longer required.

Update your plugins array to load the plugin like you would any other. For configuration options see the [plugin documentation](https://github.com/sanity-io/document-internationalization/blob/main/README.md).:

>

```ts
// ./sanity.config.ts

import {createSchema} from '@sanity/schema'
import {documentInternationalization} from '@sanity/document-internationalization'
// ...all other imports

export default defineConfig({
  // ... all other settings
  plugins: [
    // ... all other plugins
    // Remove `withDocumentI18nPlugin` wrapper function
    deskTool(),
    documentInternationalization({
      // See the README and notes below for configuration options
    }),
  ],
})
```

Your existing plugin configuration might look something like this. See comments below for which field names require updates and which are no longer necessary or relevant.

```js
// Old plugin configuration

documentI18n({
  // Change to `supportedLanguages`
  "languages": [
    { "title": "English (US)", "id": "en-us" },
    { "title": "Dutch (NL)", "id": "nl-nl" }
  ],
  // Change to `weakReferences`, example:
  // weakReferences: true | false (default false)
  "referenceBehavior": "strong",
  // Change to `languageField`, example:
  // languageField: 'language' (default 'language')
  "fieldNames": {
    "lang": "__i18n_lang",
    "references": "__i18n_refs",
    "baseReference": "__i18n_base"
  }
  // Remove: There is no enforced "base language" in this new version
  "base": "en-us",
  // Remove: Deterministic _id strings are no longer supported
  // as documents could be created in any language first
  // and querying by _id strings is unreliable and slow
  "idStructure": "delimiter",
  // Remove: No longer necessary
  "withTranslationsMaintenance": false,
})
```

The new config would look like this:

```js
// New plugin configuration

documentInternationalization({
  // Required:
  supportedLanguages: [
    {title: 'English (US)', id: 'en-us'},
    {title: 'Dutch (NL)', id: 'nl-nl'},
  ],
  schemaTypes: ['page'],
  // Optional:
  weakReferences: false, // default false
  languageField: 'language', // default "language"
})
```

### 2.3 Cleanup schema

You can now remove the `i18n` key from all document schemas, as the schema types the plugin is enabled on are now configured in the plugin function.

## 3. Updating queries

The previous version of the plugin wrote language details to document `_id`s. This behavior was changed in a previous version of the plugin. Matching against the string `_id` of a document is an unreliable and slow way to query for documents.

See the [GROQ and GraphQL examples in the README](https://github.com/sanity-io/document-internationalization/tree/main#code-examples) for how to query for translations.
