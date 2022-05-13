# Desk structure

[See the Sanity docs on how to to setup Desk Structure](https://www.sanity.io/guides/getting-started-with-structure-builder) if you do not already have Desk Structure customised in your project.

Once your Studio has its own Desk Structure, you'll want to filter down any Lists for internationalized schema types to just base language documents:

```js
S.listItem()
  .title(`Lesson`)
  .child(
    S.documentList()
      .title(`Lesson documents`)
      .schemaType('lesson')
      .filter('_type == "lesson" && __i18n_lang == $baseLanguage')
      .params({baseLanguage: `en_US`})
      .canHandleIntent(S.documentTypeList('lesson').getCanHandleIntent())
  )
```
