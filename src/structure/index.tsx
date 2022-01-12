import 'regenerator-runtime' // eslint-disable-line
import {StructureBuilder as S} from '@sanity/structure'
import {EarthGlobeIcon} from '@sanity/icons'
import {SchemaType} from '@sanity/structure/lib/parts/Schema'
import {DocumentListBuilder} from '@sanity/structure/lib/DocumentList'
import {Child} from '@sanity/structure/dist/dts/StructureNodes'
import {ListItemBuilder} from '@sanity/structure/lib/ListItem'
import {Ti18nSchema} from '../types'
import {I18nDelimiter, I18nPrefix, IdStructure, UiMessages} from '../constants'
import {getSchema, getConfig} from '../utils'
import {TranslationsComponentFactory} from './components/TranslationsComponentFactory'
import {MaintenanceTab} from './components/MaintenanceTab'
import {IDefaultDocumentNodeStructureProps} from './IDefaultDocumentNodeStructureProps'

const hasIcon = (schemaType?: SchemaType | string): boolean => {
  if (!schemaType || typeof schemaType === 'string') {
    return false
  }
  return Boolean(schemaType.icon)
}

export const getDocumentNodeViewsForSchemaType = (type: string) => {
  const schema: Ti18nSchema = getSchema(type)
  return [
    S.view.form(),
    S.view.component(TranslationsComponentFactory(schema)).title('Translations'),
  ]
}

export const getDefaultDocumentNode = (props: IDefaultDocumentNodeStructureProps) => {
  const schema: Ti18nSchema = getSchema(props.schemaType)
  if (schema && schema.i18n) {
    return S.document().views(getDocumentNodeViewsForSchemaType(props.schemaType))
  }
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

      const i18nChildResolver: Child = (documentId) =>
        S.document()
          .id(documentId)
          .documentId(documentId)
          .schemaType(schemaTypeName ?? '')
          .views(
            schemaTypeName ? getDocumentNodeViewsForSchemaType(schemaTypeName) : [S.view.form()]
          )
          .child(i18nChildResolver)

      return l.child(
        filterFns[config.idStructure](
          l,
          S.documentList()
            .id(l.getId() || '')
            .title(l.getTitle() || '')
            .menuItems([...(schemaTypeName ? S.orderingMenuItemsForType(schemaTypeName) : [])])
            .child(i18nChildResolver)
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
