import { Ti18nSchema } from '../types';

export const getReferencesFieldNameFromSchema = (s: Ti18nSchema) => {
    return (typeof s.i18n === 'object' ? s.i18n?.fieldNames?.references : undefined) || '__i18n_refs';
}