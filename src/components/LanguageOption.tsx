import {AddIcon, CheckmarkIcon, SplitVerticalIcon} from '@sanity/icons'
import {
  Badge,
  Box,
  Button,
  Flex,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from '@sanity/ui'
import {uuid} from '@sanity/uuid'
import {useCallback} from 'react'
import {type ObjectSchemaType, type SanityDocument, useClient} from 'sanity'

import {METADATA_SCHEMA_NAME} from '../constants'
import {useOpenInNewPane} from '../hooks/useOpenInNewPane'
import type {Language, Metadata, TranslationReference} from '../types'
import {createReference} from '../utils/createReference'
import {removeExcludedPaths} from '../utils/excludePaths'
import {useDocumentInternationalizationContext} from './DocumentInternationalizationContext'

type LanguageOptionProps = {
  language: Language
  schemaType: ObjectSchemaType
  documentId: string
  disabled: boolean
  current: boolean
  source: SanityDocument | null
  metadataId: string | null
  metadata?: Metadata | null
  sourceLanguageId?: string
}

export default function LanguageOption(props: LanguageOptionProps) {
  const {
    language,
    schemaType,
    documentId,
    current,
    source,
    sourceLanguageId,
    metadata,
    metadataId,
  } = props
  const disabled =
    props.disabled || current || !source || !sourceLanguageId || !metadataId
  const translation: TranslationReference | undefined = metadata?.translations
    .length
    ? metadata.translations.find((t) => t._key === language.id)
    : undefined
  const {apiVersion, languageField, weakReferences} =
    useDocumentInternationalizationContext()
  const client = useClient({apiVersion})
  const toast = useToast()

  const open = useOpenInNewPane(translation?.value?._ref, schemaType.name)
  const handleOpen = useCallback(() => open(), [open])

  const handleCreate = useCallback(async () => {
    if (!source) {
      throw new Error(`Cannot create translation without source document`)
    }

    if (!sourceLanguageId) {
      throw new Error(`Cannot create translation without source language ID`)
    }

    if (!metadataId) {
      throw new Error(`Cannot create translation without a metadata ID`)
    }

    const transaction = client.transaction()

    // 1. Duplicate source document
    const newTranslationDocumentId = uuid()
    let newTranslationDocument = {
      ...source,
      _id: `drafts.${newTranslationDocumentId}`,
      // 2. Update language of the translation
      [languageField]: language.id,
    }

    // Remove fields / paths we don't want to duplicate
    newTranslationDocument = removeExcludedPaths(
      newTranslationDocument,
      schemaType
    ) as SanityDocument

    transaction.create(newTranslationDocument)

    // 3. Maybe create the metadata document
    const sourceReference = createReference(
      sourceLanguageId,
      documentId,
      schemaType.name,
      !weakReferences
    )
    const newTranslationReference = createReference(
      language.id,
      newTranslationDocumentId,
      schemaType.name,
      !weakReferences
    )
    const newMetadataDocument = {
      _id: metadataId,
      _type: METADATA_SCHEMA_NAME,
      schemaTypes: [schemaType.name],
      translations: [sourceReference],
    }

    transaction.createIfNotExists(newMetadataDocument)

    // 4. Patch translation to metadata document
    // Note: If the document was only just created in the operation above
    // This patch operation will have no effect
    const metadataPatch = client
      .patch(metadataId)
      .setIfMissing({translations: [sourceReference]})
      .insert(`after`, `translations[-1]`, [newTranslationReference])

    transaction.patch(metadataPatch)

    // 5. Commit!
    transaction
      .commit()
      .then(() => {
        const metadataExisted = Boolean(metadata?._createdAt)

        return toast.push({
          status: 'success',
          title: `Created "${language.title}" translation`,
          description: metadataExisted
            ? `Updated Translations Metadata`
            : `Created Translations Metadata`,
        })
      })
      .catch((err) => {
        console.error(err)

        return toast.push({
          status: 'error',
          title: `Error creating translation`,
          description: err.message,
        })
      })
  }, [
    client,
    documentId,
    language.id,
    language.title,
    languageField,
    metadata?._createdAt,
    metadataId,
    schemaType,
    source,
    sourceLanguageId,
    toast,
    weakReferences,
  ])

  let message

  if (current) {
    message = `Current document`
  } else if (translation) {
    message = `Open ${language.title} translation`
  } else if (!translation) {
    message = `Create new ${language.title} translation`
  }

  return (
    <Tooltip
      animate
      content={
        <Box padding={2}>
          <Text muted size={1}>
            {message}
          </Text>
        </Box>
      }
      fallbackPlacements={['right', 'left']}
      placement="top"
      portal
    >
      <Button
        onClick={translation ? handleOpen : handleCreate}
        mode={current && disabled ? `default` : `bleed`}
        disabled={disabled}
      >
        <Flex gap={3} align="center">
          {disabled && !current ? (
            <Spinner />
          ) : (
            <Text size={2}>
              {/* eslint-disable-next-line no-nested-ternary */}
              {translation ? (
                <SplitVerticalIcon />
              ) : current ? (
                <CheckmarkIcon />
              ) : (
                <AddIcon />
              )}
            </Text>
          )}
          <Box flex={1}>
            <Text>{language.title}</Text>
          </Box>
          <Badge tone={disabled || current ? `default` : `primary`}>
            {language.id}
          </Badge>
        </Flex>
      </Button>
    </Tooltip>
  )
}
