import React from 'react'
import {Box, Text, Button, Badge, Grid, Flex, useToast} from '@sanity/ui'
import {AddIcon, SpinnerIcon, SplitVerticalIcon} from '@sanity/icons'
import styled, {keyframes} from 'styled-components'
import {usePaneRouter} from '@sanity/desk-tool'
import {RouterContext} from '@sanity/state-router/lib/RouterContext'
import {useEditState} from '@sanity/react-hooks'
import omit from 'just-omit'
import {SingleFlag} from '../SingleFlag'
import type {IExtendedLanguageObject} from '../../../types'
import {UiMessages} from '../../../constants'
import {buildDocId, getBaseIdFromId, getConfig, getSanityClient} from '../../../utils'
import {LanguageSelectContext} from './LanguageSelectContext'

type Props = {
  status: 'draft' | 'published' | 'missing'
  language: IExtendedLanguageObject
}

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const ListItemButton = styled(Button)`
  flex-grow: 1;
  width: 100%;
  min-width: 240px;
`

const ListItemSpinner = styled(SpinnerIcon)`
  display: block;
  animation: ${rotate} 500ms linear infinite;
`

const ListItemGrid = styled(Grid)`
  grid-template-columns: 21px 1fr;
  align-items: center;
  gap: ${(props) => `${props.theme.sanity.space[1]}px`};
`

const ListItemContentFlex = styled(Flex)`
  align-items: center;
`

const ListItemLabel = styled(Text)`
  transform: translateY(0.413rem);
`

const ListItemSplitButton = styled(Button)`
  flex-shrink: 0;
  margin-left: 4px;

  & svg {
    display: block;
  }
`

export const LanguageSelectorListItem: React.FC<Props> = ({status, language}) => {
  const toast = useToast()
  const {currentDocumentId, currentDocumentType, baseLanguage} =
    React.useContext(LanguageSelectContext)

  if (!currentDocumentId || !currentDocumentType) {
    throw new Error('No document in view')
  }

  const routerContext = React.useContext(RouterContext)
  const {routerPanesState, groupIndex} = usePaneRouter()
  const [pending, setPending] = React.useState(false)
  const config = React.useMemo(() => getConfig(currentDocumentType), [currentDocumentType])
  const baseId = React.useMemo(() => getBaseIdFromId(currentDocumentId), [currentDocumentId])
  const flagCode = React.useMemo(() => language.id.split('-').pop(), [language.id])
  const translatedId = React.useMemo(
    () => (language.id === baseLanguage?.id ? baseId : buildDocId(baseId, language.id)),
    [baseId, language.id, baseLanguage]
  )
  const baseDocumentEditState = useEditState(baseId, currentDocumentType)

  const openDocumentInCurrentPane = React.useCallback(
    (id: string, type: string) => {
      const panes = [
        ...routerPanesState.slice(0, groupIndex),
        [
          {
            id: id,
            params: {type},
          },
        ],
      ]

      const href = routerContext.resolvePathFromState({panes})
      routerContext.navigateUrl(href)
    },
    [routerContext, routerPanesState, groupIndex]
  )

  const openDocumentInSidePane = React.useCallback(
    (id: string, type: string) => {
      const panes = [
        ...routerPanesState.slice(0, groupIndex + 1),
        [
          {
            id: id,
            params: {type},
          },
        ],
      ]

      const href = routerContext.resolvePathFromState({panes})
      routerContext.navigateUrl(href)
    },
    [routerContext, routerPanesState, groupIndex]
  )

  const handleCreateClick = React.useCallback(async () => {
    try {
      setPending(true)
      const baseDocument = baseDocumentEditState.draft || baseDocumentEditState.published
      const langFieldName = config.fieldNames.lang
      await getSanityClient().createIfNotExists({
        ...(baseDocument ? omit(baseDocument, [config.fieldNames.references]) : {}),
        _id: `drafts.${translatedId}`,
        _type: currentDocumentType,
        [langFieldName]: language.id,
      })
      toast.push({
        closable: true,
        status: 'success',
        title: UiMessages.baseDocumentCopied,
      })
      openDocumentInCurrentPane(translatedId, currentDocumentType)
    } catch (err) {
      toast.push({
        closable: true,
        status: 'error',
        title: err.toString(),
      })
    } finally {
      setPending(false)
    }
  }, [
    toast,
    language.id,
    translatedId,
    currentDocumentType,
    config.fieldNames.lang,
    config.fieldNames.references,
    openDocumentInCurrentPane,
    baseDocumentEditState.draft,
    baseDocumentEditState.published,
  ])

  const handleOpenClick = React.useCallback(() => {
    openDocumentInCurrentPane(translatedId, currentDocumentType)
  }, [openDocumentInCurrentPane, translatedId, currentDocumentType])

  const handleOpenInSidePaneClick = React.useCallback(() => {
    openDocumentInSidePane(translatedId, currentDocumentType)
  }, [openDocumentInSidePane, translatedId, currentDocumentType])

  if (status === 'missing') {
    return (
      <ListItemButton
        mode="bleed"
        textAlign="left"
        padding={2}
        disabled={pending}
        onClick={handleCreateClick}
      >
        <ListItemGrid>
          {pending ? (
            <ListItemSpinner width={21} height={21} />
          ) : (
            <AddIcon width={21} height={21} />
          )}
          <Box>
            <ListItemLabel size={2}>{language.title}</ListItemLabel>
          </Box>
        </ListItemGrid>
      </ListItemButton>
    )
  }

  if (flagCode) {
    return (
      <Flex>
        <ListItemButton
          mode="bleed"
          tone="primary"
          selected={language.isCurrentLanguage}
          textAlign="left"
          padding={2}
          onClick={handleOpenClick}
        >
          <ListItemGrid>
            <SingleFlag code={flagCode} />
            <ListItemContentFlex>
              <ListItemLabel size={2}>{language.title}</ListItemLabel>
              {language.isBase && <Badge marginX={2}>{UiMessages.base}</Badge>}
            </ListItemContentFlex>
          </ListItemGrid>
        </ListItemButton>
        {!language.isCurrentLanguage && (
          <ListItemSplitButton
            mode="bleed"
            tone="primary"
            padding={2}
            onClick={handleOpenInSidePaneClick}
          >
            <SplitVerticalIcon width={21} height={21} />
          </ListItemSplitButton>
        )}
      </Flex>
    )
  }

  return null
}
