import { ReferenceBehavior } from '../../constants';
import { Ti18nDocument } from '../../types';
import { getConfig, getLanguageFromId, getSanityClient } from '../../utils';

export const fixReferenceBehaviorMismatch = async (schema: string, baseDocuments: Ti18nDocument[], translatedDocuments: Ti18nDocument[]) => {
    const sanityClient = getSanityClient();
    const config = getConfig(schema);
    const refsFieldName = config.fieldNames.references;
    await Promise.all(baseDocuments.map(async d => {
      await sanityClient.patch(d._id, {
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
        },
      }).commit();
    }));
}