# GROQ Cheatsheet
This only applies to document wide translations.

## Query by language
```
*[_type == "type" && __i18n_lang == $lang]
```
**Note** This will not work on never before published, base language documents because they will not have the `__i18n_lang` field yet.

## Get specific document by language and fallback to base
```
coalesce(
  *[__i18n_base.ref == $id && __i18n_lang == $lang][0],
  *[_id == $id][0]
)
```


## Get all base language documents for a type without language field
```
*[_type == $type && !defined(__i18n_base.ref)]
```

## Get list of all available languages for a given document type
```
*[_type == $type && !defined(__i18n_base.ref)] {
  "languages": [__i18n_lang, ...__i18n_refs[].lang]
}
```
