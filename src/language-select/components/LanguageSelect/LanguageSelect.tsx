import React from 'react'
import get from 'just-safe-get'
import {Button, Grid, Box, Popover, Text, Flex, useClickOutside} from '@sanity/ui'
import type {SchemaType} from '@sanity/types'
import type {SanityDocument} from '@sanity/client'
import {ChevronDownIcon} from '@sanity/icons'
import styled from 'styled-components'
import {SingleFlag} from '../SingleFlag'
import {
  buildDocId,
  getBaseIdFromId,
  getBaseLanguage,
  getConfig,
  getLanguageFromId,
} from '../../../utils'
import {useLanguages, useManyEditStates} from '../../hooks'
import {UiMessages} from '../../../constants'
import {IExtendedLanguageObject} from '../../../types'
import {LanguageSelectList} from './LanguageSelectList'
import {LanguageSelectContext} from './LanguageSelectContext'

type Props = {
  schemaType: SchemaType
  document: SanityDocument
}

const LanguageSelectFlex = styled(Flex)`
  align-items: center;
  justify-content: space-between;
`

const LanguageSelectGrid = styled(Grid)`
  align-items: center;
`

const LanguageSelectLabel = styled(Text)`
  transform: translateY(0.413rem);
`

export const LanguageSelect: React.FC<Props> = ({schemaType, document}) => {
  const config = React.useMemo(() => getConfig(schemaType.name), [schemaType.name])
  const [pending, languages] = useLanguages(document)
  const [isOpen, setIsOpen] = React.useState(false)
  const [triggerRef, setTriggerRef] = React.useState<HTMLButtonElement | null>(null)
  const [popoverRef, setPopoverRef] = React.useState<HTMLElement | null>(null)

  const baseLanguage = React.useMemo(
    () => getBaseLanguage(languages, config.base),
    [languages, config.base]
  )
  const currentLanguageCode = React.useMemo(
    () => getLanguageFromId(document._id) || (baseLanguage ? baseLanguage.id : null),
    [document._id, baseLanguage]
  )
  const currentLanguageObject = React.useMemo(
    () => languages.find((lang) => lang.id === currentLanguageCode),
    [languages, currentLanguageCode]
  )
  const currentLanguageFlagCode = React.useMemo(
    () => currentLanguageCode?.split('-').pop(),
    [currentLanguageCode]
  )
  const editStateIds = React.useMemo(() => {
    const baseId = getBaseIdFromId(document._id)
    return languages.map((lang) => (lang === baseLanguage ? baseId : buildDocId(baseId, lang.id)))
  }, [baseLanguage, languages, document._id])
  const editStates = useManyEditStates(editStateIds, document._type)

  const languagesObjects = React.useMemo(() => {
    const editStatePerLanguage = new Map<string, typeof editStates[number]>()
    editStates.forEach((state) => {
      const doc = state?.draft ?? state?.published
      const lang = get(doc ?? {}, config.fieldNames.lang) as string | undefined
      const isBase = doc && doc._id.replace(/^drafts\./, '') === getBaseIdFromId(doc._id)
      if (lang) {
        editStatePerLanguage.set(lang, state)
      } else if (isBase && baseLanguage?.id) {
        editStatePerLanguage.set(baseLanguage.id, state)
      }
    })

    const draftLanguageObjects: IExtendedLanguageObject[] = []
    const publishedLanguageObjects: IExtendedLanguageObject[] = []
    const missingLanguageObjects: IExtendedLanguageObject[] = []

    languages.forEach((lang, index) => {
      const extendedObject = {
        ...lang,
        isBase: baseLanguage ? lang.id === baseLanguage.id : index === 0,
        isCurrentLanguage: lang.id === currentLanguageCode,
      }
      const editState = editStatePerLanguage.get(lang.id)
      if (editState?.published) {
        publishedLanguageObjects.push(extendedObject)
      } else if (editState?.draft) {
        draftLanguageObjects.push(extendedObject)
      } else {
        missingLanguageObjects.push(extendedObject)
      }
    })

    return {
      draftLanguageObjects,
      publishedLanguageObjects,
      missingLanguageObjects,
    }
  }, [config, languages, baseLanguage, editStates, currentLanguageCode])

  const handleClose = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleOpen = React.useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleKeyUp = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    },
    [handleClose]
  )

  useClickOutside(() => {
    handleClose()
  }, [popoverRef, triggerRef])

  if (!currentLanguageObject || !currentLanguageCode || pending || languages.length === 0) {
    return (
      <Button
        disabled
        mode="bleed"
        padding={2}
        loading={pending}
        iconRight={ChevronDownIcon}
        text={UiMessages.languageSelect.placeholder}
      />
    )
  }

  return (
    <LanguageSelectContext.Provider
      value={{
        baseLanguage,
        currentLanguage: currentLanguageObject,
        currentDocumentType: document._type,
        currentDocumentId: document._id,
      }}
    >
      <Button
        mode="bleed"
        padding={2}
        ref={setTriggerRef}
        onClick={handleOpen}
        text={
          <LanguageSelectFlex>
            <LanguageSelectGrid gap={2} autoCols="auto" autoFlow="column">
              {!!currentLanguageFlagCode && <SingleFlag code={currentLanguageFlagCode} />}
              <Box marginRight={2}>
                <LanguageSelectLabel>
                  {currentLanguageObject.title ?? currentLanguageObject.id}
                </LanguageSelectLabel>
              </Box>
            </LanguageSelectGrid>
            <ChevronDownIcon width={21} height={21} />
          </LanguageSelectFlex>
        }
      />
      {!!triggerRef && (
        <Popover
          portal
          autoFocus
          constrainSize
          max="none"
          ref={setPopoverRef}
          open={isOpen}
          placement="bottom"
          referenceElement={triggerRef}
          content={
            <Box padding={1} overflow="auto" sizing="border" onKeyUp={handleKeyUp}>
              <LanguageSelectList {...languagesObjects} />
            </Box>
          }
        />
      )}
    </LanguageSelectContext.Provider>
  )
}
