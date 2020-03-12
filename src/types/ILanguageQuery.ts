export interface ILanguageQuery {
    query: string;
    value: string | {
        name: string;
        title: string;
    };
}