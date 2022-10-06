import React from 'react'
import {TrashIcon} from '@sanity/icons'
import {useDocumentOperation, useEditState, useSyncState} from 'sanity'
import {ConfirmDeleteDialog} from 'sanity/desk'
import {useToast} from '@sanity/ui'
import type {DocumentActionComponent, DocumentActionDescription} from 'sanity'
import {IEditState, IUseDocumentOperationResult, Ti18nConfig} from '../types'
import {getBaseIdFromId, getTranslationsFor, useSanityClient} from '../utils'
import {UiMessages} from '../constants'
import {useConfig} from '../hooks'

/**
 * This code is mostly taken from the defualt DeleteAction provided by Sanity
 */
const DISABLED_REASON_TITLE = {
  NOTHING_TO_DELETE: "This document doesn't yet exist or is already deleted",
}

export function createDeleteAction(pluginConfig: Ti18nConfig): DocumentActionComponent {
  return function DeleteWith18nAction({id, type, onComplete}): DocumentActionDescription {
    const toast = useToast()
    const client = useSanityClient()
    const config = useConfig(pluginConfig, type)
    const baseDocumentId = React.useMemo(() => getBaseIdFromId(id), [id])
    const baseDocumentEditState = useEditState(baseDocumentId, type) as IEditState
    const syncState = useSyncState(id, type)
    const baseDocumentSyncState = useSyncState(baseDocumentId, type)
    const {delete: deleteOp} = useDocumentOperation(id, type) as IUseDocumentOperationResult
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isConfirmDialogOpen, setConfirmDialogOpen] = React.useState(false)

    const onHandle = React.useCallback(() => {
      setConfirmDialogOpen(true)
    }, [])

    const onDialogCancel = React.useCallback(() => {
      setConfirmDialogOpen(false)
      if (onComplete) onComplete()
    }, [onComplete])

    const onDialogConfirm = React.useCallback(async () => {
      try {
        setIsDeleting(true)
        setConfirmDialogOpen(false)

        if (baseDocumentEditState.draft || baseDocumentEditState.published) {
          const baseTransaction = client.transaction()
          if (baseDocumentEditState.draft) {
            baseTransaction.delete(`drafts.${baseDocumentId}`)
          }
          if (baseDocumentEditState.published) {
            baseTransaction.patch(baseDocumentId, {
              unset: [config.fieldNames.references],
            })
          }
          await baseTransaction.commit()
        }

        const translatedDocuments = await getTranslationsFor(client, config, baseDocumentId, true)
        const translationsTransaction = client.transaction()
        translatedDocuments.forEach((doc) => {
          translationsTransaction.delete(doc._id)
        })
        await translationsTransaction.commit()

        deleteOp.execute()
        if (onComplete) onComplete()
      } catch (err) {
        toast.push({
          closable: true,
          status: 'error',
          title: (err as Error).toString(),
        })
      } finally {
        setIsDeleting(true)
      }
    }, [
      toast,
      config,
      client,
      baseDocumentId,
      baseDocumentEditState.draft,
      baseDocumentEditState.published,
      deleteOp,
      onComplete,
    ])

    return {
      onHandle,
      tone: 'critical',
      icon: TrashIcon,
      disabled:
        isDeleting ||
        Boolean(deleteOp.disabled) ||
        syncState.isSyncing ||
        baseDocumentSyncState.isSyncing,
      shortcut: 'CTRL+ALT+D',
      title:
        (deleteOp.disabled &&
          DISABLED_REASON_TITLE[deleteOp.disabled as keyof typeof DISABLED_REASON_TITLE]) ||
        '',
      label: isDeleting ? UiMessages.deleteAll.deleting : UiMessages.deleteAll.buttonTitle,
      modal: isConfirmDialogOpen && {
        type: 'dialog',
        onClose: onComplete,
        content: (
          <ConfirmDeleteDialog
            action="delete"
            id={id}
            type={type}
            onCancel={onDialogCancel}
            onConfirm={onDialogConfirm}
          />
        ),
      },
    }
  }
}
