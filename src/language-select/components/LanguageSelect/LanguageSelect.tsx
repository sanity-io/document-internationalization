import React from 'react'
import get from 'just-safe-get'
import {Button, Menu, MenuButton, PopoverProps} from '@sanity/ui'
import type {SchemaType} from '@sanity/types'
import type {SanityDocument} from '@sanity/client'
import {ChevronDownIcon} from '@sanity/icons'
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

const POPOVER_PROPS: PopoverProps = {
  constrainSize: true,
  placement: 'bottom',
  portal: true,
}

export const LanguageSelect: React.FC<Props> = ({schemaType, document}) => {
  const config = React.useMemo(() => getConfig(schemaType.name), [schemaType.name])
  const [pending, languages] = useLanguages(document)

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

  if (!currentLanguageObject || !currentLanguageCode || pending || languages.length === 0) {
    return (
      <Button
        disabled
        mode="bleed"
        padding={3}
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
      <MenuButton
        id="document-internationalization/language-select"
        popover={POPOVER_PROPS}
        button={
          <Button
            mode="bleed"
            icon={<SingleFlag code={currentLanguageFlagCode} />}
            iconRight={ChevronDownIcon}
            padding={3}
            title={currentLanguageObject.title ?? currentLanguageObject.id}
            text={currentLanguageObject.title ?? currentLanguageObject.id}
          />
        }
        menu={
          <Menu>
            <LanguageSelectList {...languagesObjects} />
          </Menu>
        }
      />
    </LanguageSelectContext.Provider>
  )
}
