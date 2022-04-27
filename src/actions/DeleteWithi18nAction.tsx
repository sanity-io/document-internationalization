import React from 'react'
import TrashIcon from 'part:@sanity/base/trash-icon'
import {ConfirmDeleteDialog} from '@sanity/desk-tool/lib/components/confirmDeleteDialog/ConfirmDeleteDialog'
import {useDocumentOperation, useEditState, useSyncState} from '@sanity/react-hooks'
import {useToast} from '@sanity/ui'
import type {DocumentActionComponent} from '@sanity/base'
import {IEditState, IUseDocumentOperationResult} from '../types'
import {getSanityClient, getBaseIdFromId, getTranslationsFor, getConfig} from '../utils'
import {UiMessages} from '../constants'

/**
 * This code is mostly taken from the defualt DeleteAction provided by Sanity
 */

const DISABLED_REASON_TITLE = {
  NOTHING_TO_DELETE: "This document doesn't yet exist or is already deleted",
}

export const DeleteWithi18nAction: DocumentActionComponent = ({id, type, onComplete}) => {
  const toast = useToast()
  const config = React.useMemo(() => getConfig(type), [type])
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
      const client = getSanityClient()

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

      const translatedDocuments = await getTranslationsFor(baseDocumentId, true)
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
        title: err.toString(),
      })
    } finally {
      setIsDeleting(true)
    }
  }, [
    toast,
    baseDocumentId,
    baseDocumentEditState.draft,
    baseDocumentEditState.published,
    deleteOp,
    onComplete,
    config.fieldNames.references,
  ])

  const dialogContent = React.useMemo(() => {
    if (isConfirmDialogOpen) {
      return (
        <ConfirmDeleteDialog
          action="delete"
          id={id}
          type={type}
          onCancel={onDialogCancel}
          onConfirm={onDialogConfirm}
        />
      )
    }

    return null
  }, [id, type, isConfirmDialogOpen, onDialogCancel, onDialogConfirm])

  return {
    onHandle,
    color: 'danger',
    icon: TrashIcon,
    disabled:
      isDeleting ||
      Boolean(deleteOp.disabled) ||
      syncState.isSyncing ||
      baseDocumentSyncState.isSyncing,
    shortcut: 'CTRL+ALT+D',
    title: (deleteOp.disabled && DISABLED_REASON_TITLE[deleteOp.disabled]) || '',
    label: isDeleting ? UiMessages.deleteAll.deleting : UiMessages.deleteAll.buttonTitle,
    dialog: isConfirmDialogOpen && {
      type: 'legacy',
      onClose: onComplete,
      title: 'Delete',
      content: dialogContent,
    },
  }
}
