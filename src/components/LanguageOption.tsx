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
import {useClient} from 'sanity'

import {API_VERSION, METADATA_SCHEMA_NAME} from '../constants'
import {useOpenInNewPane} from '../hooks/useOpenInNewPane'
import {Language, Metadata, TranslationReference} from '../types'

type LanguageOptionProps = {
  language: Language
  languageField: string
  index: number
  schemaType: string
  documentId: string
  disabled: boolean
  current: boolean
  sourceId: string
  sourceLanguageId?: string
  metadata?: Metadata | null
  translation?: TranslationReference
  apiVersion?: string
}

function createReference(
  key: string,
  ref: string,
  type: string
): TranslationReference {
  return {
    _key: key,
    _type: 'internationalizedArrayReferenceValue',
    value: {
      _type: 'reference',
      _ref: ref,
      _weak: true,
      _strengthenOnPublish: {
        type,
      },
    },
  }
}

export default function LanguageOption(props: LanguageOptionProps) {
  const {
    apiVersion = API_VERSION,
    index,
    language,
    languageField,
    schemaType,
    documentId,
    disabled,
    current,
    sourceId,
    sourceLanguageId,
    metadata,
    translation,
  } = props
  const client = useClient({apiVersion})
  const toast = useToast()

  const open = useOpenInNewPane(translation?.value?._ref, schemaType)
  const handleOpen = useCallback(() => open(), [open])

  const handleCreate = useCallback(async () => {
    const metadataExists = Boolean(metadata?._id)
    const transaction = client.transaction()

    // 1. Duplicate current document
    // 2. Update language
    // 3. Add to translation metadata
    const documentIds = documentId.startsWith(`drafts.`)
      ? [documentId, documentId.replace(`drafts.`, ``)]
      : [documentId, `drafts.${documentId}`]
    const latestDocument = await client.fetch(
      `*[_id in $ids]|order(_updatedAt desc)[0]`,
      {
        ids: documentIds,
      }
    )
    const newTranslationDocument = {
      ...latestDocument,
      _id: `drafts.${uuid()}`,
      [languageField]: language.id,
    }

    transaction.create(newTranslationDocument)

    const metadataId = metadata?._id ?? uuid()
    const newTranslationReference = createReference(
      language.id,
      newTranslationDocument._id.replace(`drafts.`, ``),
      schemaType
    )

    // Create translation metadata document if it doesn't already exist
    if (metadataExists) {
      const path = `translations[${index - 1}]`
      const metadataPatch = client
        .patch(metadataId)
        .setIfMissing({translations: []})
        .insert(`before`, path, [newTranslationReference])

      transaction.patch(metadataPatch)
    } else {
      // Source language relies on a field named `language` on the document
      const sourceReference = sourceLanguageId
        ? createReference(sourceLanguageId, sourceId, schemaType)
        : null

      transaction.createIfNotExists({
        _id: metadataId,
        _type: METADATA_SCHEMA_NAME,
        schemaTypes: [schemaType],
        translations: [newTranslationReference, sourceReference].filter(
          Boolean
        ),
      })
    }

    transaction
      .commit
      // {visibility: `async`}
      ()
      .then(() => {
        // openDocumentInSidePane(metadataId, `translation.metadata`)
        return toast.push({
          status: 'success',
          title: `Created ${language.title} translation`,
          description: metadataExists
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
    index,
    language,
    languageField,
    metadata?._id,
    schemaType,
    sourceId,
    sourceLanguageId,
    toast,
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
        disabled={disabled || current}
      >
        <Flex gap={3} align="center">
          {disabled ? (
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
