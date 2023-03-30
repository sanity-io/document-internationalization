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

## getFilteredDocumentTypeListItems

As a convenience for the above, `getFilteredDocumentTypeListItems` exists.
It filters all default document lists down to base languages


(S, {schema)

```js
import { 
  documentI18n,
  getFilteredDocumentTypeListItems
} from '@sanity/document-internationalization'

const i18nConfig = {
  // The language configuration you used for documentI18n()
  /* 
   * base: "it",
   * languages: [
   *   {
   *     title: "Italiano",
   *     id: "it"
   *   },
   *   {
   *     title: "English (US)",
   *     id: "en-us"
   *   }
   * ],
     ...
   */
}

export default defineConfig({
  // ...
  plugins: [
    documentI18n({ /* i18nConfig... */}),
    deskTool({
      structure: (S, {schema}) => {
        const docTypeListItems = getFilteredDocumentTypeListItems({
          S,
          schema,
          config: i18nConfig,
        });

        return S.list()
          .title("Content")
          .items([
            //anything else
            ...docTypeListItems,
            //anything else
           ])
      },
    }),
  ],
})
```
