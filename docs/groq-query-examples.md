# GROQ query examples

## Query for all documents by a particular language

```
*[_type == "type" && __i18n_lang == $lang]
```

**Note** This may not work on never before published, base language documents if they do not have a `__i18n_lang` field value yet. Avoid this by setting an `initialValue` on your schema.

## Get specific document by language and fallback to base

```
coalesce(
  *[__i18n_base._ref == $id && __i18n_lang == $lang][0],
  *[_id == $id][0]
)
```

## Get all base language documents for a type without language field

```
*[_type == $type && !defined(__i18n_base._ref)]
```

## Get list of all available languages for a given document type

```
*[_type == $type && !defined(__i18n_base._ref)] {
  "languages": [__i18n_lang, ...__i18n_refs[].lang]
}
```
