import { I18nPrefix } from "../constants";

export const buildDocId = (id: string, lang: string) => `${I18nPrefix}.${id}.${lang}`;