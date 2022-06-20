import React from 'react'
import {SanityDocument, InputProps, RenderInputCallback} from 'sanity'
import {Flex} from '@sanity/ui'
import {Ti18nConfig} from '../../../types'
import {LanguageSelect} from './LanguageSelect'
import {LanguageConfigContext} from './LanguageConfigContext'

export type LanguageSelectProps = InputProps & {
  config: Ti18nConfig
  next: RenderInputCallback
}

export function LanguageSelectWrapped(props: LanguageSelectProps) {
  const {next, config, ...inputProps} = props
  const doc = props.value as SanityDocument
  return (
    <LanguageConfigContext.Provider value={config}>
      {doc._id && (
        <Flex flex={1} justify="flex-end">
          <LanguageSelect schemaType={props.schemaType} document={doc} />
        </Flex>
      )}
      {next(inputProps)}
    </LanguageConfigContext.Provider>
  )
}
