import { TLanguagesOption } from './TLanguagesOption';

export interface IType {
    name: string;
    hidden?: boolean;
    level: number;
    type: string;
    fields: any[];
    options: {
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