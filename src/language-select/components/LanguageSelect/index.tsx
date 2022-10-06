import React from 'react'
import {InputProps, SanityDocument} from 'sanity'
import {Flex} from '@sanity/ui'
import {Ti18nConfig} from '../../../types'
import {LanguageSelect} from './LanguageSelect'
import {LanguageConfigContext} from './LanguageConfigContext'

export type LanguageSelectProps = InputProps & {
  config: Ti18nConfig
}

export function LanguageSelectWrapped(props: LanguageSelectProps) {
  const {config, ...inputProps} = props
  const doc = props.value as SanityDocument
  return (
    <LanguageConfigContext.Provider value={config}>
      {doc._id && (
        <Flex flex={1} justify="flex-end">
          <LanguageSelect schemaType={props.schemaType} document={doc} />
        </Flex>
      )}
      {props.renderDefault(inputProps)}
    </LanguageConfigContext.Provider>
  )
}
