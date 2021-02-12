# CHANGELOG
## v5.0.6
* Include `config.dist.json` in the `package.json` files property as it was missing from the npm package.

## v5.0.5
* Fix `referenceBehavior` not accepting the user config

## v5.0.4
* [#16](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/16) Added `referenceBehavior` setting (allowing users to choose whether they want references from the parent document, to the translations)
* [#17](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/17) Fixed an issue where nested object types did not support the i18n field.
* [#15](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/15) Fixed missing sorting menu
* Added `idStructure` setting (allowing users to choose between subpath IDs and delimiter IDs)

## v5.0.3
* Updated document list filter to include root drafts

## v5.0.2
* Added `config.dist.json`

## v5.0.1
* Improved installation instructions

## v5.0.0
**Breaking Change**
* From V5 on the translated document ID's will change to the following structure `i18n.base-id.lang`.
* A new tab was added to the desk structure called `Translation Maintenance`, which enables users to clean up and fix existing data (as well as migrate from V4 to V5)
* Base documents will now contain a new field called `__i18n_refs` (by default) which is an array of references to its translations.
* A new option was added to the actions of the base document to remove itself and all its translations

## v4.0.1
Updated `StateLink` with `IntentLink` to better support custom desk structures. (thanks to @p10e)

## v4.0.0
**Breaking Change**
Implementing the desk structure now has to be done manually. 

## v3.1.0
Added the `fieldNames` option to change the names of the fields the plugin automatically injects.
At this time there is only 1 field you can change which is called `lang` (by default the value of this is `__i18n_lang`).
