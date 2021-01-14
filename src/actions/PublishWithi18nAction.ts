import * as React from 'react';
import moment, { lang } from 'moment';
import { SanityDocument, Patch } from '@sanity/client';
import { IResolverProps, Ti18nSchema, IUseDocumentOperationResult } from '../types';
import { useDocumentOperation, useSyncState } from '@sanity/react-hooks';
import {
  getSchema,
  getLanguagesFromOption,
  getBaseLanguage,
  getLanguageFromId,
  getBaseIdFromId,
  getSanityClient,
  getConfig,
  buildDocId,
} from '../utils';
import { ReferenceBehavior } from '../constants';

export const PublishWithi18nAction = (props: IResolverProps) => {
  const schema: Ti18nSchema = getSchema(props.type);
  const config = getConfig(schema);
  const baseDocumentId = getBaseIdFromId(props.id);
  const syncState = useSyncState(props.id);
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
      ? config.messages?.publishing
      : config.messages?.publish,
    onHandle: async () => {
      setPublishing(true);
      const client = getSanityClient();
      const fieldName = config.fieldNames.lang;
      const refsFieldName = config.fieldNames.references;
      const langs = await getLanguagesFromOption(config.languages);
      const languageId = getLanguageFromId(props.id) || getBaseLanguage(langs, config.base)?.name;

      await client.createIfNotExists({ _id: props.id, _type: props.type, _createdAt: moment().utc().toISOString() });
      await client.patch(props.draft?._id || props.id, { set: { [fieldName]: languageId } }).commit();
      publish.execute();

      const translatedDocuments = await client.fetch<SanityDocument[]>('*[_id in path($path)]', {
        path: buildDocId(baseDocumentId, '*')
      });
      if (translatedDocuments.length > 0) {
        await client.createIfNotExists({ _id: baseDocumentId, _type: props.type, _createdAt: moment().utc().toISOString() });
        await client.patch(baseDocumentId, {
          set: {
            [refsFieldName]: (config.referenceBehavior !== ReferenceBehavior.DISABLED) ? translatedDocuments.map((doc) => {
              const lang = getLanguageFromId(doc._id);
              return {
                _key: doc._id,
                lang,
                ref: {
                  _type: 'reference',
                  _ref: doc._id,
                  _weak: config.referenceBehavior === ReferenceBehavior.WEAK ? true : false,
                }
              };
            }, {}) : []
          }
        }).commit();
      }

      props.onComplete && props.onComplete();
    }
  };
}