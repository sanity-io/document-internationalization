import React, {useCallback} from 'react'
import {useClient} from 'sanity'
import {Button, Badge, Box, Flex, Text, useToast, Spinner} from '@sanity/ui'
import {uuid} from '@sanity/uuid'
import {SplitVerticalIcon, AddIcon, CheckmarkIcon} from '@sanity/icons'

import {Language, Metadata, TranslationReference} from '../types'
import {METADATA_SCHEMA_NAME} from '../constants'
import {useOpenInNewPane} from '../hooks/useOpenInNewPane'

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
}

function createReference(key: string, ref: string, type: string) {
  return {
    _key: key,
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
  const client = useClient()
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
    const latestDocument = await client.fetch(`*[_id in $ids]|order(_updatedAt desc)[0]`, {
      ids: documentIds,
    })
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
        translations: [newTranslationReference, sourceReference].filter(Boolean),
      })
    }

    transaction
      .commit()
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

  return (
    <Button
      onClick={translation ? handleOpen : handleCreate}
      mode={current ? `default` : `bleed`}
      disabled={disabled || current}
    >
      <Flex gap={3} align="center">
        {disabled ? (
          <Spinner />
        ) : (
          <Text size={2}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {translation ? <SplitVerticalIcon /> : current ? <CheckmarkIcon /> : <AddIcon />}
          </Text>
        )}
        <Box flex={1}>
          <Text>{language.title}</Text>
        </Box>
        <Badge tone={disabled || current ? `default` : `primary`}>{language.id}</Badge>
      </Flex>
    </Button>
  )
}
