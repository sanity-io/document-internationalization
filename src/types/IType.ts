import { ILanguageQuery } from './ILanguageQuery';
import { ILanguageObject } from './ILanguageObject';

export interface IType {
    name: string;
    hidden?: boolean;
    level: number;
    type: string;
    fields: any[];
    options: {
        i18n?: boolean;
        languages?: (string | ILanguageObject)[] | ILanguageQuery;
        [key: string]: any;
    };
}