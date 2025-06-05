# Importing plugin components

Some components and functions from the plugin are exported for you to use throughout the Studio.

Imagine you want to [create a custom Tool](https://www.sanity.io/docs/studio-tools) that lists documents but also needs to use languages registered in the plugin configuration, create new translations, show the language of an existing document and link to the metadata document.

Something like this:

![custom-tool](https://github.com/sanity-io/document-internationalization/assets/9684022/66c1cd3d-a964-4632-b57c-998a49a2c9b6)

Now you can!

## useDocumentInternationalizationContext

The `useDocumentInternationalizationContext` hook can be used to access all plugin configuration values, including the result of `supportedLanguages` if it is an async function.

```tsx
import {useDocumentInternationalizationContext} from '@sanity/document-internationalization'

export function MyComponent({doc}: {doc: SanityDocument}) {
  const {languageField} = useDocumentInternationalizationContext()

  return <Badge>{doc[languageField] ?? `No Language`}</Badge>
}
```

## DocumentInternationalizationMenu

The menu button shown at the top of documents can be imported anywhere and requires the published document ID of a document and its schema type to set the language of the document and handle creating new translations and the metadata document.

```tsx
import {DocumentInternationalizationMenu} from '@sanity/document-internationalization'
import {getPublishedId} from 'sanity'

export function MyComponent({_id, _type}) {
  return (
    <DocumentInternationalizationMenu
      documentId={getPublishedId(_id)}
      schemaType={_type}
    />
  )
}
```
