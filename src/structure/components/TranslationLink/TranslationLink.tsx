import * as React from "react";
import { ILanguageObject, Ti18nSchema } from "../../../types";
import { getSanityClient, getConfig, buildDocId } from "../../../utils";
import { SanityDocument } from "@sanity/client";
import {
  Stack,
  Button,
  Badge,
  Card,
  Flex,
  Box,
  Text,
  Code,
  Heading,
} from "@sanity/ui";
import { usePaneRouter } from "@sanity/desk-tool";
import { getFlag } from "../../../utils/getFlag";

interface IProps {
  docId: string;
  index: number;
  schema: Ti18nSchema;
  lang: ILanguageObject;
  currentLanguage: string | null;
  isCurrentLanguage: boolean;
  baseDocument?: any;
}

export const TranslationLink: React.FunctionComponent<IProps> = ({
  docId,
  index,
  schema,
  lang,
  isCurrentLanguage,
  baseDocument,
}) => {
  const config = getConfig(schema);
  const [existing, setExisting] = React.useState<null | SanityDocument>(null);

  // Split a country and language if both supplied
  // Expects language first, then country: `en-us` or `en`
  const [codeCountry, codeLanguage] = new RegExp(/[_-]/).test(lang.name)
    ? lang.name.split(/[_-]/)
    : [null, lang.name];

  const translatedDocId = (
    config.base ? lang.name === config.base : index === 0
  )
    ? docId
    : buildDocId(docId, lang.name);

  const { replaceCurrent } = usePaneRouter();

  React.useEffect(() => {
    getSanityClient()
      .fetch("*[_id == $id || _id == $draftId]", {
        id: translatedDocId,
        draftId: `drafts.${translatedDocId}`,
      })
      .then((r) => {
        const existing = r.find((r) => r._id === translatedDocId);
        if (existing) setExisting(existing);
        else setExisting(r.find((r) => r._id === `drafts.${translatedDocId}`));
      })
      .catch((err) => {
        console.error(err);
      });
  }, [lang.name]);

  const handleClick = (params = {}) => {
    if (existing === undefined) {
      const fieldName = config.fieldNames.lang;
      getSanityClient().createIfNotExists({
        ...(baseDocument ? baseDocument : {}),
        _id: `drafts.${translatedDocId}`,
        _type: schema.name,
        [fieldName]: lang.name,
      });
    }

    // TODO: Leverage this function to open doc without resetting all panes
    replaceCurrent(params);
  };

  return (
    <>
      <Card radius={2} tone={isCurrentLanguage ? `primary` : `default`}>
        <Button
          mode={isCurrentLanguage ? `default` : `bleed`}
          padding={2}
          onClick={() =>
            handleClick({ id: translatedDocId, type: schema.name })
          }
          style={{ width: `100%` }}
        >
          <Flex align="center" gap={4}>
            <Box>
              {codeCountry && codeLanguage && (
                <Flex
                  direction="column"
                  paddingBottom={3}
                  paddingRight={3}
                  style={{ position: "relative" }}
                >
                  <Heading size={4}>{getFlag(codeCountry)}</Heading>
                  <Heading
                    size={4}
                    style={{ position: "absolute", bottom: 0, right: 0 }}
                  >
                    {getFlag(codeLanguage)}
                  </Heading>
                </Flex>
              )}
              {!codeCountry && codeLanguage && (
                <Box paddingX={1}>
                  <Heading size={5}>{getFlag(codeLanguage)}</Heading>
                </Box>
              )}
            </Box>
            <Box flex={1}>
              <Stack space={2}>
                <Text>{lang.title}</Text>
                <Code size={1}>{lang.name}</Code>
              </Stack>
            </Box>
            {lang.isBase && (
              <Badge tone="primary" mode="outline">
                Base
              </Badge>
            )}
            {!existing && (
              <Badge tone="caution">{config.messages?.missing}</Badge>
            )}
            {existing && existing._id.startsWith("drafts.") && (
              <Badge>{config.messages?.draft}</Badge>
            )}
          </Flex>
        </Button>
      </Card>
      {lang.isBase && (
        <Card padding={0} borderTop style={{ height: `1px !important` }} />
      )}
    </>
  );
};
