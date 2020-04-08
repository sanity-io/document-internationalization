import { StructureBuilder as S } from '@sanity/structure';
import { IDefaultDocumentNodeStructureProps } from './IDefaultDocumentNodeStructureProps';
import { Ti18nSchema } from '../types';
import { ListItemBuilder } from '@sanity/structure/lib/ListItem';
import { TranslationsComponentFactory } from './TranslationsComponentFactory';
import { getSchema } from '../utils';
import { SchemaType } from '@sanity/structure/lib/parts/Schema';

const hasIcon = (schemaType?: SchemaType | string): boolean => {
    if (!schemaType || typeof schemaType === 'string') {
      return false
    }
    return Boolean(schemaType.icon)
}

export const getDocumentNodeViewsForSchemaType = (type: string) => {
    const schema: Ti18nSchema = getSchema(type);
    return [
        S.view.form(),
        S.view.component(TranslationsComponentFactory(schema)).title('Translations')
    ];
}

export const getDefaultDocumentNode = (props: IDefaultDocumentNodeStructureProps) => {
    const schema: Ti18nSchema = getSchema(props.schemaType);
    if (schema && schema.i18n) {
        return S.document().views(getDocumentNodeViewsForSchemaType(props.schemaType));
    }
    return S.document();
};

export const getDocumentTypes = () => {
    const listItemsWithouti18n: ListItemBuilder[] = [];
    const listItemsWithi18n = S.documentTypeListItems().filter(l => {
        const schemaType = l.getSchemaType();
        const hasi18n = schemaType && typeof schemaType !== 'string' && (schemaType as any).i18n;
        if (!hasi18n) listItemsWithouti18n.push(l);
        return hasi18n;
    });
    return {
        withoutI18n: listItemsWithouti18n,
        withI18n: listItemsWithi18n,
    };
};

export const getFilteredDocumentTypeListItems = () => {
    const types = getDocumentTypes();

    const items = [
        ...types.withoutI18n,
        ...types.withI18n.map(l => (
            l.child(
                S.documentList()
                    .id(l.getId())
                    .title(l.getTitle())
                    .filter('!(_id match $id) && _type == $type')
                    .params({
                        id: '*__i18n_*',
                        type: l.getId()
                    })
            )
        )),
    ];

    return items;
};

export default () => {
    const types = getDocumentTypes();
    if (types.withI18n.length === 0) return S.defaults();

    const items = getFilteredDocumentTypeListItems();
    return S.list()
        .id('__root__')
        .title('Content')
        .items(items)
        .showIcons(items.some(item => hasIcon(item.getSchemaType())));
}

