import {Button, Card, Dialog, Inline, Stack, Text, useToast} from '@sanity/ui'
import {useCallback, useState} from 'react'
import {TextWithTone, useClient, useWorkspace} from 'sanity'

import {API_VERSION} from '../../constants'
import type {TranslationReference} from '../../types'
import DocumentCheck from './DocumentCheck'
import Info from './Info'

export type BulkPublishProps = {
  translations: TranslationReference[]
}

// A root-level component with UI for hitting the Publishing API
export default function BulkPublish(props: BulkPublishProps) {
  const {translations} = props
  const client = useClient({apiVersion: API_VERSION})
  const {projectId, dataset} = useWorkspace()
  const toast = useToast()
  const [invalidIds, setInvalidIds] = useState<string[] | null>(null)
  const [checkedIds, setCheckedIds] = useState<string[]>([])

  const onCheckComplete = useCallback((id: string) => {
    setCheckedIds((ids) => Array.from(new Set([...ids, id])))
  }, [])

  // Handle dialog
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => setOpen(true), [])
  const onClose = useCallback(() => setOpen(false), [])

  const addInvalidId = useCallback((id: string) => {
    setInvalidIds((ids) => (ids ? Array.from(new Set([...ids, id])) : [id]))
  }, [])

  const removeInvalidId = useCallback((id: string) => {
    setInvalidIds((ids) => (ids ? ids.filter((i) => i !== id) : []))
  }, [])

  const [draftIds, setDraftIds] = useState<string[]>([])

  const addDraftId = useCallback((id: string) => {
    setDraftIds((ids) => Array.from(new Set([...ids, id])))
  }, [])

  const removeDraftId = useCallback((id: string) => {
    setDraftIds((ids) => ids.filter((i) => i !== id))
  }, [])

  const handleBulkPublish = useCallback(() => {
    const body = translations.map((translation) => ({
      documentId: translation.value._ref,
    }))
    client
      .request({
        uri: `/publish/${projectId}/${dataset}`,
        method: 'POST',
        body,
      })
      .then(() => {
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

  const disabled =
    // Not all documents have been checked
    checkedIds.length !== translations.length ||
    // Some document(s) are invalid
    Boolean(invalidIds && invalidIds?.length > 0) ||
    // No documents are drafts
    !draftIds.length

  return translations?.length > 0 ? (
    <Card padding={4} border radius={2}>
      <Stack space={3}>
        <Inline space={3}>
          <Text weight="bold" size={1}>
            Bulk publishing
          </Text>
          <Info />
        </Inline>

        <Stack>
          <Button
            onClick={onOpen}
            text="Prepare bulk publishing"
            mode="ghost"
          />
        </Stack>

        {open && (
          <Dialog
            animate
            header="Bulk publishing"
            id="bulk-publish-dialog"
            onClose={onClose}
            zOffset={1000}
            width={3}
          >
            <Stack space={4} padding={4}>
              {draftIds.length > 0 ? (
                <Stack space={2}>
                  <Text size={1}>
                    There{' '}
                    {draftIds.length === 1
                      ? `is 1 draft document`
                      : `are ${draftIds.length} draft documents`}
                    .
                  </Text>
                  {invalidIds && invalidIds.length > 0 ? (
                    <TextWithTone tone="critical" size={1}>
                      {invalidIds && invalidIds.length === 1
                        ? `1 draft document has`
                        : `${
                            invalidIds && invalidIds.length
                          } draft documents have`}{' '}
                      validation issues that must addressed first
                    </TextWithTone>
                  ) : (
                    <TextWithTone tone="positive" size={1}>
                      All drafts are valid and can be bulk published
                    </TextWithTone>
                  )}
                </Stack>
              ) : null}

              <Stack space={1}>
                {translations
                  .filter((translation) => translation?.value?._ref)
                  .map((translation) => (
                    <DocumentCheck
                      key={translation._key}
                      id={translation.value._ref}
                      onCheckComplete={onCheckComplete}
                      addInvalidId={addInvalidId}
                      removeInvalidId={removeInvalidId}
                      addDraftId={addDraftId}
                      removeDraftId={removeDraftId}
                    />
                  ))}
              </Stack>
              {draftIds.length > 0 ? (
                <Button
                  mode="ghost"
                  tone={
                    invalidIds && invalidIds?.length > 0
                      ? 'caution'
                      : 'positive'
                  }
                  text={
                    draftIds.length === 1
                      ? `Publish draft document`
                      : `Bulk publish ${draftIds.length} draft documents`
                  }
                  onClick={handleBulkPublish}
                  disabled={disabled}
                />
              ) : (
                <Text muted size={1}>
                  No draft documents to publish
                </Text>
              )}
            </Stack>
          </Dialog>
        )}
      </Stack>
    </Card>
  ) : null
}
