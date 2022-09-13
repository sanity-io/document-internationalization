import React, {useCallback, useState} from 'react'
import {Text, Card, useClickOutside, Stack, Popover, Button, Box} from '@sanity/ui'
import {TranslateIcon} from '@sanity/icons'
import {useEditState} from 'sanity'

import {Language} from './types'
import LanguageOption from './LanguageOption'
import {useTranslationMetadata} from './hooks/useLanguageMetadata'
import LanguageManage from './LanguageManage'
import LanguagePatch from './LanguagePatch'

type MenuButtonProps = {
  supportedLanguages: Language[]
  schemaType: string
  documentId: string
  languageField: string
}

export default function MenuButton(props: MenuButtonProps) {
  const {supportedLanguages, schemaType, documentId, languageField} = props

  const [open, setOpen] = useState(false)
  const handleClick = useCallback(() => setOpen((o) => !o), [])
  const [button, setButton] = useState<HTMLElement | null>(null)
  const [popover, setPopover] = useState<HTMLElement | null>(null)
  const handleClickOutside = useCallback(() => setOpen(false), [])
  useClickOutside(handleClickOutside, [button, popover])
  const {data: metadata, loading, error} = useTranslationMetadata(documentId, schemaType)
  const {draft, published} = useEditState(documentId, schemaType)
  const source = draft || published

  const sourceLanguageId = source?.[languageField] as string | undefined

  const content = (
    <Box overflow="auto">
      {error ? (
        <Card tone="critical" padding={2}>
          <Text>Error: {error}</Text>
        </Card>
      ) : (
        <Stack padding={1} space={1}>
          {supportedLanguages.length > 0 ? (
            <>
              {supportedLanguages.map((language, langIndex) =>
                !loading && sourceLanguageId ? (
                  <LanguageOption
                    key={language.id}
                    index={langIndex}
                    language={language}
                    languageField={languageField}
                    schemaType={schemaType}
                    documentId={documentId}
                    disabled={loading}
                    current={language.id === sourceLanguageId}
                    metadata={metadata}
                    sourceId={documentId}
                    sourceLanguageId={sourceLanguageId}
                    translation={metadata?.translations.find((t) => t._key === language.id)}
                  />
                ) : (
                  <LanguagePatch
                    key={language.id}
                    languageField={languageField}
                    source={source}
                    documentId={documentId}
                    schemaType={schemaType}
                    language={language}
                  />
                )
              )}
              {!loading && !sourceLanguageId ? (
                <Box padding={3}>
                  <Text size={1} align="center">
                    Choose a language to <br />
                    apply to <strong>this</strong> Document
                  </Text>
                </Box>
              ) : null}
            </>
          ) : null}
          <LanguageManage id={metadata?._id} />
        </Stack>
      )}
    </Box>
  )

  return (
    <Popover constrainSize content={content} open={open} portal ref={setPopover}>
      <Button
        text="Translations"
        mode="bleed"
        disabled={!source}
        tone={!source || (!loading && sourceLanguageId) ? undefined : `caution`}
        icon={TranslateIcon}
        onClick={handleClick}
        ref={setButton}
        selected={open}
      />
    </Popover>
  )
}
