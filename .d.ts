declare module 'part:@sanity/*';
declare module 'part:@sanity/base/schema' {
    const schema: {
        _original: {
            name: string;
            types: {
                type: string;
                title: string;
                name: string;
                i18n?: {
                    languages: any;
                }
            }[];
        };
    };
    export = schema;
}
declare module '*.scss' {
    const c: { [key: string]: string; };
    export = c;
}