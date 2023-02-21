import {getEmojiFlag} from '@cprecioso/country-flag-emoji'
import {SupportedEmojiFlagCodes} from '../constants'

// Get flag from a valid country code
export const getFlag = (code = ``): string => {
  if (!code) {
    return ``
  }

  const flagCode = getFlagCode(code)

  if (!SupportedEmojiFlagCodes.includes(flagCode.toUpperCase())) {
    return ``
  }

  const emoji = getEmojiFlag(flagCode)

  return emoji
}

// Convert some language codes to country codes
export const getFlagCode = (code = ``): string => {
  if (!code) {
    return ``
  }

  switch (code.toLocaleLowerCase()) {
    // Return :flag-gb: for English
    case `en`:
      return `gb`
    // Return :flag-al: (Albania) for `sq` language code
    case `sq`:
      return `al`
    // Return :flag-dk: for Danish
    case 'da':
      return 'dk'

    default:
      return code
  }
}
