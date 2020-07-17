import { I18nDelimiter } from "../constants";

export const getBaseIdFromId = (id: string) => {
    const split = id.split(I18nDelimiter);
    if (split.length > 0) return split[0];
    return null;
}