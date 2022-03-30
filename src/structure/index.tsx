import 'regenerator-runtime' // eslint-disable-line
import {StructureBuilder as S} from '@sanity/structure'
import {EarthGlobeIcon} from '@sanity/icons'
import {SchemaType} from '@sanity/structure/lib/parts/Schema'
import {DocumentListBuilder} from '@sanity/structure/lib/DocumentList'
import {ListItemBuilder} from '@sanity/structure/lib/ListItem'
import {I18nDelimiter, I18nPrefix, IdStructure, UiMessages} from '../constants'
import {getConfig} from '../utils'
import {MaintenanceTab} from './components/MaintenanceTab'

const hasIcon = (schemaType?: SchemaType | string): boolean => {
  if (!schemaType || typeof schemaType === 'string') {
    return false
  }
  return Boolean(schemaType.icon)
}

export const getDefaultDocumentNode = () => {
  return S.document()
}

export const getDocumentTypes = () => {
  const listItemsWithouti18n: ListItemBuilder[] = []
  const listItemsWithi18n = S.documentTypeListItems().filter((l) => {
    const schemaType = l.getSchemaType()
    const hasi18n = schemaType && typeof schemaType !== 'string' && (schemaType as any).i18n
    if (!hasi18n) listItemsWithouti18n.push(l)
    return hasi18n
  })
  return {
    withoutI18n: listItemsWithouti18n,
    withI18n: listItemsWithi18n,
  }
}

export const getMaintenanceTabComponent = () => {
  return S.component(MaintenanceTab)
    .title(UiMessages.translationsMaintenance.title)
    .id(`__i18n_translations_maintenance_tab`)
}

export const getMaintenanceListItem = () => {
  return S.listItem()
    .id(`__i18n_translations_maintenance_tab`)
    .title(UiMessages.translationsMaintenance.title)
    .icon(EarthGlobeIcon)
    .child(getMaintenanceTabComponent())
}

export const getFilteredDocumentTypeListItems = () => {
  const config = getConfig()
  const types = getDocumentTypes()

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
    items.splice(0, 0, getMaintenanceListItem())
  }

  return items.map((item) => item.serialize())
}

export default () => {
  const types = getDocumentTypes()
  if (types.withI18n.length === 0) return S.defaults()

  const items = getFilteredDocumentTypeListItems()
  return S.list()
    .id('__root__')
    .title('Content')
    .items(items)
    .showIcons(items.some((item) => hasIcon(item.schemaType)))
}
