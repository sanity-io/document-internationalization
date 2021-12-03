# General Configuration
To configure the plugin you can customieze the config file called `intl-input.json` in your studio's `config` folder. If you need specific configuration you can keep in mind, any global config can be overriden per schema.  

Below are all available configuration options.
* `base`: This is the ID of the base/default language (if not specified the first language is used)
* `languages`: This option specifies the available language options. This can be any of the following (see [Advanced Languages](./advanced-languages.md) for more information)
  * Simple list of language ID strings
  * List of language objects (containing `name` and `title`)
  * GROQ query option
* `idStructure`: Can be `subpath` (default) or `delimiter`. This option defines how the translated documents are saved.
* `referenceBehavior`: Can be `hard` (default), `weak` or `disabled`. This option defines how the translated documents are referenced in the parent document
* `fieldNames`: This option configures the field names used for document wide translation
  * `lang`: The name of the language field (`__i18n_lang`)
  * `references`: The name of the references field (`__i18n_refs`)
  * `baseReference`: The name of the base reference field (`__i18n_base`)
* `messages`: These are the configurable messages. Can be used to override the default English messages, labels and titles.
  * `publishing`: Defaults to `Publishing...`
  * `publish`: Defaults to `Publish`
  * `loading`: Defaults to `Loading languages...`
  * `missing`: Defaults to `Missing`
  * `draft`: Defaults to `Draft`
  * `missingTranslations`: Defaults to `Following languages are missing some translations compared to the base language`
  * `deleteAll`
    * `buttonTitle`: Defaults to `Delete (incl. translations)`
    * `deleting`: Defaults to `Deleting...`
  * `translationsMaintenance`
      * `title`: Defaults to `Translation Maintenance`
      * `selectSchemaPlaceholder`: Defaults to `Select schema type`
      * `idStructureMismatch`: Defaults to `document(s) with mismatched ID structures`
      * `missingLanguageField`: Defaults to `document(s) are missing the language field`
      * `missingDocumentRefs`: Defaults to `document(s) have missing translation references`
      * `orphanDocuments`: Defaults to `orphaned translation document(s)`
      * `referenceBehaviorMismatch`: Defaults to `document(s) with mismatched reference behaviors`
      * `fix`: Defaults to `Fix`
