import * as React from 'react'
import omit from 'just-omit'
import {SplitVerticalIcon,AddIcon} from '@sanity/icons'
import {Stack, Button, Badge, Card, Flex, Box, Text, Code, useToast} from '@sanity/ui'
import {usePaneRouter} from '@sanity/desk-tool'
import {RouterContext} from '@sanity/state-router/lib/RouterContext'
import {useEditState} from '@sanity/react-hooks'
import {LangCultureFlagsBlock} from '../LangCultureFlagsBlock'
import {getSanityClient, getConfig, buildDocId} from '../../../utils'
import {IEditState, ILanguageObject, Ti18nSchema} from '../../../types'
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
  const {routerPanesState, groupIndex} = usePaneRouter()
  const [loading, setLoading] = React.useState(false)
  const config = React.useMemo(() => getConfig(schema), [schema])
  const translatedDocId = React.useMemo(
    () =>
      (config.base ? lang.id === config.base : index === 0) ? docId : buildDocId(docId, lang.id),
    [config.base, lang.id, index, docId]
  )
  const editState = useEditState(translatedDocId, schema.name) as IEditState
  const existing = React.useMemo(() => editState.published || editState.draft, [editState])

  const handleOpenInNewView = React.useCallback(() => {
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
  }, [translatedDocId, schema, routerPanesState, groupIndex])

  const handleClick = React.useCallback(
    async (id: string) => {
      try {
        if (!existing) {
          setLoading(true)
          const langFieldName = config.fieldNames.lang
          await getSanityClient().createIfNotExists({
            ...(baseDocument ? omit(baseDocument, [config.fieldNames.references]) : {}),
            _id: `drafts.${id}`,
            _type: schema.name,
            [langFieldName]: lang.id,
            // [baseRefFieldName]: will be added on publish - not possible to add beforehand due to strong reference issue
          })
          toast.push({
            closable: true,
            status: 'success',
            title: UiMessages.baseDocumentCopied,
          })
        }

        // switch away from translations tab and push child
        const panes = [
          ...routerPanesState.slice(0, groupIndex),
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
    [existing, translatedDocId, schema, config, routerPanesState, groupIndex]
  )

  return (
    <>
      <Card radius={2} tone={isCurrentLanguage ? `primary` : `default`}>
        <Flex align="center">
          <Button
            mode={isCurrentLanguage ? `default` : `bleed`}
            padding={2}
            loading={loading}
            onClick={() => handleClick(translatedDocId)}
            style={{width: `100%`}}
          >
            <Flex align="center" gap={4}>
              <LangCultureFlagsBlock
                isMissing={!existing}
                language={lang}
              />
              <Box flex={1}>
                <Stack space={2}>
                  <Text>{lang.title}</Text>
                  <Code size={1}>{lang.id}</Code>
                </Stack>
              </Box>

              <Flex align="center" gap={2}>
                {lang.isBase && (
                  <Badge tone="primary" mode="outline">
                    Base
                  </Badge>
                )}
                {!existing && (
                  <Badge tone="caution">{UiMessages.missing}</Badge>
                )}
                {existing && existing._id.startsWith('drafts.') && (
                  <Badge>{UiMessages.draft}</Badge>
                )}

                {!existing && (
                  <AddIcon fontSize={24} />
                )}
              </Flex>
            </Flex>
          </Button>
          {(existing && !loading) && (
            <Box padding={2} style={{ flexShrink: 0 }}>
              <Button style={{ display: 'block' }} mode="bleed" padding={2} onClick={() => handleOpenInNewView()}>
                <SplitVerticalIcon display="block" fontSize={24} />
              </Button>
            </Box>
          )}
        </Flex>
      </Card>
      {lang.isBase && <Card padding={0} borderTop style={{height: `1px !important`}} />}
    </>
  )
}
