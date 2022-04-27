# Usage with Document Actions

## Manual publish implementation

In some cases you may already have a custom publish action defined for your studio. In this scenario the plugin may not work as expected as documents could be missing the language fields.

In order to get the full functionality, you can make use of the `updateIntlFieldsForDocument` function. This is also used internally in the plugin's custom publish action.

Example:

```js
import {updateIntlFieldsForDocument} from '@sanity/document-internationalization/lib/utils'

export const CustomPublishAction = ({id, type, onComplete}) => {
  const {publish} = useDocumentOperation(id, type)

  return {
    onHandle: async () => {
      publish.execute()
      await updateIntlFieldsForDocument(id, type)
      if (onComplete) onComplete()
    },
  }
}
```

## Add additional actions

It is also possible to import all actions "as-is" from the package to add to your actions resolver.

Example:

```js
import {
  PublishWithi18nAction,
  DeleteWithi18nAction,
  DuplicateWithi18nAction,
} from '@sanity/document-internationalization/lib/actions'
import defaultResolve from 'part:@sanity/base/document-actions'

// @README https://www.sanity.io/docs/document-actions
export default function resolveDocumentActions(props) {
  return [
    ...defaultResolve(props),
    PublishWithi18nAction,
    DeleteWithi18nAction,
    DuplicateWithi18nAction,
  ]
}
```

If you do not have a custom publish action defined and want to use the publish action from this plugin, you should replace the default publish action from Sanity core with the imported `PublishWithi18nAction` from this plugin. Doing so will replace the default publish action on the "publish" button in the Sanity studio.

Example:

```js
import {
  PublishWithi18nAction,
  DeleteWithi18nAction,
  DuplicateWithi18nAction,
} from '@sanity/document-internationalization/lib/actions'
import defaultResolve, { PublishAction } from 'part:@sanity/base/document-actions'

// @README https://www.sanity.io/docs/document-actions
export default function resolveDocumentActions(props) {
  return [
    ...defaultResolve(props).map((Action) =>
      Action === PublishAction ? PublishWithi18nAction : Action,
    ),
    DeleteWithi18nAction,
    DuplicateWithi18nAction,
  ]
}
```
