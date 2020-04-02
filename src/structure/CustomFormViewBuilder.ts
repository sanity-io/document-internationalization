import { GenericViewBuilder, View } from '@sanity/structure/lib/views/View';
import { FormView } from '@sanity/structure/lib/views/FormView';
import { SerializeOptions } from '@sanity/structure/lib/StructureNodes';

type TSpec = FormView & {
    options: {
        id: string;
    };
};

export class CustomFormViewBuilder extends GenericViewBuilder<Partial<View>, CustomFormViewBuilder> {
    protected spec: Partial<TSpec>;

    constructor(spec?: Partial<TSpec>) {
        super();
        this.spec = {
            id: 'editor',
            title: 'Editor',
            ...(spec ? spec : {})
        }
    }

    serialize(options: SerializeOptions = { path: [] }): FormView {
        const base = super.serialize(options)
        return {
            ...base,
            type: 'form'
        }
    }

    clone(withSpec?: Partial<FormView>): CustomFormViewBuilder {
        const builder = new CustomFormViewBuilder()
        builder.spec = { ...this.spec, ...(withSpec || {}) }
        return builder
    }
}