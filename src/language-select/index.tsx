import React from 'react'
import {DocumentPaneContext} from '@sanity/desk-tool/lib/panes/document/DocumentPaneContext'
import type {SchemaType} from '@sanity/types'
import languageFilterImplementations from 'all:part:@sanity/desk-tool/language-select-component'
import {Ti18nConfig} from '../types'
import {LanguageSelect} from './components'

type Props = {
  schemaType?: SchemaType & {
    i18n?: boolean | Ti18nConfig
  }
}

const LanguageSelectContainer: React.FC<Props> = ({schemaType}) => {
  const documentContext = React.useContext(DocumentPaneContext)
  const FallbackImplementation = React.useMemo(() => {
    return (
      languageFilterImplementations.filter(
        (component) => LanguageSelectContainer !== component
      )?.[0] ?? null
    )
  }, [])

  if (schemaType?.i18n && documentContext.displayed?._id) {
    return <LanguageSelect schemaType={schemaType} document={documentContext.displayed} />
  }

  if (FallbackImplementation) {
    return <FallbackImplementation schemaType={schemaType} />
  }

  return null
}

export default LanguageSelectContainer
