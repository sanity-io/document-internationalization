import React from 'react'
import {ChevronRightIcon} from '@sanity/icons'
import {Button, useToast} from '@sanity/ui'
import {SanityDocument, useClient} from 'sanity'

import {Language} from './types'

type LanguagePatchProps = {
  language: Language
  languageField: string
  documentId: string
  schemaType: string
  source: SanityDocument | null
}

export default function LanguagePatch(props: LanguagePatchProps) {
  const {language, languageField, documentId, schemaType, source} = props
  const client = useClient()
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
    />
  )
}
