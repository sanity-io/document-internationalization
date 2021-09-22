import * as React from 'react';
import { IResolverProps, Ti18nSchema, IUseDocumentOperationResult } from '../types';
import { useDocumentOperation, useSyncState, useValidationStatus } from '@sanity/react-hooks';
import { useToast } from '@sanity/ui';
import { CheckmarkIcon, PublishIcon } from '@sanity/icons'
import {
  getSchema,
  getConfig,
  updateIntlFieldsForDocument,
} from '../utils';

export const PublishWithi18nAction = ({ type, id, draft, onComplete }: IResolverProps) => {
  const toast = useToast();
  const [publishState, setPublishState] = React.useState<'publishing' | 'published' | null>(null);
  const [updatingIntlFields, setUpdatingIntlFields] = React.useState(false);
  const { publish } = useDocumentOperation(id, type) as IUseDocumentOperationResult;
  const { isValidating, markers } = useValidationStatus(id, type);
  // @ts-ignore
  const syncState = useSyncState(id, type);
  const schema = React.useMemo<Ti18nSchema>(() => getSchema(type), [type]);
  const config = React.useMemo(() => getConfig(schema), [schema]);

  const disabled = React.useMemo(() => (
    publishState === 'published'
    || publishState === 'publishing'
    || updatingIntlFields
    || publish.disabled
    || syncState.isSyncing
    || isValidating
    || markers.some(marker => marker.level === 'error')
  ), [publishState, updatingIntlFields, syncState.isSyncing, isValidating, markers]);

  const doUpdateIntlFields = React.useCallback(async () => {
    setUpdatingIntlFields(true);
    try {
      await updateIntlFieldsForDocument(id, type);
      toast.push({
        closable: true,
        status: 'success',
        title: config.messages?.intlFieldsUpdated,
      });
    } catch (err) {
      console.error(err);
      toast.push({
        closable: true,
        status: 'error',
        title: err.toString(),
      });
    }
    setUpdatingIntlFields(false);
  }, [config, toast, id, type]);

  const onHandle = React.useCallback(() => {
    setPublishState('publishing');
    publish.execute();
  }, [publishState, publish, onComplete]);

  React.useEffect(() => {
    // @README code inspired by @sanity/desk-tool PublishAction.tsx
    const didPublish = publishState === 'publishing' && !draft;
    if (didPublish) {
      doUpdateIntlFields().then(() => {
        if (onComplete) onComplete();
      });
    }

    const nextState = didPublish ? 'published' : null
    const delay = didPublish ? 200 : 4000
    const timer = setTimeout(() => {
      setPublishState(nextState)
    }, delay)
    return () => clearTimeout(timer)
  }, [publishState, draft]);

  return {
    disabled,
    label: publishState === 'publishing'
      ? config.messages?.publishing
      : (updatingIntlFields ? config.messages?.updatingIntlFields : config.messages?.publish),
    icon: publishState === 'published' ? CheckmarkIcon : PublishIcon,
    shortcut: disabled ? null : 'Ctrl+Alt+P',
    onHandle,
  };
}