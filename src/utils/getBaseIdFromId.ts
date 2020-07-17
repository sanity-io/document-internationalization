import { I18nPrefix } from '../constants';

export const getBaseIdFromId = (id: string) => {
  const rx = new RegExp(`${I18nPrefix}\\.([^.]+)\\.[^.]+`);
  const match = id.match(rx);
  if (match && match.length === 2) return match[1];
  return id;
}