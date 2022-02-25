# CHANGELOG

## v0.0.1-beta.9
**BREAKING**  
**The `getDocumentNodeViewsForSchemaType` function has been removed as it is not required anymore**
* The language selector has been updated to better align with the official language-filter plugin for field level translations. This does mean it is not required to implement `getDefaultDocumentNode` any more as the new UI does not require a custom desk structure but rather integrates with the studio natively.

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