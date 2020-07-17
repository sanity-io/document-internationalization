import * as React from 'react';
import moment from 'moment';
import { SanityDocument } from '@sanity/client';
import { IResolverProps, Ti18nSchema, IUseDocumentOperationResult } from '../types';
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

export const PublishWithi18nAction = (props: IResolverProps) => {
  const schema: Ti18nSchema = getSchema(props.type);
  const config = getConfig(schema);
  const baseDocumentId = getBaseIdFromId(props.id);
  const syncState = useSyncState(props.id, props.type);
  const { publish } = useDocumentOperation(props.id, props.type) as IUseDocumentOperationResult;
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
      const languageId = getLanguageFromId(props.id) || getBaseLanguage(langs, config.base).name;

      await client.createIfNotExists({ _id: props.id, _type: props.type, _createdAt: moment().utc().toISOString() });
      await client.patch(props.id, { set: { [fieldName]: languageId } }).commit();
      publish.execute();

      const translatedDocuments = await client.fetch<SanityDocument[]>('*[_id match $id]', {
        id: [...baseDocumentId.split('-').map((id, index) => index === 0 ? `${id}*` : `*${id}*`), '*__i18n_*'],
      });
      if (translatedDocuments.length > 0) {
        await client.createIfNotExists({ _id: baseDocumentId, _type: props.type, _createdAt: moment().utc().toISOString() });
        await client.patch(baseDocumentId, {
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
        }).commit();
      }

      props.onComplete();
    }
  };
}