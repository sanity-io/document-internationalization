import {TranslateIcon} from '@sanity/icons'
import {
  Box,
  Button,
  Card,
  Popover,
  Stack,
  Text,
  useClickOutside,
} from '@sanity/ui'
import React, {useCallback, useState} from 'react'
import {useClient, useEditState} from 'sanity'
import {suspend} from 'suspend-react'

import {API_VERSION} from '../constants'
import {useTranslationMetadata} from '../hooks/useLanguageMetadata'
import {SupportedLanguages} from '../types'
import LanguageManage from './LanguageManage'
import LanguageOption from './LanguageOption'
import LanguagePatch from './LanguagePatch'

type MenuButtonProps = {
  supportedLanguages: SupportedLanguages
  schemaType: string
  documentId: string
  languageField: string
  apiVersion?: string
}

export default function MenuButton(props: MenuButtonProps) {
  const {
    apiVersion = API_VERSION,
    schemaType,
    documentId,
    languageField,
  } = props

  const client = useClient({apiVersion})
  const supportedLanguages = Array.isArray(props.supportedLanguages)
    ? props.supportedLanguages
    : // eslint-disable-next-line require-await
      suspend(async () => {
        if (typeof props.supportedLanguages === 'function') {
          return props.supportedLanguages(client)
        }
        return props.supportedLanguages
      }, [])

  const [open, setOpen] = useState(false)
  const handleClick = useCallback(() => setOpen((o) => !o), [])
  const [button, setButton] = useState<HTMLElement | null>(null)
  const [popover, setPopover] = useState<HTMLElement | null>(null)
  const handleClickOutside = useCallback(() => setOpen(false), [])
  useClickOutside(handleClickOutside, [button, popover])
  const {
    data: metadata,
    loading,
    error,
  } = useTranslationMetadata(documentId, schemaType)
  const {draft, published} = useEditState(documentId, schemaType)
  const source = draft || published

  const sourceLanguageId = source?.[languageField] as string | undefined
  const sourceLanguageIsValid = supportedLanguages.some(
    (l) => l.id === sourceLanguageId
  )
  const allLanguagesAreValid = React.useMemo(() => {
    const valid = supportedLanguages.every((l) => l.id && l.title)
    if (!valid) {
      console.warn(
        `Not all languages are valid. It should be an array of objects with an "id" and "title" property. Or a function that returns an array of objects with an "id" and "title" property.`,
        supportedLanguages
      )
    }

    return valid
  }, [supportedLanguages])

  const content = (
    <Box>
      {error ? (
        <Card tone="critical" padding={2}>
          <Text>Error: {error}</Text>
        </Card>
      ) : (
        <Stack padding={1} space={1}>
          {supportedLanguages.length > 0 ? (
            <>
              {/* Once metadata is loaded, there may be issues */}
              {loading ? null : (
                <>
                  {/* Not all languages are valid */}
                  {allLanguagesAreValid ? null : (
                    <Card tone="caution" padding={3}>
                      <Text size={1}>
                        Not all language objects are valid. See the console.
                      </Text>
                    </Card>
                  )}
                  {/* Current document has no language field */}
                  {sourceLanguageId ? null : (
                    <Card tone="caution" padding={3}>
                      <Text size={1}>
                        Choose a language to <br />
                        apply to <strong>this Document</strong>
                      </Text>
                    </Card>
                  )}
                  {/* Current document has an invalid language field */}
                  {sourceLanguageId && !sourceLanguageIsValid ? (
                    <Card tone="caution" padding={3}>
                      <Text size={1}>
                        Select a supported language.
                        <br />
                        Current language value: <code>{sourceLanguageId}</code>
                      </Text>
                    </Card>
                  ) : null}
                </>
              )}
              {supportedLanguages.map((language, langIndex) =>
                !loading && sourceLanguageId && sourceLanguageIsValid ? (
                  // Button to duplicate this document to a new translation
                  // And either create or update the metadata document
                  <LanguageOption
                    key={language.id || language.title || `lang-${langIndex}`}
                    index={langIndex}
                    language={language}
                    languageField={languageField}
                    schemaType={schemaType}
                    documentId={documentId}
                    disabled={loading || !allLanguagesAreValid}
                    current={language.id === sourceLanguageId}
                    metadata={metadata}
                    sourceId={documentId}
                    sourceLanguageId={sourceLanguageId}
                    translation={metadata?.translations.find(
                      (t) => t._key === language.id
                    )}
                  />
                ) : (
                  // Button to set a language field on *this* document
                  <LanguagePatch
                    key={language.id || language.title || `lang-${langIndex}`}
                    languageField={languageField}
                    source={source}
                    documentId={documentId}
                    schemaType={schemaType}
                    language={language}
                    // Only allow language patch change to:
                    // - Keys not in metadata
                    // - The key of this document in the metadata
                    disabled={
                      (!allLanguagesAreValid ||
                        metadata?.translations
                          .filter((t) => t?.value?._ref !== documentId)
                          .some((t) => t._key === language.id)) ??
                      false
                    }
                  />
                )
              )}
            </>
          ) : null}
          <LanguageManage id={metadata?._id} />
        </Stack>
      )}
    </Box>
  )

  const issueWithTranslations =
    !loading && sourceLanguageId && !sourceLanguageIsValid
  console.log({sourceLanguageId, sourceLanguageIsValid, issueWithTranslations})

  return (
    <Popover
      constrainSize
      content={content}
      open={open}
      portal
      ref={setPopover}
      overflow="auto"
    >
      <Button
        text="Translations"
        mode="bleed"
        disabled={!source}
        tone={
          !source || loading || !issueWithTranslations ? undefined : `caution`
        }
        icon={TranslateIcon}
        onClick={handleClick}
        ref={setButton}
        selected={open}
      />
    </Popover>
  )
}
