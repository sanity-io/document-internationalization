import { getEmojiFlag } from "@cprecioso/country-flag-emoji";

export const getFlag = (code: string = ``) => {
  switch (code) {
    case `en`:
      return getEmojiFlag(`gb`);

    default:
      return getEmojiFlag(code);
  }
};
