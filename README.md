# Document Internationalization Plugin for Sanity.io

[![npm version](https://img.shields.io/npm/v/@sanity/document-internationalization.svg?style=flat)](https://www.npmjs.com/package/@sanity/document-internationalization)

![Document Level Internationalization UI](img/document-level-translation.gif)

## What this plugin solves

There are two popular methods of internationalization in Sanity Studio:

- **Document-level translation** refers to a schema type having a unique document for every language, joined together by references and/or a predictable `_id`
- **Field-level translation** refers to mapping over languages to create an object, within which there is a language-specific version of each field

You'll need to decide on the approach for each schema individually, and you're likely going to have a mix of both.

This plugin adds UI to the Studio to improve handling **document-level translations**.

For **field-level translations** you should use the [@sanity/language-filter plugin](https://www.npmjs.com/package/@sanity/language-filter).

## Installation

With the [Sanity CLI installed](https://www.sanity.io/docs/getting-started-with-sanity-cli), from the same directory as the Studio run:

```
sanity install @sanity/document-internationalization
```

Ensure that `@sanity/document-internationalization` is listed in `plugins` inside `sanity.json`.

The plugin is now installed, but you will need to complete the following steps to see the Document Translation UI:

## Setup next steps

1. [Customise Desk Structure](docs/desk-structure.md)  
   To setup the 'Translations' View Pane on Documents
2. [Configuration options](docs/configuration-options.md)  
   To declare available Languages and other settings
3. [Activating internationalization on schema](docs/activating-internationalization-on-schema.md)  
   To enable all the above features on schema

## Other documentation

1. [Data structure](docs/datastructure-intl-doc.md)
2. [Translation Maintenance](docs/translation-maintenance.md)
3. [GraphQL support](docs/graphql-intl-doc.md)
4. [Advanced languages](docs/advanced-languages.md)
5. [Usage with custom publish action](docs/usage-with-custom-publish.md)
6. [GROQ Cheatsheet](/docs/groq-cheatsheet.md)

## Migrating from sanity-plugin-intl-input

While most of the UI is the same in the official version of this plugin there are some breaking changes you should be aware of before migrating:

[Coming from sanity-plugin-intl-input](docs/coming-from-sanity-plugin-intl-input.md)
