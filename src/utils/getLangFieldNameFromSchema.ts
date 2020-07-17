import { Ti18nSchema } from '../types';

export const getLangFieldNameFromSchema = (s: Ti18nSchema) => {
    return (typeof s.i18n === 'object' ? s.i18n?.fieldNames?.lang : undefined) || '__i18n_lang';
}