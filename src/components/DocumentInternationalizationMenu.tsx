import {TranslateIcon} from '@sanity/icons'
import {
  Box,
  Button,
  Card,
  Popover,
  Stack,
  Text,
  TextInput,
  useClickOutside,
} from '@sanity/ui'
import {uuid} from '@sanity/uuid'
import {type FormEvent, useCallback, useMemo, useState} from 'react'
import {useEditState} from 'sanity'

import {useTranslationMetadata} from '../hooks/useLanguageMetadata'
import type {DocumentInternationalizationMenuProps} from '../types'
import {useDocumentInternationalizationContext} from './DocumentInternationalizationContext'
import LanguageManage from './LanguageManage'
import LanguageOption from './LanguageOption'
import LanguagePatch from './LanguagePatch'
import Warning from './Warning'

export function DocumentInternationalizationMenu(
  props: DocumentInternationalizationMenuProps
) {
  const {documentId} = props
  const schemaType = props.schemaType
  const {languageField, supportedLanguages} =
    useDocumentInternationalizationContext()

  // Search filter query
  const [query, setQuery] = useState(``)
  const handleQuery = useCallback((event: FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.value) {
      setQuery(event.currentTarget.value)
    } else {
      setQuery(``)
    }
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
  // Cannot rely on generated metadata._id from useTranslationMetadata
  // As the document store might not have returned it before creating another translation
  const metadataId = useMemo(() => {
    if (loading) {
      return null
    }

    // Once created, these two values should be the same anyway
    return metadata?._id ?? uuid()
  }, [loading, metadata?._id])

  // Duplicate a new language version from the most recent version of this document
  const {draft, published} = useEditState(documentId, schemaType.name)
  const source = draft || published

  // Check for data issues
  const documentIsInOneMetadataDocument = useMemo(() => {
    return Array.isArray(data) && data.length <= 1
  }, [data])
  const sourceLanguageId = source?.[languageField] as string | undefined
  const sourceLanguageIsValid = supportedLanguages.some(
    (l) => l.id === sourceLanguageId
  )
  const allLanguagesAreValid = useMemo(() => {
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
    <Box padding={1}>
      {error ? (
        <Card tone="critical" padding={1}>
          <Text>There was an error returning translations metadata</Text>
        </Card>
      ) : (
        <Stack space={1}>
          <LanguageManage id={metadata?._id} />
          {supportedLanguages.length > 4 ? (
            <TextInput
              onChange={handleQuery}
              value={query}
              placeholder="Filter languages"
            />
          ) : null}
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
              {supportedLanguages
                .filter((language) => {
                  if (query) {
                    return language.title
                      .toLowerCase()
                      .includes(query.toLowerCase())
                  }
                  return true
                })
                .map((language) =>
                  !loading && sourceLanguageId && sourceLanguageIsValid ? (
                    // Button to duplicate this document to a new translation
                    // And either create or update the metadata document
                    <LanguageOption
                      key={language.id}
                      language={language}
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
                      source={source}
                      language={language}
                      // Only allow language patch change to:
                      // - Keys not in metadata
                      // - The key of this document in the metadata
                      disabled={
                        (loading ||
                          !allLanguagesAreValid ||
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

  if (!documentId) {
    return null
  }

  if (!schemaType || !schemaType.name) {
    return null
  }

  return (
    <Popover
      animate
      constrainSize
      content={content}
      open={open}
      portal
      ref={setPopover}
      overflow="auto"
      tone="default"
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
