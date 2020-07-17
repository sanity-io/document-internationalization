# CHANGELOG

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
