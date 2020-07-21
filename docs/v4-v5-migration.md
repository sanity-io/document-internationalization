# V4 to V5 migration
## ID structure change
The ID structure has changed between V4 to V5 from `{base-document-id}__i18n_{lang}` to `i18n.{base-document-id}.{lang}`. To migrate this you can do 2 things:
1. Migrate it manually using your own script
2. Use the [Maintenance Tab](./translation-maintenance.md) to update the ID's automatically (this might not work if the translated document's have been referenced)

Make sure you also update your own queries to take into account this new structure. Following example queries can be useful:
1. Query all translations for a single document ID
```
*[_id in path("i18n.document-id.*")]
```
2. Query the base document and join one translation
```
*[_id in "document-id"] {
  __i18n_refs[lang == "nl_NL"] {
    lang,
    ref->{...}
  }
}
```
3. Query the base document and join all translations
```
*[_id in "document-id"] {
  __i18n_refs {
    lang,
    ref->{...}
  }
}
```

## Additional config
A new configuration file should be added in your studios `config` folder called `intl-input.json`. If you do not intend to configure your settings globally you can simply leave it with an empty `{}`