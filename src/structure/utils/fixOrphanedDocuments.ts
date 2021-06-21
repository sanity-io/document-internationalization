import { Ti18nDocument } from '../../types';
import { getSanityClient } from '../../utils';

export const fixOrphanedDocuments = async (basedocuments: Ti18nDocument[], translatedDocuments: Ti18nDocument[]) => {
  const sanityClient = getSanityClient();
  await Promise.all(translatedDocuments.map(async d => {
    const base = basedocuments.find(doc => d._id.startsWith(doc._id));
    if (!base) await sanityClient.delete(d._id);
  }));
}