import compact from 'lodash/compact'
import type {PluginOptions} from 'sanity'
import {deskTool} from 'sanity/desk'
import type {Ti18nConfig} from './types'
import {documentI18n} from './documentI18n'
import {getDocumentList} from './structure'

export function withDocumentI18nPlugin(
  plugins: PluginOptions[] | ((config: Ti18nConfig) => PluginOptions[]),
  config: Ti18nConfig & {
    includeDeskTool?: boolean
  }
): PluginOptions[] {
  const i18nplugin = documentI18n(config)
  return compact([
    ...(Array.isArray(plugins) ? plugins : plugins(config)),
    config.includeDeskTool ?? true
      ? deskTool({
          structure: (S, {schema}) => getDocumentList({S, schema, config}),
        })
      : null,
    i18nplugin,
  ])
}
