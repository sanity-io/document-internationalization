import { Ti18nSchema } from '../types';

export const getLangFieldNameFromSchema = (s: Ti18nSchema) => {
    return s.i18n?.fieldNames?.lang || '__i18n_lang';
}