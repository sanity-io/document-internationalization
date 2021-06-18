import * as React from 'react';
import moment from 'moment';
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
  getTranslationsFor,
} from '../utils';
import { ReferenceBehavior } from '../constants';

export const PublishWithi18nAction = (props: IResolverProps) => {
  const schema: Ti18nSchema = getSchema(props.type);
  const config = getConfig(schema);
  const baseDocumentId = getBaseIdFromId(props.id);
  const syncState = (useSyncState as any)(props.id, props.type); // typing does not accept type anymore - used to be required --> @TODO remove if possible
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

      const saveTransaction = client.transaction();
      saveTransaction.createIfNotExists({ _id: props.id, _type: props.type, _createdAt: moment().utc().toISOString() });
      saveTransaction.patch(props.draft?._id || props.id, { set: { [fieldName]: languageId } });
      await saveTransaction.commit();
      publish.execute();

      const translatedDocuments = await getTranslationsFor(baseDocumentId);
      if (translatedDocuments.length > 0) {
        const basedocTransaction = client.transaction();
        basedocTransaction.createIfNotExists({ _id: baseDocumentId, _type: props.type, _createdAt: moment().utc().toISOString() });
        basedocTransaction.patch(baseDocumentId, {
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
        });
        await basedocTransaction.commit();
      }

      props.onComplete && props.onComplete();
    }
  };
}