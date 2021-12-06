import * as React from "react";
import shouldReloadFn from "part:sanity-plugin-intl-input/languages/should-reload?";
import { IDefaultDocumentNodeStructureProps } from "../../IDefaultDocumentNodeStructureProps";
import { ILanguageObject, Ti18nSchema } from "../../../types";
import {
  getLanguagesFromOption,
  getBaseLanguage,
  getSanityClient,
  getConfig,
  getBaseIdFromId,
  getLanguageFromId,
} from "../../../utils";
import { TranslationLink } from "../TranslationLink";
import { useEditState } from "@sanity/react-hooks";
import type { SanityDocument } from "@sanity/client";
import { Stack, Spinner, Inline, Text, Flex } from "@sanity/ui";
import { baseToTop } from "../../../utils/baseToTop";

export const TranslationsComponentFactory =
  (schema: Ti18nSchema) => (props: IDefaultDocumentNodeStructureProps) => {
    const config = getConfig(schema);
    const { draft, published } = useEditState(
      props.documentId,
      props.schemaType
    ) as {
      draft?: SanityDocument;
      published?: SanityDocument;
    };
    const [pending, setPending] = React.useState(false);
    const [languages, setLanguages] = React.useState<ILanguageObject[]>([]);
    const [baseDocument, setBaseDocument] = React.useState(null);

    React.useEffect(() => {
      (async () => {
        const shouldReload = (languages.length === 0 || (shouldReloadFn && shouldReloadFn(draft ?? published)));
        if (shouldReload) {
          setPending(true);
          const langs = await getLanguagesFromOption(
            config.languages,
            draft ?? published
          );
          const baseDocId = getBaseIdFromId(props.documentId)
          const doc = await getSanityClient().fetch(`coalesce(*[_id == $draftId], *[_id == $id])`, {
            id: baseDocId,
            draftId: `drafts.${baseDocId}`
          });
          if (doc && doc.length > 0) setBaseDocument(doc[0]);
          setLanguages(langs);
          setPending(false);
        }
      })();
    }, [draft, published, languages]);

    const docId = getBaseIdFromId(props.documentId);
    const baseLanguage = getBaseLanguage(languages, config.base);
    const currentLanguage =
      getLanguageFromId(props.documentId) ||
      (baseLanguage ? baseLanguage.name : null);

    const compiledLanguages = React.useMemo(() => {
      if (!languages?.length) {
        return [];
      }

      return languages
        .map((lang) => ({
          ...lang,
          isBase: lang.name === config.base,
          isCurrentLanguage: lang.name === currentLanguage,
        }))
        .sort(baseToTop)
        .reverse();
    }, [languages, config]);

    if (pending) {
      return (
        <Flex align="center" justify="center" padding={5}>
          <Inline space={5}>
            <Spinner />
            <Text align="center">{config.messages?.loading}</Text>
          </Inline>
        </Flex>
      );
    }

    return (
      <Stack space={2} padding={2}>
        {compiledLanguages.map((lang, index) => (
          <TranslationLink
            key={lang.name}
            docId={docId}
            index={index}
            schema={schema}
            lang={lang}
            currentLanguage={currentLanguage}
            isCurrentLanguage={lang?.isCurrentLanguage}
            baseDocument={baseDocument}
          />
        ))}
      </Stack>
    );
  };
