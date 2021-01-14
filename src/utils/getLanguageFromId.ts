import { I18nPrefix, I18nDelimiter } from '../constants';

export const getLanguageFromId = (id: string) => {
  // subpath
  const rx = new RegExp(`${I18nPrefix}\\.[^.]+\\.([^.]+)`);
  const match = id.match(rx);
  if (match && match.length === 2) return match[1];

  // delimiter
  const split = id.split(I18nDelimiter);
  if (split.length > 1) return split[1];
  return null;
}