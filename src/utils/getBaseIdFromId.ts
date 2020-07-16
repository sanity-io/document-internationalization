export const getBaseIdFromId = (id: string) => {
    const split = id.split('__i18n_');
    if (split.length > 0) return split[0];
    return null;
}