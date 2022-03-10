import React from 'react'
import omit from 'just-omit'
import {hues} from '@sanity/color'
import {Text, Button, Badge, Flex, useToast, MenuItem} from '@sanity/ui'
import {AddIcon, SpinnerIcon} from '@sanity/icons'
import styled, {css, keyframes} from 'styled-components'
import {usePaneRouter} from '@sanity/desk-tool'
import {RouterContext} from '@sanity/state-router/lib/RouterContext'
import {useEditState} from '@sanity/react-hooks'
import {SingleFlag} from '../SingleFlag'
import type {IExtendedLanguageObject} from '../../../types'
import {UiMessages} from '../../../constants'
import {buildDocId, getBaseIdFromId, getConfig, getSanityClient} from '../../../utils'
import {SplitPaneIcon} from '../SplitPaneIcon'
import {LanguageSelectContext} from './LanguageSelectContext'

type Props = {
  status: 'draft' | 'published' | 'missing'
  language: IExtendedLanguageObject
}

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const ListItemSpinner = styled(SpinnerIcon)`
  animation: ${rotate} 500ms linear infinite;
`

const ListItemBadge = styled(Text)`
  margin-left: ${({theme}) => `${theme.sanity.space[2]}px`};
  margin-right: 35px;
  margin-top: 1px;

  & > span {
    display: inline-block;
    vertical-align: middle;
  }
`

const ListItemSplitButton = styled(Button)`
  display: none;
  flex-shrink: 0;
  margin-left: 4px;

  & svg {
    display: block;
    color: ${hues.gray[700].hex};
  }

  ${({theme}) => css`
    @media (min-width: ${theme.sanity.media[1] / 16}em) {
      display: block;
    }
  `}
`

const MenuItemButton: React.ComponentProps<typeof MenuItem>['as'] = (props) => (
  <button type="button" {...props} />
)

const MenuItemSelectedButton = styled.button`
  color: ${({theme}) => theme.sanity.color.button.default.primary.enabled.fg};
  background-color: ${({theme}) => theme.sanity.color.button.default.primary.enabled.bg};

  span {
    color: ${({theme}) => theme.sanity.color.button.default.primary.enabled.fg};
  }
`

export const LanguageSelectListItem: React.FC<Props> = ({status, language}) => {
  const toast = useToast()
  const {currentDocumentId, currentDocumentType, baseLanguage} =
    React.useContext(LanguageSelectContext)

  if (!currentDocumentId || !currentDocumentType) {
    throw new Error('No document in view')
  }

  const routerContext = React.useContext(RouterContext)
  const {routerPanesState, groupIndex, replaceCurrent} = usePaneRouter()
  const [pending, setPending] = React.useState(false)
  const config = React.useMemo(() => getConfig(currentDocumentType), [currentDocumentType])
  const baseId = React.useMemo(() => getBaseIdFromId(currentDocumentId), [currentDocumentId])
  const flagCode = React.useMemo(() => language.id.split('-').pop(), [language.id])
  const FlagIcon = React.useMemo(
    () =>
      function FlagIconComponent(props: React.ComponentType<typeof SingleFlag>) {
        return <SingleFlag code={flagCode} {...props} />
      },
    [flagCode]
  )
  const translatedId = React.useMemo(
    () => (language.id === baseLanguage?.id ? baseId : buildDocId(baseId, language.id)),
    [baseId, language.id, baseLanguage]
  )
  const baseDocumentEditState = useEditState(baseId, currentDocumentType)
  const baseTranslationBadgeLabel = React.useMemo(() => {
    if (language.isBase) {
      if (language.title.length >= 20) {
        return UiMessages.base.split(' ')[0]
      }
      return UiMessages.base
    }
    return null
  }, [language])

  const openDocumentInCurrentPane = React.useCallback(
    (id: string, type: string) => {
      replaceCurrent({
        id,
        params: {type},
      })
    },
    [replaceCurrent]
  )

  const openDocumentInSidePane = React.useCallback(
    (id: string, type: string) => {
      const panes = [...routerPanesState]
      panes.splice(groupIndex + 1, 0, [
        {
          id: id,
          params: {type},
        },
      ])

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
        title: UiMessages.translationCreatedToast.title(language.title),
        description: baseLanguage
          ? UiMessages.translationCreatedToast.description(baseLanguage.title)
          : undefined,
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
    language.title,
    baseLanguage,
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
      <MenuItem
        as={MenuItemButton}
        data-as="button"
        disabled={pending}
        icon={pending ? ListItemSpinner : AddIcon}
        text={language.title}
        onClick={handleCreateClick}
      />
    )
  }

  return (
    <Flex>
      <MenuItem
        as={language.isCurrentLanguage ? MenuItemSelectedButton : MenuItemButton}
        data-as="button"
        data-selected={language.isCurrentLanguage}
        selected={language.isCurrentLanguage}
        icon={FlagIcon}
        iconRight={
          !!baseTranslationBadgeLabel && (
            <ListItemBadge>
              <Badge>{baseTranslationBadgeLabel}</Badge>
            </ListItemBadge>
          )
        }
        text={language.title}
        onClick={handleOpenClick}
      />
      {!language.isCurrentLanguage && (
        <ListItemSplitButton
          type="button"
          tone="default"
          mode="bleed"
          padding={2}
          onClick={handleOpenInSidePaneClick}
        >
          <SplitPaneIcon width={19} height={19} />
        </ListItemSplitButton>
      )}
    </Flex>
  )
}
