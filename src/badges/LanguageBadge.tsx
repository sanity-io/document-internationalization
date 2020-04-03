import { IResolverProps } from '../types';
import { getLanguageFromId } from '../utils';

export const LanguageBadge = (props: IResolverProps) => {
    const doc = props.draft || props.published;
    const idLang = getLanguageFromId(props.id);
    if ((doc && doc.__i18n_lang) || idLang) {
        return {
            label: (doc && doc.__i18n_lang) || idLang,
            color: 'success',
        };
    }

    return null;
};