# Deleting translated documents

By default, this plugin creates a strong reference between a document and its connected translation metadata document. Because reference integrity is maintained by the API, you cannot delete a document that has a strong reference to it.

## From a document: deleting a single translation

To offset this difficulty, the plugin exports a document action that will allow you to remove the translation reference from the action, before proceeding to delete the document. It is not added by default to your schema types.

![delete translation document action](https://github.com/sanity-io/document-internationalization/assets/9684022/edccb456-f6e1-4782-9602-b279e9689357)

Import into your Studio's config file

```ts
import {
  documentInternationalization,
  DeleteTranslationAction,
} from '@sanity/document-internationalization'

export default defineConfig({
  // ...all other config
  document: {
    actions: (prev, {schemaType}) => {
      // Add to the same schema types you use for internationalization
      if (['page'].includes(schemaType)) {
        // You might also like to filter out the built-in "delete" action
        return [...prev, DeleteTranslationAction]
      }

      return prev
    },
  },
})
```

## From the metadata document: Deleting all translations

The metadata document also contains a "Delete all translations" document action which is queued by default for only that schema type. It will delete all of the documents in the `translations` array of references, as well as the metadata document itself.

![delete all translations document action](https://github.com/sanity-io/document-internationalization/assets/9684022/fda956f1-26e7-430a-aeef-1db4166e9cd6)
