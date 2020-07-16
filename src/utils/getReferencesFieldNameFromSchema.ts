import { Ti18nSchema } from '../types';

export const getReferencesFieldNameFromSchema = (s: Ti18nSchema) => {
    return s.i18n?.fieldNames?.references || '__i18n_refs';
}