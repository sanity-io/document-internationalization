import React, {useCallback} from 'react'
import {Box, Text, Stack, Button, useToast} from '@sanity/ui'
import {
  InputProps,
  Reference,
  SanityDocument,
  KeyedObject,
  TypedObject,
  useClient,
  useWorkspace,
} from 'sanity'
import DocumentCheck from './DocumentCheck'

export type TranslationReference = KeyedObject & TypedObject & {value: Reference}

export type TranslationMetadataDocument = SanityDocument & {
  translations: TranslationReference[]
  schemaTypes: string[]
}

export default function BulkPublish(props: InputProps) {
  const {translations} = props.value as TranslationMetadataDocument
  const client = useClient({apiVersion: `v2022-11-21`})
  const {projectId, dataset} = useWorkspace()
  const toast = useToast()
  const [invalidIds, setInvalidIds] = React.useState<string[]>([])

  const addId = useCallback((id: string) => {
    setInvalidIds((ids) => [...ids, id])
  }, [])

  const removeId = useCallback((id: string) => {
    setInvalidIds((ids) => ids.filter((i) => i !== id))
  }, [])

  const handleBulkPublish = useCallback(() => {
    const body = translations.map((translation) => ({documentId: translation.value._ref}))
    client
      .request({
        uri: `/publish/${projectId}/${dataset}`,
        method: 'POST',
        body,
      })
      .then((res) => {
        toast.push({
          status: 'success',
          title: 'Success',
          description: 'Bulk publish complete',
        })
      })
      .catch((err) => {
        console.error(err)
        toast.push({
          status: 'error',
          title: 'Error',
          description: 'Bulk publish failed',
        })
      })
  }, [translations, client, projectId, dataset, toast])

  // TODO: Hide all this if none of the documents have drafts
  return translations?.length > 0 ? (
    <Stack space={4}>
      <Stack space={3}>
        <Text weight="bold" size={1}>
          Bulk publishing
        </Text>
        <Text>
          There{' '}
          {translations.length === 1 ? `is 1 document` : `are ${translations.length} documents`}.
        </Text>
        {invalidIds.length > 0 ? (
          <Text weight="medium">
            {invalidIds.length === 1 ? `1 draft has` : `${invalidIds.length} drafts have`}{' '}
            validation issues that must addressed first.
          </Text>
        ) : (
          <Text>They are all valid.</Text>
        )}
      </Stack>
      <Stack space={2}>
        {translations.map((translation) => (
          <DocumentCheck
            key={translation._key}
            id={translation.value._ref}
            addId={addId}
            removeId={removeId}
          />
        ))}
      </Stack>
      <Button
        text={`Simultaneously Publish ${
          translations.length === 1 ? `1 Document` : `${translations.length} Documents`
        }`}
        onClick={handleBulkPublish}
        disabled={Boolean(invalidIds.length)}
      />
    </Stack>
  ) : null
}
