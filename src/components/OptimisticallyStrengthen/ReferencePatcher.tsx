import {useEffect} from 'react'
import {PatchEvent, unset, useClient, useEditState} from 'sanity'
import {useDocumentPane} from 'sanity/structure'

import {API_VERSION} from '../../constants'
import type {TranslationReference} from '../../types'

type ReferencePatcherProps = {
  translation: TranslationReference
  documentType: string
  metadataId: string
}

// For every reference, check if it is published, and if so, strengthen the reference
export default function ReferencePatcher(props: ReferencePatcherProps) {
  const {translation, documentType, metadataId} = props
  const editState = useEditState(translation.value._ref, documentType)
  const client = useClient({apiVersion: API_VERSION})
  const {onChange} = useDocumentPane()

  useEffect(() => {
    if (
      // We have a reference
      translation.value._ref &&
      // It's still weak and not-yet-strengthened
      translation.value._weak &&
      // We also want to keep this check because maybe the user *configured* weak refs
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
