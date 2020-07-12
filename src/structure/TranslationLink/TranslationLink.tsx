import * as React from 'react';
import styles from './TranslationLink.scss';
import IntentLink from '@sanity/state-router/lib/components/IntentLink';
import classnames from 'classnames';
import { ILanguageObject, Ti18nSchema } from '../../types';
import { getSanityClient, getLangFieldNameFromSchema } from '../../utils';
import { SanityFlag } from '../SanityFlag';

interface IProps {
    docId: string;
    index: number;
    schema: Ti18nSchema;
    lang: ILanguageObject;
    currentLanguage: string;
    baseDocument?: any;
}

export const TranslationLink: React.FunctionComponent<IProps> = ({ docId, index, schema, lang, currentLanguage, baseDocument }) => {
    const [imageOk, setImageOk] = React.useState(true)
    const [existing, setExisting] = React.useState<null | any>(null);
    const nameSplit = lang.name.split(/[_-]/);
    const country = (nameSplit.length > 1 ? nameSplit[1] : nameSplit[0]).toLowerCase();
    const translatedDocId = (schema.i18n.base ? lang.name === schema.i18n.base : index === 0) ? docId : `${docId}__i18n_${lang.name}`;

    React.useEffect(() => {
        getSanityClient().fetch('*[_id == $id || _id == $draftId]', {
            id: translatedDocId,
            draftId: `drafts.${translatedDocId}`
        }).then(r => {
            const existing = r.find(r => r._id === translatedDocId);
            if (existing) setExisting(existing);
            else setExisting(r.find(r => r._id === `drafts.${translatedDocId}`));
        });
    }, [lang.name]);

    return (
        <IntentLink
            intent="edit"
            params={{id: translatedDocId, type: schema.name}}
            className={classnames({
                [styles.entry]: true,
                [styles.disabled]: existing === null,
                [styles.selected]: currentLanguage === lang.name
            })}
            onClick={(props) => {
                if (existing === undefined) {
                    const fieldName = getLangFieldNameFromSchema(schema);
                    getSanityClient().createIfNotExists({
                        ...(baseDocument ? baseDocument : {}),
                        _id: `drafts.${translatedDocId}`,
                        _type: schema.name,
                        [fieldName]: lang.name,
                    });
                }
            }}
        >
            {imageOk ? (
                <img
                    className={styles.flag}
                    src={`https://www.countryflags.io/${country}/flat/24.png`}
                    onError={() => setImageOk(false)}
                />
            ) : (
                <SanityFlag className={styles.flag} />
            )}
            <h2 className={styles.title}>
                {lang.title}
            </h2>
            {existing === undefined ? (
                <p className={styles.missing}>{schema.i18n?.messages?.missing || 'Missing'}</p>
            ) : (
                existing && existing._id.startsWith('drafts.') && (
                    <p className={styles.draft}>{schema.i18n?.messages?.draft || 'Draft'}</p>
                )
            )}

        </IntentLink>
    );
}
