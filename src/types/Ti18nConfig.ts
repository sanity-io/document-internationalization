import { TLanguagesOption } from './TLanguagesOption';
import { TMessagesConfig } from './TMessagesConfig';

export type Ti18nConfig = {
  base?: string;
  fieldNames?: {
    lang?: string;
    references?: string;
  };
  languages?: TLanguagesOption;
  messages?: TMessagesConfig;
}