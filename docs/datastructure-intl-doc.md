# Resulting data structure - Document wide translation
There are 3 aspects to the document wide translation
1. Each document will have a new property called `__i18n_lang` (you can customize this by setting the `fieldNames.lang` property in the `i18n` settings object) which contains the name of the language of this document.
```json
{
  "_id": "document-id",
  "_type": "document-type",
  "__i18n_lang": "en_US"
}
```

2. The id will also contain a suffix as follows `xxx-xxx-xx__i18n_{lang}`. (eg `document-id__i18n_en_US`)

3. The base language document will have a property called `__i18n_refs` (you can customize this by setting the `fieldNames.references` property in the `i18n` settings object) which contains references to the translated documents (per language).
```json
{
  "_id": "document-id",
  "_type": "document-type",
  "__i18n_lang": "en_US"
  "__i18n_refs": {
    "nl_NL": {
      "_type": "reference",
      "_id": "document-id__i18n_nl_NL"
    }
  }
}
```