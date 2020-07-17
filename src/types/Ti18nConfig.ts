import { TLanguagesOption } from './TLanguagesOption';
import { TMessagesConfig } from './TMessagesConfig';
import { TFieldNamesConfig } from './TFieldNamesConfig';

export type Ti18nConfig = {
  base?: string;
  fieldNames?: TFieldNamesConfig;
  languages?: TLanguagesOption;
  messages?: TMessagesConfig;
}