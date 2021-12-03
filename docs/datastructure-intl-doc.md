# Resulting data structure
There are 4 aspects to the document wide translation

1. Each document will have a new property called `__i18n_lang` (you can customize this by setting the `fieldNames.lang` property in the `i18n` settings object) which contains the name of the language of this document.
```json
{
  "_id": "document-id",
  "_type": "document-type",
  "__i18n_lang": "en_US"
}
```

2. Each translated document will additionally have a new field called `__i18n_base` (this can also be customized in the config) which contains a reference to the base language document.
```json
{
  "_id": "document-id__i18n_lang",
  "_type": "document-type",
  "__i18n_base": {
    "_type": "reference",
    "_weak": false,
    "ref": "document-id",
  }
}
```

2. Translated documents will have following ID structure: `{base-document-id}__i18n_{lang}`. These predictable IDs make it easier to find translated documents.

2. The base language document will have a property called `__i18n_refs` (you can customize this by setting the `fieldNames.references` property in the `i18n` settings object) which contains references to the translated documents (per language).
```json
{
  "_id": "document-id",
  "_type": "document-type",
  "__i18n_lang": "en_US",
  "__i18n_refs": [
    {
      "lang": "nl_NL",
      "ref": {
        "_type": "reference",
        "_id": "document-id__i18n_nl_NL"
      }
    }
  ]
}
```