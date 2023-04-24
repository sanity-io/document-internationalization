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
import {uuid} from '@sanity/uuid'
import React, {useCallback, useMemo, useState} from 'react'
import {useClient, useEditState} from 'sanity'
import {suspend} from 'suspend-react'

import {API_VERSION} from '../constants'
import {useTranslationMetadata} from '../hooks/useLanguageMetadata'
import {SupportedLanguages} from '../types'
import LanguageManage from './LanguageManage'
import LanguageOption from './LanguageOption'
import LanguagePatch from './LanguagePatch'
import Warning from './Warning'

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

  // UI Handlers
  const [open, setOpen] = useState(false)
  const handleClick = useCallback(() => setOpen((o) => !o), [])
  const [button, setButton] = useState<HTMLElement | null>(null)
  const [popover, setPopover] = useState<HTMLElement | null>(null)
  const handleClickOutside = useCallback(() => setOpen(false), [])
  useClickOutside(handleClickOutside, [button, popover])

  // Get metadata from content lake
  const {data, loading, error} = useTranslationMetadata(documentId)
  const metadata = Array.isArray(data) && data.length ? data[0] : null

  // Optimistically set a metadata ID for a newly created metadata document
  // Cannot rely on metadata._id because from useTranslationMetadata
  // As the document store might not have returned it before creating another translation
  const metadataId = useMemo(() => metadata?._id ?? uuid(), [metadata])

  // Duplicate a new language version from the most recent version of this document
  const {draft, published} = useEditState(documentId, schemaType)
  const source = draft || published

  // Check for data issues
  const documentIsInOneMetadataDocument = React.useMemo(() => {
    return Array.isArray(data) && data.length <= 1
  }, [data])
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
          <LanguageManage id={metadata?._id} />
          {supportedLanguages.length > 0 ? (
            <>
              {/* Once metadata is loaded, there may be issues */}
              {loading ? null : (
                <>
                  {/* Not all languages are valid */}
                  {data && documentIsInOneMetadataDocument ? null : (
                    <Warning>
                      {/* TODO: Surface these documents to the user */}
                      This document has been found in more than one Translations
                      Metadata documents
                    </Warning>
                  )}
                  {/* Not all languages are valid */}
                  {allLanguagesAreValid ? null : (
                    <Warning>
                      Not all language objects are valid. See the console.
                    </Warning>
                  )}
                  {/* Current document has no language field */}
                  {sourceLanguageId ? null : (
                    <Warning>
                      Choose a language to apply to{' '}
                      <strong>this Document</strong>
                    </Warning>
                  )}
                  {/* Current document has an invalid language field */}
                  {sourceLanguageId && !sourceLanguageIsValid ? (
                    <Warning>
                      Select a supported language. Current language value:{' '}
                      <code>{sourceLanguageId}</code>
                    </Warning>
                  ) : null}
                </>
              )}
              {supportedLanguages.map((language, languageIndex) =>
                !loading && sourceLanguageId && sourceLanguageIsValid ? (
                  // Button to duplicate this document to a new translation
                  // And either create or update the metadata document
                  <LanguageOption
                    key={language.id}
                    index={languageIndex}
                    language={language}
                    languageField={languageField}
                    schemaType={schemaType}
                    documentId={documentId}
                    disabled={loading || !allLanguagesAreValid}
                    current={language.id === sourceLanguageId}
                    metadata={metadata}
                    metadataId={metadataId}
                    source={source}
                    sourceLanguageId={sourceLanguageId}
                  />
                ) : (
                  // Button to set a language field on *this* document
                  <LanguagePatch
                    key={language.id}
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
        </Stack>
      )}
    </Box>
  )

  const issueWithTranslations =
    !loading && sourceLanguageId && !sourceLanguageIsValid

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
