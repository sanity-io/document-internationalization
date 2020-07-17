import { I18nDelimiter } from "../constants";

export const getLanguageFromId = (id: string) => {
    const split = id.split(I18nDelimiter);
    if (split.length > 1) return split[1];
    return null;
}