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
import {SanityDocument, useClient, useTranslation} from 'sanity'

import {I18N_NAMESPACE, METADATA_SCHEMA_NAME} from '../constants'
import {useOpenInNewPane} from '../hooks/useOpenInNewPane'
import {Language, Metadata, TranslationReference} from '../types'
import {createReference} from '../utils/createReference'
import {useDocumentInternationalizationContext} from './DocumentInternationalizationContext'

type LanguageOptionProps = {
  language: Language
  schemaType: string
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
  const {t} = useTranslation(I18N_NAMESPACE)

  const open = useOpenInNewPane(translation?.value?._ref, schemaType)
  const handleOpen = useCallback(() => open(), [open])

  const handleCreate = useCallback(() => {
    if (!source) {
      throw new Error(t('create.error.sourceMissing'))
    }

    if (!sourceLanguageId) {
      throw new Error(t('create.error.sourceLanguageIDMissing'))
    }

    if (!metadataId) {
      throw new Error(t('create.error.metadataIDMissing'))
    }

    const transaction = client.transaction()

    // 1. Duplicate source document
    const newTranslationDocumentId = uuid()
    const newTranslationDocument = {
      ...source,
      _id: `drafts.${newTranslationDocumentId}`,
      // 2. Update language of the translation
      [languageField]: language.id,
    }

    transaction.create(newTranslationDocument)

    // 3. Maybe create the metadata document
    const sourceReference = createReference(
      sourceLanguageId,
      documentId,
      schemaType,
      !weakReferences
    )
    const newTranslationReference = createReference(
      language.id,
      newTranslationDocumentId,
      schemaType,
      !weakReferences
    )
    const newMetadataDocument = {
      _id: metadataId,
      _type: METADATA_SCHEMA_NAME,
      schemaTypes: [schemaType],
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
          title: t('create.success.toast.title', {language}),
          description: metadataExisted
            ? t('create.success.toast.description.updated')
            : t('create.success.toast.description.created'),
        })
      })
      .catch((err) => {
        console.error(err)

        return toast.push({
          status: 'error',
          title: t('create.error.toast.title'),
          description: err.message,
        })
      })
  }, [
    source,
    sourceLanguageId,
    metadataId,
    client,
    languageField,
    language,
    documentId,
    schemaType,
    weakReferences,
    t,
    metadata?._createdAt,
    toast,
  ])

  let message

  if (current) {
    message = t('create.tooltip.current', {language})
  } else if (translation) {
    message = t('create.tooltip.open', {language})
  } else if (!translation) {
    message = t('create.tooltip.create', {language})
  }

  return (
    <Tooltip
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
