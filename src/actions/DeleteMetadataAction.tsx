import {TrashIcon} from '@sanity/icons'
import {type ButtonTone, useToast} from '@sanity/ui'
import {useCallback, useMemo, useState} from 'react'
import {
  type DocumentActionComponent,
  type KeyedObject,
  type Reference,
  type TypedObject,
  useClient,
} from 'sanity'

import {API_VERSION, TRANSLATIONS_ARRAY_NAME} from '../constants'

type TranslationReference = TypedObject &
  KeyedObject & {
    value: Reference
  }

export const DeleteMetadataAction: DocumentActionComponent = (props) => {
  const {id: documentId, published, draft, onComplete} = props
  const doc = draft || published

  const [isDialogOpen, setDialogOpen] = useState(false)
  const onClose = useCallback(() => setDialogOpen(false), [])
  const translations: TranslationReference[] = useMemo(
    () =>
      doc && Array.isArray(doc[TRANSLATIONS_ARRAY_NAME])
        ? (doc[TRANSLATIONS_ARRAY_NAME] as TranslationReference[])
        : [],
    [doc]
  )

  const toast = useToast()
  const client = useClient({apiVersion: API_VERSION})

  // Remove translation reference and delete document in one transaction
  const onProceed = useCallback(() => {
    const tx = client.transaction()

    tx.patch(documentId, (patch) => patch.unset([TRANSLATIONS_ARRAY_NAME]))

    if (translations.length > 0) {
      translations.forEach((translation) => {
        tx.delete(translation.value._ref)
        tx.delete(`drafts.${translation.value._ref}`)
      })
    }

    tx.delete(documentId)
    // Shouldn't exist as this document type is in liveEdit
    tx.delete(`drafts.${documentId}`)

    tx.commit()
      .then(() => {
        onClose()

        toast.push({
          status: 'success',
          title: 'Deleted document and translations',
        })
      })
      .catch((err) => {
        toast.push({
          status: 'error',
          title: 'Failed to delete document and translations',
          description: err.message,
        })
      })
  }, [client, translations, documentId, onClose, toast])

  return {
    label: `Delete all translations`,
    disabled: !doc || !translations.length,
    icon: TrashIcon,
    tone: 'critical' as ButtonTone,
    onHandle: () => {
      setDialogOpen(true)
    },
    dialog: isDialogOpen && {
      type: 'confirm',
      onCancel: onComplete,
      onConfirm: () => {
        onProceed()
        onComplete()
      },
      tone: 'critical' as ButtonTone,
      message:
        translations.length === 1
          ? `Delete 1 translation and this document`
          : `Delete all ${translations.length} translations and this document`,
    },
  }
}
