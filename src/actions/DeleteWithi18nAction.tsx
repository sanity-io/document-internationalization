import React from 'react'
import TrashIcon from 'part:@sanity/base/trash-icon'
import * as ConfirmDeleteModule from '@sanity/desk-tool/lib/components/ConfirmDelete'
import {useDocumentOperation, useEditState, useSyncState} from '@sanity/react-hooks'
import {useToast} from '@sanity/ui'
import {IEditState, IResolverProps, IUseDocumentOperationResult} from '../types'
import {getSanityClient, getBaseIdFromId, getTranslationsFor, getConfig} from '../utils'
import {UiMessages} from '../constants'

/**
 * This code is mostly taken from the defualt DeleteAction provided by Sanity
 */

const DISABLED_REASON_TITLE = {
  NOTHING_TO_DELETE: "This document doesn't yet exist or is already deleted",
}

export const DeleteWithi18nAction = ({id, type, onComplete}: IResolverProps) => {
  const toast = useToast()
  const ConfirmDelete = React.useMemo(
    () => ConfirmDeleteModule?.ConfirmDelete ?? ConfirmDeleteModule?.default,
    [ConfirmDeleteModule]
  )
  const config = React.useMemo(() => getConfig(type), [type])
  const baseDocumentId = React.useMemo(() => getBaseIdFromId(id), [id])
  const baseDocumentEditState = useEditState(baseDocumentId, type) as IEditState
  const syncState = useSyncState(id, type)
  const baseDocumentSyncState = useSyncState(baseDocumentId, type)
  const {draft, published} = useEditState(id, type) as IEditState
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

      const translatedDocuments = await getTranslationsFor(baseDocumentId)
      const translationsTransaction = client.transaction()
      translatedDocuments.forEach((doc) => {
        translationsTransaction.delete(`drafts.${doc._id}`)
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
  }, [baseDocumentId, baseDocumentEditState.draft, baseDocumentEditState.published, deleteOp, onComplete])

  const dialogContent = React.useMemo(() => {
    if (isConfirmDialogOpen) {
      return (
        <ConfirmDelete
          draft={draft}
          published={published}
          onCancel={onDialogCancel}
          onConfirm={onDialogConfirm}
        />
      )
    }

    return null
  }, [isConfirmDialogOpen, draft, published, onDialogCancel, onDialogConfirm])

  return {
    onHandle,
    color: 'danger',
    icon: TrashIcon,
    disabled:
      isDeleting ||
      Boolean(deleteOp.disabled) ||
      syncState.isSyncing ||
      baseDocumentSyncState.isSyncing,
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
