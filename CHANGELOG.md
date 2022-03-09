# CHANGELOG

## v0.0.1-beta.11
* [#124](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/124) Updates an internal import to support the minor bump from `@sanity/desk-tool@2.28.0`
## v0.0.1-beta.10
* Fixed [#27](https://github.com/sanity-io/document-internationalization/issues/27)

## v0.0.1-beta.9
* Fixed a bug with the `fixBaseLanguageMismatch` method as it was not considering the field name configuration

## v0.0.1-beta.8
* Migrated original plugin code
* Removed object level translations
* Added additional GROQ examples
* Added a slug uniqueness validator for document level translations (`import { isSlugUnique } from '@sanity/document-internationalization/lib/validators`)
* Fixed issue with `fixIdStructureMismatchDocuments` maintenance function
* `delimiter` is now the default ID structure
* Added maintenance function to add base document ref to translated documents
* Removed the option for overriding UI messages
* Updated language configuration to use "id" field instead of "name"
* Updated studio parts to use new plugin name
* Renamed "hard" to "strong" for configuring the reference behavior
* The references from the base document to the translated ones will now receive the language code as their key