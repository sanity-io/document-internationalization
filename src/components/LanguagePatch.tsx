import React from 'react'
import {ChevronRightIcon} from '@sanity/icons'
import {Button, useToast} from '@sanity/ui'
import {SanityDocument, useClient} from 'sanity'

import {Language} from '../types'
import {API_VERSION} from '../constants'

type LanguagePatchProps = {
  language: Language
  languageField: string
  documentId: string
  schemaType: string
  source: SanityDocument | null
  disabled: boolean
  apiVersion?: string
}

export default function LanguagePatch(props: LanguagePatchProps) {
  const {
    apiVersion = API_VERSION,
    language,
    languageField,
    documentId,
    schemaType,
    source,
    disabled = false,
  } = props
  const client = useClient({apiVersion})
  const toast = useToast()

  const handleClick = React.useCallback(() => {
    const currentId = source ? source._id : `draft.${documentId}`
    const transaction = client.transaction()

    if (!source) {
      transaction.createIfNotExists({
        _id: currentId,
        _type: schemaType,
      })
    }

    const patch = client.patch(currentId).set({[languageField]: language.id})
    transaction.patch(patch)

    transaction
      .commit()
      .then(() => {
        toast.push({
          title: `Set document language to ${language.title}`,
          status: `success`,
        })
      })
      .catch((err) => {
        console.error(err)

        return toast.push({
          title: `Failed to set document language to ${language.title}`,
          status: `error`,
        })
      })
  }, [source, documentId, client, languageField, language, schemaType, toast])

  return (
    <Button
      mode="ghost"
      text={language.title}
      icon={ChevronRightIcon}
      onClick={() => handleClick()}
      disabled={disabled}
      justify="flex-start"
    />
  )
}
