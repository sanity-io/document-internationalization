# Enabling and configuring the plugin

To enable the plugin you will be modifying your `sanity.config.ts` (or `sanity.config.js` file).
We will assume the following starting scenario:
```js
import {deskTool} from 'sanity/desk'

export default defineConfig({
  plugins: [deskTool()]
})
```

## The automatic way
The simplest way to enable and configure the plugin is to use the exported `withDocumentI18nPlugin` method.
This function wraps your `plugins` array and will automatically add the i18n plugin as well as the desk tool plugin (assuming you don't need any custom desk structure options)

Your configuration file will look something like this:

```js
import { withDocumentI18nPlugin } from '@sanity/document-internationalization'

export default defineConfig({
  // ...
  plugins: withDocumentI18nPlugin([
    // ... other plugins
  ], {
    // .. your i18n config
  })
})
```

## The manual way
If you need to customize your desk structure you will need to manually configure the `deskTool` plugin.
This is still done with the `withDocumentI18nPlugin` function but you will pass a function as the first argument as opposed to the plugins array itself and you will also need to disable the automatic inclusion of the desk tool plugin.
The function will receive the i18n config as it's first argument, this is to make sure you won't need to duplicate your config.
Lastly to configure the desk tool you can use the `getDocumentList` function.
If you need even more control, you can refer to the more advanced [desk structure documentation](./desk-structure.md)

```js
import {deskTool} from 'sanity/desk'
import {withDocumentI18nPlugin, getDocumentList} from '@sanity/document-internationalization'

export default defineConfig({
  // ...
  plugins: withDocumentI18nPlugin((pluginConfig) => ([
    // ... other plugins
    deskTool({
      structure: (S, {schema}) => getDocumentList({S, schema, config: pluginConfig}),
    })
  ]), {
    includeDeskTool: false,
    // .. your i18n config
  })
})

export default defineConfig({
  // ...
  plugins: [
    documentI18n(
      {
        // .. config goes here
      }
    ),
  ] 
})
```

This sets a static, global set of defaults which are invoked on every schema that contains `i18n: true`. 
These defaults can be overridden on each schema.

## Configuration options

### `base`

This is the ID of the base/default language. If unspecified, the first language is used.

### `languages`

This option specifies the available language options. This can be any of the following:

1. Array of language ID strings

```json
"languages": ["en", "fr"]
```

2. Array of language objects

```json
"languages": [
  {"id": "en", "title": "English"},
  {"id": "fr", "title": "French"},
]
```

3. GROQ query

```json
"languages": {
  "query": "*[_type == 'language']{ _id, name}",
}
```

See [Advanced Languages](./advanced-languages.md) for more information.

### `idStructure`

Can be `delimiter` (default) or `subpath`.

The plugin will create references between base and translated documents, and so it should be reliable to query related documents by **reference**, rather than by matching `_id` strings.

The differences below are related to querying for documents based on the `_id`:

| ID structure          | Advantages                                                | Disadvantages                                                                                                                                                                                                                  | Example `_id`s                  |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `delimiter` (default) | Makes documents available without access token            | Querying translated documents by `_id` is more tricky as it requires some odd usage of `match` (e.g. to fetch the translations for document ID `a-b-c`, you need to use following query `*[_id match ["a", "b", "c__i18n_*"]]`) | `asdf-123` `asdf-1234__i18n_fr` |
| `subpath`             | Simpler querying by `_id` using `*[_id in path(i18n.**)]` | Subpaths make documents private, meaning they can only be accessed using an access token, which may increase API usage.                                                                                                        | `asdf-1234` `i18n.asdf-1234.fr` |

### `referenceBehavior`

| Behavior name    | Description                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `strong` (default) | This setting adds strong references from your base document to its translations. This makes it so you can not remove the translations afterwards without removing the base document. |
| `weak`           | This settings adds weak references from your base document to its translations. This allows the removal of translations.                                                           |
| `disabled`       | This option completely disables this behavior                                                                                                                                      |

### withTranslationsMaintenance
This option can be enabled to show the "Translation maintenance" tab in the desk structure. This is disabled by default as it is an advanced feature and could potentially lead to unexpected behavior.
You can read more about what it can and can't do on the [Translation Maintenance Info Page](./translation-maintenance.md)

### `fieldNames`

This option configures the field names used by the plugin

- `lang`: The name of the language field `__i18n_lang` (default)
- `references`: The name of the references field `__i18n_refs` (default)
- `baseReference`: The name of the base reference field `__i18n_base` (default)

## Complete example

```js
import { documentI18n } from "@sanity/document-internationalization";

export default defineConfig({
  // ...
  plugins: [
    documentI18n({
      "base": "en-us",
      "languages": [
        {
          "title": "English (US)",
          "id": "en-us"
        },
        {
          "title": "Dutch (NL)",
          "id": "nl-nl"
        }
      ],
      "idStructure": "delimiter",
      "referenceBehavior": "strong",
      "withTranslationsMaintenance": false,
      "fieldNames": {
        "lang": "__i18n_lang",
        "references": "__i18n_refs",
        "baseReference": "__i18n_base"
      }
    })
  ]
})
```
