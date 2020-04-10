import { IResolverProps } from '../types';
import { getLanguageFromId, getSchema, getLangFieldNameFromSchema } from '../utils';

export const LanguageBadge = (props: IResolverProps) => {
    const doc = props.draft || props.published;
    const idLang = getLanguageFromId(props.id);
    const fieldName = getLangFieldNameFromSchema(getSchema(props.type));
    if ((doc && doc[fieldName]) || idLang) {
        return {
            label: (doc && doc[fieldName]) || idLang,
            color: 'success',
        };
    }

    return null;
};