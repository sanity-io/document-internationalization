import * as React from 'react'
import {
  useDocumentOperation,
  useEditState,
  useSyncState,
  useValidationStatus,
} from '@sanity/react-hooks'
import {useToast} from '@sanity/ui'
import {CheckmarkIcon, PublishIcon} from '@sanity/icons'
import {getBaseIdFromId, getConfig, getSchema, updateIntlFieldsForDocument} from '../utils'
import {ReferenceBehavior, UiMessages} from '../constants'
import {IEditState, IResolverProps, IUseDocumentOperationResult, Ti18nSchema} from '../types'
import { useDelayedFlag } from '../hooks'

export const PublishWithi18nAction = ({type, id, onComplete}: IResolverProps) => {
  const toast = useToast()
  const baseDocumentId = getBaseIdFromId(id)
  const [publishState, setPublishState] = React.useState<'publishing' | 'published' | null>(null)
  const [updatingIntlFields, setUpdatingIntlFields] = React.useState(false)
  const {draft, published} = useEditState(id, type) as IEditState
  const baseDocumentEditState = useEditState(baseDocumentId, type) as IEditState
  const {publish} = useDocumentOperation(id, type) as IUseDocumentOperationResult
  const {isValidating, markers} = useValidationStatus(id, type)
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
      markers.some((marker) => marker.level === 'error')
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
        console.log(baseDocumentEditState.published)
        await updateIntlFieldsForDocument(document, baseDocumentEditState.published)
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
        title: err.toString(),
      })
    }
    setUpdatingIntlFields(false)
  }, [toast, draft, published, baseDocumentEditState.published])

  const onHandle = React.useCallback(() => {
    setPublishState('publishing')
    const schema = getSchema<Ti18nSchema>(type)
    const config = getConfig(schema)
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
  }, [id, baseDocumentId, type, publish, baseDocumentEditState.published])

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
      console.log('didPublish', publishState, draft)
      doUpdateIntlFields().then(() => {
        if (onComplete) onComplete()
      })
    }
  }, [publishState])

  return {
    disabled,
    label,
    icon: publishState === 'published' ? CheckmarkIcon : PublishIcon,
    shortcut: disabled ? null : 'Ctrl+Alt+P',
    onHandle,
  }
}
