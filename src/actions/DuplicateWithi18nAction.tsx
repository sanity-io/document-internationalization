import React from 'react'
import {CopyIcon} from '@sanity/icons'
import {useDocumentOperation} from 'sanity'
import {useToast} from '@sanity/ui'
import {uuid} from '@sanity/uuid'
import type {DocumentActionComponent, DocumentActionDescription} from 'sanity/desk'
import {
  buildDocId,
  getBaseIdFromId,
  getLanguageFromDocument,
  getTranslationsFor,
  useSanityClient,
} from '../utils'
import {IUseDocumentOperationResult, Ti18nConfig} from '../types'
import {UiMessages} from '../constants'
import {useConfig} from '../hooks'

/**
 * This code is mostly taken from the default DuplicateAction provided by Sanity
 */

const DISABLED_REASON_TITLE = {
  NOTHING_TO_DUPLICATE: "This document doesn't yet exist so there's nothing to duplicate",
}

export function createDuplicateAction(pluginConfig: Ti18nConfig): DocumentActionComponent {
  return ({id, type, draft, published}): DocumentActionDescription => {
    const toast = useToast()
    const client = useSanityClient()
    const config = useConfig(pluginConfig, type)
    const baseDocumentId = getBaseIdFromId(id)
    const {duplicate: duplicateOp} = useDocumentOperation(id, type) as IUseDocumentOperationResult
    const [isDuplicating, setDuplicating] = React.useState(false)

    const onDuplicate = React.useCallback(async () => {
      setDuplicating(true)
      try {
        const dupeId = uuid()
        const translations = await getTranslationsFor(client, config, baseDocumentId)
        const transaction = client.transaction()
        transaction.create({
          ...(draft ?? published),
          _id: dupeId,
          _type: type,
        })
        translations.forEach((t) => {
          const isDraft = t._id.startsWith('drafts.')
          const newId = buildDocId(config, dupeId, getLanguageFromDocument(t, config))
          transaction.create({
            ...t,
            _id: isDraft ? `drafts.${newId}` : newId,
          })
        })
        await transaction.commit()
      } catch (err) {
        console.error(err)
        toast.push({
          description: (err as Error).message,
        })
      }
      setDuplicating(false)
    }, [client, config, toast, baseDocumentId, type, draft, published])

    return {
      icon: CopyIcon,
      disabled: Boolean(duplicateOp.disabled) || isDuplicating,
      title:
        (duplicateOp.disabled &&
          DISABLED_REASON_TITLE[duplicateOp.disabled as keyof typeof DISABLED_REASON_TITLE]) ||
        '',
      label: isDuplicating
        ? UiMessages.duplicateAll.duplicating
        : UiMessages.duplicateAll.buttonTitle,
      onHandle: onDuplicate,
    }
  }
}
