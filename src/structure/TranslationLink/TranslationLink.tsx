import * as React from 'react';
import styles from './TranslationLink.scss';
import IntentLink from '@sanity/state-router/lib/components/IntentLink';
import classnames from 'classnames';
import { ILanguageObject, Ti18nSchema } from '../../types';
import { getSanityClient, getLangFieldNameFromSchema, getConfig } from '../../utils';
import { SanityFlag } from '../SanityFlag';
import { SanityDocument } from '@sanity/client';
import { I18nDelimiter } from '../../constants';

interface IProps {
  docId: string;
  index: number;
  schema: Ti18nSchema;
  lang: ILanguageObject;
  currentLanguage: string;
  baseDocument?: any;
}

export const TranslationLink: React.FunctionComponent<IProps> = ({ docId, index, schema, lang, currentLanguage, baseDocument }) => {
  const config = getConfig(schema);
  const [imageOk, setImageOk] = React.useState(true)
  const [existing, setExisting] = React.useState<null | SanityDocument>(null);
  const nameSplit = lang.name.split(/[_-]/);
  const country = (nameSplit.length > 1 ? nameSplit[1] : nameSplit[0]).toLowerCase();
  const translatedDocId = (config.base ? lang.name === config.base : index === 0) ? docId : `${docId}${I18nDelimiter}${lang.name}`;

  React.useEffect(() => {
    getSanityClient().fetch('*[_id == $id || _id == $draftId]', {
      id: translatedDocId,
      draftId: `drafts.${translatedDocId}`
    }).then(r => {
      const existing = r.find(r => r._id === translatedDocId);
      if (existing) setExisting(existing);
      else setExisting(r.find(r => r._id === `drafts.${translatedDocId}`));
    }).catch(err => {
      console.error(err);
    });
  }, [lang.name]);

  return (
    <IntentLink
      intent="edit"
      params={{ id: translatedDocId, type: schema.name }}
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
      {!existing ? (
        <p className={styles.missing}>{config.messages.missing}</p>
      ) : (
          existing && existing._id.startsWith('drafts.') && (
            <p className={styles.draft}>{config.messages.draft}</p>
          )
        )}

    </IntentLink>
  );
}
