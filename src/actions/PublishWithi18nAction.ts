import * as React from 'react'

import {useToast} from '@sanity/ui'
import {CheckmarkIcon, PublishIcon} from '@sanity/icons'
import {useDocumentOperation, useEditState, useSyncState, useValidationStatus} from 'sanity'
import type {DocumentActionComponent, DocumentActionDescription} from 'sanity/desk'
import {getBaseIdFromId, updateIntlFieldsForDocument, useSanityClient} from '../utils'
import {ReferenceBehavior, UiMessages} from '../constants'
import {IEditState, IUseDocumentOperationResult, Ti18nConfig} from '../types'
import {useConfig, useDelayedFlag} from '../hooks'

export function createPublishAction(pluginConfig: Ti18nConfig): DocumentActionComponent {
  return ({type, id, onComplete}): DocumentActionDescription => {
    const toast = useToast()
    const client = useSanityClient()
    const config = useConfig(pluginConfig, type)
    const baseDocumentId = getBaseIdFromId(id)
    const updatingIntlFieldsPromiseRef = React.useRef<Promise<void> | null>(null)
    const [publishState, setPublishState] = React.useState<'publishing' | 'published' | null>(null)
    const [updatingIntlFields, setUpdatingIntlFields] = React.useState(false)
    const {draft, published} = useEditState(id, type) as IEditState
    const baseDocumentEditState = useEditState(baseDocumentId, type) as IEditState
    const {publish} = useDocumentOperation(id, type) as IUseDocumentOperationResult
    const {isValidating, validation} = useValidationStatus(id, type)
    const syncState = useSyncState(id, type)
    const baseDocumentSyncState = useSyncState(baseDocumentId, type)
    const disabled = useDelayedFlag(
      !!(
        publishState === 'published' ||
        publishState === 'publishing' ||
        updatingIntlFields ||
        publish.disabled ||
        syncState.isSyncing ||
        baseDocumentSyncState.isSyncing ||
        isValidating ||
        validation.some((marker) => marker.level === 'error')
      )
    )

    const label = React.useMemo(() => {
      if (publishState === 'publishing') return UiMessages.publishing
      if (updatingIntlFields) return UiMessages.updatingIntlFields
      return UiMessages.publish
    }, [publishState, updatingIntlFields])

    const doUpdateIntlFields = React.useCallback(async () => {
      setUpdatingIntlFields(true)
      try {
        const document = draft || published
        if (document) {
          await updateIntlFieldsForDocument(
            client,
            config,
            document,
            baseDocumentEditState.published
          )
        }

        toast.push({
          closable: true,
          status: 'success',
          title: UiMessages.intlFieldsUpdated,
        })
      } catch (err) {
        console.error(err)
        toast.push({
          closable: true,
          status: 'error',
          title: (err as Error).toString(),
        })
      }
      setUpdatingIntlFields(false)
    }, [toast, draft, published, client, baseDocumentEditState.published, config])

    const onHandle = React.useCallback(() => {
      setPublishState('publishing')
      const isTranslation = id !== baseDocumentId
      if (
        isTranslation &&
        !baseDocumentEditState.published &&
        config.referenceBehavior === ReferenceBehavior.STRONG
      ) {
        throw new Error(UiMessages.errors.baseDocumentNotPublished)
      } else {
        publish.execute()
      }
    }, [id, baseDocumentId, publish, config, baseDocumentEditState.published])

    React.useEffect(() => {
      const didPublish = publishState === 'publishing' && !draft

      const nextState = didPublish ? 'published' : null
      const delay = didPublish ? 200 : 4000
      const timer = setTimeout(() => {
        setPublishState(nextState)
      }, delay)
      return () => clearTimeout(timer)
    }, [publishState, draft])

    React.useEffect(() => {
      if (publishState === 'published') {
        if (!updatingIntlFieldsPromiseRef.current) {
          updatingIntlFieldsPromiseRef.current = doUpdateIntlFields()
            .then(() => onComplete && onComplete())
            .finally(() => (updatingIntlFieldsPromiseRef.current = null))
        }
      }
    }, [publishState, onComplete, doUpdateIntlFields])

    return {
      disabled,
      label,
      icon: publishState === 'published' ? CheckmarkIcon : PublishIcon,
      shortcut: disabled ? null : 'Ctrl+Alt+P',
      onHandle,
    }
  }
}
