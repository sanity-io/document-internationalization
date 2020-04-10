import { TSchema } from './TSchema';
import { TLanguagesOption } from './TLanguagesOption';

export type Ti18nSchema = TSchema<{
    i18n: {
        fieldNames?: {
            lang?: string;
        };
        base?: string;
        languages: TLanguagesOption;
        messages?: Record<string, string>;
    };
}>;