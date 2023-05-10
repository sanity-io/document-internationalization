import {useContext} from 'react'
import {createContext} from 'react'
import {LayoutProps} from 'sanity'

import {DEFAULT_CONFIG} from '../constants'
import {PluginConfig} from '../types'

export type DocumentInternationalizationContextValue = Required<PluginConfig>

const DocumentInternationalizationContext =
  createContext<Required<DocumentInternationalizationContextValue>>(
    DEFAULT_CONFIG
  )

export function useDocumentInternationalizationContext(id?: string) {
  return useContext(DocumentInternationalizationContext)
}

type DocumentInternationalizationProviderProps = LayoutProps & {
  pluginConfig: Required<PluginConfig>
}

/**
 * This Provider wraps the Studio and provides the DocumentInternationalization context to document actions and components.
 */
export function DocumentInternationalizationProvider(
  props: DocumentInternationalizationProviderProps
) {
  const {pluginConfig} = props
  return (
    <DocumentInternationalizationContext.Provider value={{...pluginConfig}}>
      {props.renderDefault(props)}
    </DocumentInternationalizationContext.Provider>
  )
}
