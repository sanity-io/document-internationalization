import { TLanguagesOption } from './TLanguagesOption';
import { TMessagesConfig } from './TMessagesConfig';
import { TFieldNamesConfig } from './TFieldNamesConfig';
import { ReferenceBehavior } from '../constants';

export type Ti18nConfig = {
  base?: string;
  languages?: TLanguagesOption;
  referenceBehavior?: ReferenceBehavior;
  fieldNames?: TFieldNamesConfig;
  messages?: TMessagesConfig;
}