import React from 'react'
import {
  KeyedObject,
  PatchEvent,
  Reference,
  unset,
  useClient,
  useEditState,
} from 'sanity'
import {useDocumentPane} from 'sanity/desk'

import {API_VERSION} from '../../constants'

type ReferencePatcherProps = {
  translation: KeyedObject & {value: Reference}
  documentType: string
  metadataId: string
}

// For every reference, check if it is published, and if so, strengthen the reference
export default function ReferencePatcher(props: ReferencePatcherProps) {
  const {translation, documentType, metadataId} = props
  const editState = useEditState(translation.value._ref, documentType)
  const client = useClient({apiVersion: API_VERSION})
  const {onChange} = useDocumentPane()

  React.useEffect(() => {
    if (
      // We have a reference
      translation.value._ref &&
      // It's still weak and not-yet-strengthened
      translation.value._weak &&
      translation.value._strengthenOnPublish &&
      // The referenced document has just been published
      !editState.draft &&
      editState.published &&
      editState.ready
    ) {
      const referencePathBase = [
        'translations',
        {_key: translation._key},
        'value',
      ]

      onChange(
        new PatchEvent([
          unset([...referencePathBase, '_weak']),
          unset([...referencePathBase, '_strengthenOnPublish']),
        ])
      )
    }
  }, [translation, editState, metadataId, client, onChange])

  return null
}
