import * as React from 'react'
import {SanityDocument} from '@sanity/client'
import {Stack, Button, Badge, Card, Flex, Box, Text, Code, Heading, useToast} from '@sanity/ui'
import {usePaneRouter} from '@sanity/desk-tool'
import {RouterContext} from '@sanity/state-router/lib/RouterContext'
import flagOverrides from 'part:sanity-plugin-intl-input/ui/flags?'
import omit from 'just-omit'
import {Flag} from '../Flag'
import {
  getSanityClient,
  getConfig,
  buildDocId,
  createSanityReference,
  getBaseIdFromId,
} from '../../../utils'
import {ILanguageObject, Ti18nSchema} from '../../../types'
import {UiMessages} from '../../../constants'

interface IProps {
  docId: string
  index: number
  schema: Ti18nSchema
  lang: ILanguageObject
  isCurrentLanguage: boolean
  baseDocument?: any
}

export const TranslationLink: React.FunctionComponent<IProps> = ({
  docId,
  index,
  schema,
  lang,
  isCurrentLanguage,
  baseDocument,
}) => {
  const toast = useToast()
  const routerContext = React.useContext(RouterContext)
  const {routerPanesState, groupIndex, ChildLink} = usePaneRouter()
  const [loading, setLoading] = React.useState(false)
  const [existing, setExisting] = React.useState<null | SanityDocument>(null)
  const config = React.useMemo(() => getConfig(schema), [schema])
  const languageAsVariableName = React.useMemo(() => lang.id.replace(/[^a-zA-Z]/g, '_'), [lang.id])
  const FlagComponent = React.useMemo(
    () =>
      flagOverrides && languageAsVariableName in flagOverrides
        ? flagOverrides[languageAsVariableName]
        : Flag,
    [flagOverrides, languageAsVariableName]
  )

  // Split a country and language if both supplied
  // Expects language first, then country: `en-us` or `en`
  const [codeCountry, codeLanguage] = React.useMemo(
    () => (new RegExp(/[_-]/).test(lang.id) ? lang.id.split(/[_-]/) : [``, lang.id]),
    [lang.id]
  )

  const translatedDocId = React.useMemo(
    () =>
      (config.base ? lang.id === config.base : index === 0) ? docId : buildDocId(docId, lang.id),
    [config.base, lang.id, index, docId]
  )

  React.useEffect(() => {
    getSanityClient()
      .fetch(`coalesce(*[_id == $id][0], *[_id == $draftId][0])`, {
        id: translatedDocId,
        draftId: `drafts.${translatedDocId}`,
      })
      .then((ex) => {
        if (ex) setExisting(ex)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [lang.id])

  const handleClick = React.useCallback(
    async (id: string) => {
      try {
        if (!existing) {
          setLoading(true)
          const langFieldName = config.fieldNames.lang
          const baseRefFieldName = config.fieldNames.baseReference
          await getSanityClient().createIfNotExists({
            ...(baseDocument ? omit(baseDocument, [config.fieldNames.references]) : {}),
            _id: `drafts.${id}`,
            _type: schema.name,
            [langFieldName]: lang.id,
            [baseRefFieldName]: createSanityReference(
              getBaseIdFromId(id)
              // @TODO properly set weak
            ),
          })
          toast.push({
            closable: true,
            status: 'success',
            title: UiMessages.baseDocumentCopied,
          })
        }

        // switch away from translations tab and push child
        const panes = [
          ...routerPanesState.slice(0, groupIndex + 1),
          [
            {
              id: translatedDocId,
              params: {type: schema.name},
            },
          ],
        ]

        const href = routerContext.resolvePathFromState({panes})
        routerContext.navigateUrl(href)
      } catch (err) {
        toast.push({
          closable: true,
          status: 'error',
          title: err.toString(),
        })
      } finally {
        setLoading(false)
      }
    },
    [existing, translatedDocId, schema]
  )

  return (
    <>
      <Card radius={2} tone={isCurrentLanguage ? `primary` : `default`}>
        <Button
          mode={isCurrentLanguage ? `default` : `bleed`}
          padding={2}
          onClick={() => handleClick(translatedDocId)}
          style={{width: `100%`}}
        >
          <Flex align="center" gap={4}>
            <Box>
              {codeCountry && codeLanguage && (
                <Flex
                  direction="column"
                  paddingBottom={3}
                  paddingRight={3}
                  style={{position: 'relative'}}
                >
                  <Heading size={4}>
                    <FlagComponent code={codeCountry} />
                  </Heading>
                  <Heading size={4} style={{position: 'absolute', bottom: 0, right: 0}}>
                    <FlagComponent code={codeLanguage} />
                  </Heading>
                </Flex>
              )}
              {!codeCountry && codeLanguage && (
                <Box paddingX={1}>
                  <Heading size={5}>
                    <FlagComponent code={codeLanguage} />
                  </Heading>
                </Box>
              )}
            </Box>
            <Box flex={1}>
              <Stack space={2}>
                <Text>{lang.title}</Text>
                <Code size={1}>{lang.id}</Code>
              </Stack>
            </Box>
            {lang.isBase && (
              <Badge tone="primary" mode="outline">
                Base
              </Badge>
            )}
            {!existing && <Badge tone="caution">{UiMessages.missing}</Badge>}
            {existing && existing._id.startsWith('drafts.') && <Badge>{UiMessages.draft}</Badge>}
          </Flex>
        </Button>
      </Card>
      {lang.isBase && <Card padding={0} borderTop style={{height: `1px !important`}} />}
    </>
  )
}
