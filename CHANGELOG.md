# CHANGELOG

## v1.0.0
* Migrated original plugin code
* Removed object level translations
* Added additional GROQ examples
* Added a slug uniqueness validator for document level translations (`import { isSlugUnique } from '@sanity/document-internationalization/lib/validators`)
* Fixed issue with `fixIdStructureMismatchDocuments` maintenance function
* `delimiter` is now the default ID structure
* Added maintenance function to add base document ref to translated documents
* Removed the option for overriding UI messages
* Updated language configuration to use "id" field instead of "name"
