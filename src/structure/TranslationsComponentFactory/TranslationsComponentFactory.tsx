import * as React from 'react';
import styles from './TranslationsComponentFactory.scss';
import { IDefaultDocumentNodeStructureProps } from '../IDefaultDocumentNodeStructureProps';
import { ILanguageObject, Ti18nSchema } from '../../types';
import { getLanguagesFromOption, getBaseLanguage, getSanityClient } from '../../utils';
import { TranslationLink } from '../TranslationLink';

export const TranslationsComponentFactory = (schema: Ti18nSchema) => (props: IDefaultDocumentNodeStructureProps) => {
    const [pending, setPending] = React.useState(false);
    const [languages, setLanguages] = React.useState<ILanguageObject[]>([]);
    const [baseDocument, setBaseDocument] = React.useState(null);

    React.useEffect(
        () => {
            (async () => {
                setPending(true);
                const langs = await getLanguagesFromOption(schema.i18n.languages);
                const doc = await getSanityClient().fetch('*[_id == $id]', { id: props.documentId.split('__i18n_')[0] });
                if (doc && doc.length > 0) setBaseDocument(doc[0]);
                setLanguages(langs);
                setPending(false);
            })();
        },
        []
    );

    if (pending) {
        return (
            <div className={styles.loading}>
                {schema.i18n?.messages?.loading || 'Loading languages...'}
            </div>
        );
    }

    const docIdSplit = props.documentId.split('__i18n_');
    const docId = docIdSplit[0];
    const baseLanguage = getBaseLanguage(languages, schema.i18n.base);
    const currentLanguage = docIdSplit.length > 1 ? docIdSplit[1] : (baseLanguage ? baseLanguage.name : null);
    return languages.map((lang, index) => (
        <TranslationLink
            key={lang.name}
            docId={docId}
            index={index}
            schema={schema}
            lang={lang}
            currentLanguage={currentLanguage}
            baseDocument={baseDocument}
        />
    ));
}