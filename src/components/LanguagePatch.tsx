import {EditIcon} from '@sanity/icons'
import {Badge, Box, Button, Flex, Text, useToast} from '@sanity/ui'
import React from 'react'
import {SanityDocument, useClient} from 'sanity'

import {API_VERSION} from '../constants'
import {Language} from '../types'

type LanguagePatchProps = {
  language: Language
  languageField: string
  source: SanityDocument | null
  disabled: boolean
  apiVersion?: string
}

export default function LanguagePatch(props: LanguagePatchProps) {
  const {apiVersion = API_VERSION, language, languageField, source} = props
  const disabled = props.disabled || !source
  const client = useClient({apiVersion})
  const toast = useToast()

  const handleClick = React.useCallback(() => {
    if (!source) {
      throw new Error(`Cannot patch missing document`)
    }

    const currentId = source._id

    client
      .patch(currentId)
      .set({[languageField]: language.id})
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
  }, [source, client, languageField, language, toast])

  return (
    <Button
      mode="bleed"
      onClick={handleClick}
      disabled={disabled}
      justify="flex-start"
    >
      <Flex gap={3} align="center">
        <Text size={2}>
          <EditIcon />
        </Text>
        <Box flex={1}>
          <Text>{language.title}</Text>
        </Box>
        <Badge>{language.id}</Badge>
      </Flex>
    </Button>
  )
}
