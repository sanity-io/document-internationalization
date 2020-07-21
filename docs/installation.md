# Installation
1. Install the plugin using `npm`, `yarn` or the sanity cli
`yarn add sanity-plugin-intl-input`
`sanity install intl-input`
2. Add the plugin in the `sanity.json` of your project
```
{
  "root": true,
  "project": {
    "name": "..."
  },
  "plugins": [
    "...",
    "intl-input" // <--
  ]
}
```
3. The plugin has a custom desk structure to hide translated documents from the main view. You need to manually implement this as follows
Add the part in `sanity.json`
```
{
  ...
  "parts": [
    ...
    {
      "name": "part:@sanity/desk-tool/structure",
      "path": "./deskStructure.js"
    }
  ]
  ...
}
```

Implement the structure
```javascript
import * as Structure from 'sanity-plugin-intl-input/lib/structure';

// default implementation by re-exporting
export const getDefaultDocumentNode = Structure.getDefaultDocumentNode;
export default Structure.default;

// or manual implementation to use with your own custom desk structure
export const getDefaultDocumentNode = (props) => {
    if (props.schemaType === 'myschema') {
        return S.document().views(Structure.getDocumentNodeViewsForSchemaType(props.schemaType));
    }
    return S.document();
};

export default () => {
  const items = Structure.getFilteredDocumentTypeListItems();
  return S.list()
      .id('__root__')
      .title('Content')
      .items(items);
};
```

4. Add the configuration file in your studio's config folder. It should be called `intl-input.json` and needs to be an empty object `{}`.
Additional configuration options can be found on the [configuration page](./general-configuration.md)