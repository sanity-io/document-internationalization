import React from 'react'
import ContentCopyIcon from 'part:@sanity/base/content-copy-icon'
import {useDocumentOperation} from '@sanity/react-hooks'
import {useToast} from '@sanity/ui'
import {uuid} from '@sanity/uuid'
import type {DocumentActionComponent} from '@sanity/base'
import {
  getSanityClient,
  getBaseIdFromId,
  getTranslationsFor,
  buildDocId,
  getLanguageFromDocument,
  getConfig,
} from '../utils'
import {IUseDocumentOperationResult} from '../types'
import {UiMessages} from '../constants'

/**
 * This code is mostly taken from the default DuplicateAction provided by Sanity
 */

const DISABLED_REASON_TITLE = {
  NOTHING_TO_DUPLICATE: "This document doesn't yet exist so there's nothing to duplicate",
}

export const DuplicateWithi18nAction: DocumentActionComponent = ({id, type, draft, published}) => {
  const toast = useToast()
  const config = React.useMemo(() => getConfig(type), [type])
  const client = getSanityClient()
  const baseDocumentId = getBaseIdFromId(id)
  const {duplicate: duplicateOp} = useDocumentOperation(id, type) as IUseDocumentOperationResult
  const [isDuplicating, setDuplicating] = React.useState(false)

  const onDuplicate = React.useCallback(async () => {
    setDuplicating(true)
    try {
      const dupeId = uuid()
      const translations = await getTranslationsFor(baseDocumentId)
      const transaction = client.transaction()
      transaction.create({
        ...(draft ?? published),
        _id: dupeId,
        _type: type,
      })
      translations.forEach((t) => {
        const isDraft = t._id.startsWith('drafts.')
        const newId = buildDocId(dupeId, getLanguageFromDocument(t, config))
        transaction.create({
          ...t,
          _id: isDraft ? `drafts.${newId}` : newId,
        })
      })
      await transaction.commit()
    } catch (err) {
      console.error(err)
      toast.push(err.message)
    }
    setDuplicating(false)
  }, [client, toast, config, baseDocumentId, type, draft, published])

  return {
    icon: ContentCopyIcon,
    disabled: Boolean(duplicateOp.disabled) || isDuplicating,
    title: (duplicateOp.disabled && DISABLED_REASON_TITLE[duplicateOp.disabled]) || '',
    label: isDuplicating
      ? UiMessages.duplicateAll.duplicating
      : UiMessages.duplicateAll.buttonTitle,
    onHandle: onDuplicate,
  }
}
