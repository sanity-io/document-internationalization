import { TLanguagesOption } from './TLanguagesOption';
import { ObjectSchemaTypeWithOptions } from '@sanity/types';
export interface IField {
    name: string;
    type: IType;
    readOnly?: boolean;
}

export interface IFieldSet {
    name: string;
    title: string;
    description: string;
    single: boolean;
    options: ObjectSchemaTypeWithOptions['options'];
    field: IField;
    fields: IField[];
}

export interface IType {
    name: string;
    title: string;
    description: string;
    hidden?: boolean;
    level: number;
    type: string;
    jsonType: string;
    fields: IField[];
    fieldsets: IFieldSet[];
    options:  ObjectSchemaTypeWithOptions['options'] & {
        base?: string;
        i18n?: boolean;
        languages?: TLanguagesOption;
        css?: (classNames: Record<string, string>) => string;
        messages?: {
            loading?: string;
            missingTranslations?: string;
        };
        [key: string]: any;
    };
}