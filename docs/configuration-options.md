# Configuration options

To configure the plugin you can customize the config file called `document-internationalization.json` in your studio's `config` folder.

This sets a static, global set of defaults which are invoked on every schema that contains `i18n: true`. These defaults can be overriden on each schema.

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
  [{"id": "en", "title": "English"}],
  [{"id": "fr", "title": "French"}],
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
| `delimiter` (default) | Makes documents available without access token            | Querying translated documents by `_id` is more tricky as it requires some odd usage of `match` (eg. to fetch the translations for document ID `a-b-c`, you need to use following query `*[_id match ["a", "b", "c__i18n_*"]]`) | `asdf-123` `asdf-1234__i18n_fr` |
| `subpath`             | Simpler querying by `_id` using `*[_id in path(i18n.**)]` | Subpaths make documents private, meaning they can only be accessed using an access token, which may increase API usage.                                                                                                        | `asdf-1234` `i18n.asdf-1234.fr` |

### `referenceBehavior`

| Behavior name    | Description                                                                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hard` (default) | This setting adds hard references from your base document to its translations. This makes it so you can not remove the translations afterwards without removing the base document. |
| `weak`           | This settings adds weak references from your base document to its translations. This allows the removal of translations.                                                           |
| `disabled`       | This option completely disables this behavior                                                                                                                                      |

### `fieldNames`

This option configures the field names used by the plugin

- `lang`: The name of the language field `__i18n_lang` (default)
- `references`: The name of the references field `__i18n_refs` (default)
- `baseReference`: The name of the base reference field `__i18n_base` (default)

## Complete example

```json
{
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
  "referenceBehavior": "hard",
  "fieldNames": {
    "lang": "__i18n_lang",
    "references": "__i18n_refs",
    "baseReference": "__i18n_base"
  }
}
```
