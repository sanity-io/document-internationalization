# Usage with Document Actions
## Manual publish implementation
In some cases you may already have a custom publish action defined for your studio. In this scenario the i18n may not work as expected as documents could be missing the language fields. In order to get the full functionality, you can make use of the `updateIntlFieldsForDocument` function. This is also used internally in the plugin's custom publish action.

Example:
```js
import { updateIntlFieldsForDocument } from '@sanity/document-internationalization/lib/utils';

export const CustomPublishAction = ({ id, type, onComplete }) => {
  const { publish } = useDocumentOperation(id, type);

  return {
    onHandle: async () => {
      publish.execute();
      await updateIntlFieldsForDocument(id, type);
      if (onComplete) onComplete();
    }
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
  DuplicateWithi18nAction
} from '@sanity/document-internationalization/lib/actions';
import defaultResolve from 'part:@sanity/base/document-actions'

// @README https://www.sanity.io/docs/document-actions
export default function resolveDocumentActions(props) {
  return [...defaultResolve(props), PublishWithi18nAction, DeleteWithi18nAction, DuplicateWithi18nAction]
}
```