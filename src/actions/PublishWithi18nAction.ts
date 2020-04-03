import * as React from 'react';
import { IResolverProps, Ti18nSchema } from '../types';
import { useDocumentOperation } from '@sanity/react-hooks';
import { getSchema, getLanguagesFromOption, getBaseLanguage, getLanguageFromId } from '../utils';

interface IUseDocumentOperationResult {
    patch: any;
    publish: any;
}

export const PublishWithi18nAction = (props: IResolverProps) => {
    const schema: Ti18nSchema = getSchema(props.type);
    const { patch, publish } = useDocumentOperation(props.id, props.type) as IUseDocumentOperationResult;
    const [publishing, setPublishing] = React.useState(false);

    React.useEffect(() => {
        if (publishing && !props.draft) setPublishing(false);
    }, [props.draft]);

    return {
        disabled: publish.disabled || publishing,
        label: publishing
            ? (schema.i18n?.messages?.publishing || 'Publishing...')
            : (schema.i18n?.messages?.publish || 'Publish'),
        onHandle: async () => {
            setPublishing(true);
            const langs = await getLanguagesFromOption(schema.i18n.languages);
            const languageId = getLanguageFromId(props.id) || getBaseLanguage(langs, schema.i18n.base).name;
            patch.execute([
                { set: { __i18n_lang: languageId } }
            ]);
            publish.execute();
            props.onComplete();
        }
    };
}