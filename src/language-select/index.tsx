import React from 'react'
import {DocumentPaneContext} from '@sanity/desk-tool/lib/panes/document/DocumentPaneContext'
import type {SchemaType} from '@sanity/types'
import {LanguageSelect} from './components'

type Props = {
  schemaType?: SchemaType
}

const LanguageSelectContainer: React.FC<Props> = ({schemaType}) => {
  const documentContext = React.useContext(DocumentPaneContext)

  if (schemaType && documentContext.displayed?._id) {
    return <LanguageSelect schemaType={schemaType} document={documentContext.displayed} />
  }

  return null
}

export default LanguageSelectContainer
