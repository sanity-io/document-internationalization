# Coming from sanity-plugin-intl-input
**If you are looking for object level translation, please follow the [migration guide](https://github.com/LiamMartens/sanity-plugin-intl-input/blob/develop/docs/object-level-migration.md)**

If you are using document level translations you will notice some difference in the new plugin. In order to make the transition as smooth as possible here is a list of what's changed and what you need to do

### 1. The config filename has changed
You should rename your `intl-input.json` config file to `document-internationalization.json`.

### 2. Delimiter based IDs are now the default again
After consideration with the team, we have decided to make `delimiter` based IDs the default structure again. `subpath` based IDs will still be supported but are now opt-in only. If you are using subpaths you have 2 options:

1. Keep using them as is by explicitly specifying the id structure in the config
```diff
{
+ "idStructure": "subpath"
}
```

2. Switch to delimiter based IDs
   1. Check if you have explicitly specified `subpath` in your intl config. If you have, you can either remove it or replace it with `delimiter`
   2. You can use the maintenance tab to migrate your documents to the new ID structure, however keep in mind because this is an ID change you will **lose all verion history**



### 3. The languages configuration has changed
The "name" field is now called "id". The old field will still be supported but you will see a deprecation notice.

### 4. The "hard" reference behavior has been renamed to "strong"
You will need to update your config to reflect this change.

### 5. Studio parts have been renamed
If you had implemnted any of the previous plugin's studio parts you will need to rename the implementations.
```diff
[
  {
+   "name": "part:@sanity/document-internationalization/languages/loader",
-   "name": "part:sanity-plugin-intl-input/languages/loader",
    "description": "User implementable languages loader function"
  },
  {
+   "name": "part:@sanity/document-internationalization/languages/should-reload",
-   "name": "part:sanity-plugin-intl-input/languages/should-reload",
    "description": "User implementable function determening whether the languages should be reloaded"
  },
  {
+   "name": "part:@sanity/document-internationalization/ui/flags",
-   "name": "part:sanity-plugin-intl-input/ui/flags",
    "description": "Part can be implemented to override default flag"
  }
]
```

### 6. A new field called __i18n_base was introduced for translations
A new field was introduced which will now be available in translations. The `__i18n_base` field will contain a reference to the base language document similar to how the base document references it's translations. If you are coming from the old plugin you will need to use the "Translation maintenance" to fix the missing fields in your existing translations. This field is not critical but will help with querying your documents.

### 7. The refs structure has changed
The refs field linking your base document to it's translations has changed in structure. The original structure was as follows:
```json
[{
   "_key": "array-key",
   "lang": "nl-nl",
   "ref": {
      "_type": "reference",
      "_ref": "ref-id"
   }
}]
```

In the new plugin you will find it has been simplified to just be an array of references:
```json
[{
   "_key": "array-key",
   "_type": "reference",
   "_ref": "ref-id"
}]
```

Any existing documents will remain unchanged unless "fixed" using the translation maintenance. Old documents will show up as having missing references.
