import * as React from 'react';
import styles from './TranslationsComponentFactory.scss';
import shouldReloadFn from 'part:sanity-plugin-intl-input/languages/should-reload?';
import { IDefaultDocumentNodeStructureProps } from '../../IDefaultDocumentNodeStructureProps';
import { ILanguageObject, Ti18nSchema } from '../../../types';
import {
  getLanguagesFromOption,
  getBaseLanguage,
  getSanityClient,
  getConfig,
  getBaseIdFromId,
  getLanguageFromId
} from '../../../utils';
import { TranslationLink } from '../TranslationLink';
import { useEditState } from '@sanity/react-hooks';
import type { SanityDocument } from '@sanity/client';

export const TranslationsComponentFactory = (schema: Ti18nSchema) => (props: IDefaultDocumentNodeStructureProps) => {
  const config = getConfig(schema);
  const { draft, published } = useEditState(props.documentId, props.schemaType) as {
    draft?: SanityDocument;
    published?: SanityDocument;
  };
  const [pending, setPending] = React.useState(false);
  const [languages, setLanguages] = React.useState<ILanguageObject[]>([]);
  const [baseDocument, setBaseDocument] = React.useState(null);

  React.useEffect(
    () => {
      (async () => {
        const shouldReload = (draft ?? published) && (
          languages.length === 0 || (shouldReloadFn && shouldReloadFn(draft ?? published))
        );
        if (shouldReload) {
          setPending(true);
          const langs = await getLanguagesFromOption(config.languages, draft ?? published);
          const doc = await getSanityClient().fetch('*[_id == $id]', { id: getBaseIdFromId(props.documentId) });
          if (doc && doc.length > 0) setBaseDocument(doc[0]);
          setLanguages(langs);
          setPending(false);
        }
      })();
    },
    [draft, published, languages]
  );

  if (pending) {
    return (
      <div className={styles.loading}>
        {config.messages?.loading}
      </div>
    );
  }

  const docId = getBaseIdFromId(props.documentId);
  const baseLanguage = getBaseLanguage(languages, config.base);
  const currentLanguage = getLanguageFromId(props.documentId) || (baseLanguage ? baseLanguage.name : null);
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