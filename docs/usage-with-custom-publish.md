# Usage with custom publish action
In some cases you may already have a custom publish action defined for your studio. In this scenario the i18n may not work as expected as documents could be missing the language fields. In order to get the full functionality, you can make use of the `updateIntlFieldsForDocument` function. This is also used internally in the plugin's custom publish action.

Example:
```js
import { updateIntlFieldsForDocument } from 'sanity-plugin-intl-input/lib/utils';

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