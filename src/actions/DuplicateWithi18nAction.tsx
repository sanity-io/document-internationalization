import React from 'react';
import ContentCopyIcon from 'part:@sanity/base/content-copy-icon'
import { IResolverProps, IUseDocumentOperationResult } from '../types';
import { getConfig, getSanityClient, getBaseIdFromId, getTranslationsFor, buildDocId, getLanguageFromId } from '../utils';
import { useDocumentOperation } from '@sanity/react-hooks';
import { useToast } from '@sanity/ui';
import { uuid } from '@sanity/uuid'

/**
 * This code is mostly taken from the default DuplicateAction provided by Sanity
 */

const DISABLED_REASON_TITLE = {
  NOTHING_TO_DUPLICATE: "This document doesn't yet exist so there's nothing to duplicate",
}

export const DuplicateWithi18nAction = (props: IResolverProps) => {
  const toast = useToast();
  const client = getSanityClient();
  const config = getConfig(props.type);
  const baseDocumentId = getBaseIdFromId(props.id);
  const {duplicate: duplicateOp} = useDocumentOperation(props.id, props.type) as IUseDocumentOperationResult;
  const [isDuplicating, setDuplicating] = React.useState(false);

  const onDuplicate = React.useCallback(async () => {
    setDuplicating(true);
    try {
      const dupeId = uuid();
      const translations = await getTranslationsFor(baseDocumentId);
      const transaction = client.transaction();
      transaction.create({
        ...(props.draft ?? props.published),
        _id: dupeId,
        _type: props.type,
      });
      translations.forEach(t => {
        transaction.create({
          ...t,
          _id: buildDocId(dupeId, getLanguageFromId(t._id)),
        });
      });
      await transaction.commit();
    } catch (err) {
      console.error(err);
      toast.push(err.message);
    }
    setDuplicating(false);
  }, [baseDocumentId, props.onComplete, props.type, props.draft, props.published]);

  return {
    icon: ContentCopyIcon,
    disabled: Boolean(duplicateOp.disabled) || isDuplicating,
    title: (duplicateOp.disabled && DISABLED_REASON_TITLE[duplicateOp.disabled]) || '',
    label: isDuplicating ? config.messages?.duplicateAll?.duplicating : config.messages?.duplicateAll?.buttonTitle,
    onHandle: onDuplicate,
  }
}