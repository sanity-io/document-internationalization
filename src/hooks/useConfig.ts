import {useMemo} from 'react'
import {useSchema} from 'sanity'
import type {Ti18nConfig, Ti18nSchema} from '../types'
import {applyConfig, ApplyConfigResult} from '../utils'

export function useConfig(pluginConfig: Ti18nConfig, type?: string): ApplyConfigResult {
  const schemaRegistry = useSchema()
  const schemaI18nConfig = useMemo(() => {
    if (type) {
      const schemaType = schemaRegistry.get(type) as Ti18nSchema | undefined
      if (schemaType && typeof schemaType.i18n !== 'boolean') {
        return schemaType?.i18n
      }
    }
    return null
  }, [type, schemaRegistry])

  return useMemo(
    () => applyConfig(pluginConfig, schemaI18nConfig),
    [schemaI18nConfig, pluginConfig]
  )
}
