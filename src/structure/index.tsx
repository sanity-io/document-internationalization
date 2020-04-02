import { StructureBuilder as S } from '@sanity/structure';
import { IDefaultDocumentNodeStructureProps } from './IDefaultDocumentNodeStructureProps';
import schemas from 'part:@sanity/base/schema';
import { CustomFormViewBuilder } from './CustomFormViewBuilder';

export const getDefaultDocumentNode = (props: IDefaultDocumentNodeStructureProps) => {
    const schema = schemas._original.types.find(s => s.name === props.schemaType);
    if (schema && schema.i18n) {
        return S.document().views([
            new CustomFormViewBuilder({
                options: {
                    id: `${props.documentId}-en`,
                }
            }) as any
        ]);
    }
    return S.document();
};

export default () => S.defaults();
