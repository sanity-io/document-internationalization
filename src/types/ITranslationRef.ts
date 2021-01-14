export interface ITranslationRef {
    _key: string;
    lang: string;
    ref: {
        _type: 'reference';
        _ref: string;
        _weak: boolean;
    };
}