import React from 'react'
import {DocumentPaneContext} from '@sanity/desk-tool/lib/panes/document/DocumentPaneContext'
import type {SchemaType} from '@sanity/types'
import {Ti18nConfig} from '../types'
import {LanguageSelect} from './components'
// import {LanguageFilterErrorBoundary} from './components/LanguageFilterErrorBoundary'

type Props = {
  schemaType?: SchemaType & {
    i18n?: boolean | Ti18nConfig
  }
}

const LanguageSelectContainer: React.FC<Props> = ({schemaType}) => {
  const documentContext = React.useContext(DocumentPaneContext)

  React.useEffect(() => {
    import('@sanity/language-filter').then(console.log).catch(console.log)
  }, [])

  if (schemaType?.i18n && documentContext.displayed?._id) {
    return <LanguageSelect schemaType={schemaType} document={documentContext.displayed} />
  }

  return null
}

export default LanguageSelectContainer
