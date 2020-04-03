export const getLanguageFromId = (id: string) => {
    const split = id.split('__i18n_');
    if (split.length > 1) return split[1];
    return null;
}