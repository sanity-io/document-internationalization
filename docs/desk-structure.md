# Desk structure

[See the Sanity docs on how to to setup Desk Structure](https://www.sanity.io/guides/getting-started-with-structure-builder) if you do not already have Desk Structure customised in your project.

Once your Studio has its own Desk Structure, you can configure the plugin in two ways:

## Method 1: Default implementation

Use this method if you don't already have a custom desk structure of your own.

```js
import * as Structure from '@sanity/document-internationalization/lib/structure'

export const getDefaultDocumentNode = Structure.getDefaultDocumentNode
export default Structure.default
```

## Method 2: Manual implemntation

Use this method if you need to combine your own desk structure implementation with the plugin.

```js
import * as Structure from '@sanity/document-internationalization/lib/structure'

export const getDefaultDocumentNode = (props) => {
  if (props.schemaType === 'myschema') {
    return S.document().views(Structure.getDocumentNodeViewsForSchemaType(props.schemaType))
  }
  return S.document()
}

export default () => {
  const items = Structure.getFilteredDocumentTypeListItems()
  return S.list().id('__root__').title('Content').items(items)
}
```
