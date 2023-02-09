# Usage with Document Actions

## Manual publish implementation

In some cases you may already have a custom publish action defined for your studio. In this scenario the plugin may not work as expected as documents could be missing the language fields.

In order to get the full functionality, you can make use of the `updateIntlFieldsForDocument` function. This is also used internally in the plugin's custom publish action. This function will update the base language document or a translation document as necessary to give them the right references.

Example:

```tsx
// ./src/actions/CustomPublishAction.tsx

import {
  updateIntlFieldsForDocument,
  useConfig,
  getBaseIdFromId,
} from '@sanity/document-internationalization'
import {DocumentActionComponent, useClient, useDocumentOperation, useEditState} from 'sanity'

// re-use from your plugin config
import {i18nConfig} from '../../sanity.config'

export const CustomPublishAction: DocumentActionComponent = (props) => {
  const {id, type, onComplete, draft, published} = props
  const document = draft || published
  const {publish} = useDocumentOperation(id, type)
  const client = useClient({apiVersion: `2023-01-01`})
  const config = useConfig(i18nConfig, type)

  const baseDocumentId = getBaseIdFromId(id)
  const baseDocumentEditState = useEditState(baseDocumentId, type)

  return {
    label: 'Custom Publish',
    disabled: !draft,
    onHandle: async () => {
      publish.execute()
      if (document) {
        // This function will update the base document
        // or translations as necessary
        await updateIntlFieldsForDocument(
          client,
          config,
          document,
          baseDocumentEditState?.published ?? undefined
        )
      }
      if (onComplete) onComplete()
    },
  }
}

```

## Add additional actions

It is also possible to import all actions "as-is" from the package to add to your actions resolver.

Example:

```js
// ./sanity.config.ts

import { 
  documentI18n,
  createPublishAction,
  createDeleteAction,
  createDuplicateAction
 } from "@sanity/document-internationalization";

 const i18nConfig = { /* ... */ }

export default defineConfig({
  // ... other config settings
  plugins: [
    // ... other plugins
    documentI18n(i18nConfig),
  ],

  document: {
    actions: (prev, context) => {
      return [
        ...prev,
        createPublishAction(i18nConfig),
        createDeleteAction(i18nConfig),
        createDuplicateAction(i18nConfig),
      ]
    }
  },
})
```

If you do not have a custom publish action defined and want to use the publish action from this plugin, you should replace the default publish action from Sanity core with the imported `createPublishAction` from this plugin.

Doing so will replace the default publish action on the "publish" button in the Sanity studio.

Example:

```js
// ./sanity.config.ts

import { 
  documentI18n,
  createPublishAction,
  createDeleteAction,
  createDuplicateAction
 } from "@sanity/document-internationalization";

 const i18nConfig = { /* ... */ }

export default defineConfig({
  // ... other config settings
  plugins: [
    // ... other plugins
    documentI18n(i18nConfig),
  ],

  document: {
    actions: (prev, context) => {
      return [
        ...prev.map((Action) =>
          Action.action === 'publish' ? createPublishAction(i18nConfig) : Action
        ),
        createDeleteAction(i18nConfig),
        createDuplicateAction(i18nConfig),
      ]
    }
  },
})
```
