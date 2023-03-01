import {EarthGlobeIcon} from '@sanity/icons'
import {Schema, SchemaType} from 'sanity'
import {DocumentListBuilder, ListItemBuilder, StructureBuilder} from 'sanity/desk'
import {applyConfig} from '../utils'
import {I18nDelimiter, I18nPrefix, IdStructure, UiMessages} from '../constants'
import {Ti18nConfig} from '../types'
import {createMaintenanceTabComponent} from './components/MaintenanceTab'

export interface StructureConfig {
  S: StructureBuilder
  config: Ti18nConfig
  schema: Schema & {
    i18n?: Ti18nConfig
  }
}

const hasIcon = (schemaType?: SchemaType | string): boolean => {
  if (!schemaType || typeof schemaType === 'string') {
    return false
  }
  return Boolean(schemaType.icon)
}

export const getDefaultDocumentNode = (S: StructureBuilder) => {
  return S.document()
}

export const getDocumentTypes = (props: StructureConfig) => {
  const {S, schema} = props
  const listItemsWithouti18n: ListItemBuilder[] = []
  const listItemsWithi18n = S.documentTypeListItems().filter((l) => {
    let schemaType = l.getSchemaType()
    schemaType = typeof schemaType === 'string' ? schema.get(schemaType) : schemaType

    const hasi18n = schemaType && (schemaType as unknown as {i18n: boolean}).i18n
    if (!hasi18n) listItemsWithouti18n.push(l)
    return hasi18n
  })
  return {
    withoutI18n: listItemsWithouti18n,
    withI18n: listItemsWithi18n,
  }
}

export const getMaintenanceTabComponent = (props: StructureConfig) => {
  const {S} = props
  const MaintenanceTab = createMaintenanceTabComponent(props)
  return S.component(MaintenanceTab)
    .title(UiMessages.translationsMaintenance.title)
    .id(`__i18n_translations_maintenance_tab`)
}

export const getMaintenanceListItem = (props: StructureConfig) => {
  const {S} = props
  return S.listItem()
    .id(`__i18n_translations_maintenance_tab`)
    .title(UiMessages.translationsMaintenance.title)
    .icon(EarthGlobeIcon)
    .child(getMaintenanceTabComponent(props))
}

export const getFilteredDocumentTypeListItems = (props: StructureConfig) => {
  const {S, config: pluginConfig, schema} = props
  const config = applyConfig(
    pluginConfig,
    typeof schema.i18n === 'object' ? schema.i18n : undefined
  )
  const types = getDocumentTypes(props)
  const filterFns = {
    [IdStructure.SUBPATH]: (list: ListItemBuilder, doc: DocumentListBuilder) =>
      doc.filter('!(_id in path($path)) && !(_id in path($drafts)) && _type == $type').params({
        path: `${I18nPrefix}.**`,
        drafts: `drafts.${I18nPrefix}.**`,
        type: list.getId(),
      }),
    [IdStructure.DELIMITER]: (list: ListItemBuilder, doc: DocumentListBuilder) =>
      doc.filter('!(_id match $id) && _type == $type').params({
        id: `*${I18nDelimiter}*`,
        type: list.getId(),
      }),
  }

  const items = [
    ...types.withoutI18n,
    ...types.withI18n.map((l) => {
      const schemaType = l.getSchemaType()
      const schemaTypeName = typeof schemaType === 'string' ? schemaType : schemaType?.name

      return l.child(
        filterFns[config.idStructure](
          l,
          S.documentList()
            .id(l.getId() || '')
            .title(l.getTitle() || '')
            .schemaType(schemaTypeName ?? '')
            .menuItems([...(schemaTypeName ? S.orderingMenuItemsForType(schemaTypeName) : [])])
        )
      )
    }),
  ]

  if (config.withTranslationsMaintenance) {
    items.splice(0, 0, getMaintenanceListItem(props))
  }

  return items.map((item) => item.serialize())
}

export function getDocumentList(props: StructureConfig) {
  const {S} = props
  const types = getDocumentTypes(props)
  if (types.withI18n.length === 0) return S.defaults()

  const items = getFilteredDocumentTypeListItems(props)
  return S.list()
    .id('__root__')
    .title('Content')
    .items(items)
    .showIcons(items.some((item) => hasIcon(item.schemaType)))
}
