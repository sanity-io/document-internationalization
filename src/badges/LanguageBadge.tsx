import { IResolverProps } from '../types';
import { getLanguageFromId, getSchema, getConfig } from '../utils';

export const LanguageBadge = (props: IResolverProps) => {
  const config = getConfig(props.type);
  const doc = props.draft || props.published;
  const idLang = getLanguageFromId(props.id);
  const fieldName = config.fieldNames.lang;
  if ((doc && doc[fieldName]) || idLang) {
    return {
      label: (doc && doc[fieldName]) || idLang,
      color: 'success',
    };
  }

  return null;
};