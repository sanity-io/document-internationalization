# CHANGELOG

## v5.3.0
* [#60](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/60) Improved publish with I18n action and expose "updateIntlFieldsForDocument" action (ie to be used with custom publish action)
* [#72](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/72) Updated custom delete action
* It is now possible to define a custom loader and reload function for loading languages.
* It is now possible to import all custom actions from the plugin for re-use or customization.
* The Intl plugin received a visual overhaul for better consistency with the "native" Sanity UI (thanks to [SimeonGriggs](https://github.com/SimeonGriggs))

## v5.2.1
* [#58](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/58) Only disable publishing when there are errors (no warnings)

## v5.2.0
* Updated Publish with i18n with transactions to reduce webhook triggers
* Implemented maintenance operation for fixing base language fields
* [#46](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/46) Publish with i18n action now takes into account validation errors
* [#25](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/25) The maintenance operations now exclude draft documents
* [#30](https://github.com/LiamMartens/sanity-plugin-intl-input/issues/30) Now includes `Duplicate (Incl. translations)` action

## v5.1.0
* Updated the i18n input component to be in line with Sanity v2.x
* Export `LanguageBadge` from badges
* Fixed Intl object for Sanity v2.9.x
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
