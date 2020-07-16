import * as React from 'react';
import { SanityDocument } from '@sanity/client';
import { IResolverProps, Ti18nSchema } from '../types';
import { useDocumentOperation, useSyncState } from '@sanity/react-hooks';
import {
  getSchema,
  getLanguagesFromOption,
  getBaseLanguage,
  getLanguageFromId,
  getLangFieldNameFromSchema,
  getBaseIdFromId,
  getReferencesFieldNameFromSchema,
  getSanityClient,
  makeObjectKey,
  getConfig,
} from '../utils';

interface IUseDocumentOperationResult {
  patch: any;
  publish: any;
}

export const PublishWithi18nAction = (props: IResolverProps) => {
  const schema: Ti18nSchema = getSchema(props.type);
  const config = getConfig(schema);
  const baseDocumentId = getBaseIdFromId(props.id);
  const syncState = useSyncState(props.id, props.type);
  const { patch, publish } = useDocumentOperation(props.id, props.type) as IUseDocumentOperationResult;
  const { patch: basePatch, patch: basePublish } = useDocumentOperation(baseDocumentId, props.type) as IUseDocumentOperationResult;
  const [publishing, setPublishing] = React.useState(false);

  React.useEffect(() => {
    if (publishing && !props.draft) setPublishing(false);
  }, [publish.disabled, props.draft, syncState.isSyncing]);

  return {
    disabled:
      publishing
      || publish.disabled
      || syncState.isSyncing,
    label: publishing
      ? config.messages.publishing
      : config.messages.publish,
    onHandle: async () => {
      setPublishing(true);
      const client = getSanityClient();
      const fieldName = getLangFieldNameFromSchema(schema);
      const refsFieldName = getReferencesFieldNameFromSchema(schema);
      const langs = await getLanguagesFromOption(config.languages);
      const translatedDocuments = await client.fetch<SanityDocument[]>('*[_id match $id]', {
        id: `${baseDocumentId}__i18n_*`
      });
      const languageId = getLanguageFromId(props.id) || getBaseLanguage(langs, config.base).name;
      if (translatedDocuments.length > 0) {
        basePatch.execute([{
          set: {
            [refsFieldName]: translatedDocuments.reduce((acc, doc) => {
              const lang = getLanguageFromId(doc._id);
              acc[makeObjectKey(lang)] = {
                _type: 'reference',
                _ref: doc._id,
              };
              return acc;
            }, {})
          }
        }]);
      }
      patch.execute([{ set: { [fieldName]: languageId } }]);
      basePublish.execute();
      publish.execute();
      props.onComplete();
    }
  };
}