import {getEmojiFlag} from '@cprecioso/country-flag-emoji'
import {allEmojiFlagCodes} from '../structure/components/Flag/allEmojiFlagCodes'

// Get flag from a valid country code
export const getFlag = (code = ``) => {
  if (!code) {
    return ``
  }

  const flagCode = getFlagCode(code)

  if (!allEmojiFlagCodes.includes(flagCode.toUpperCase())) {
    return ``
  }

  const emoji = getEmojiFlag(flagCode)

  return emoji
}

// Convert some language codes to country codes
export const getFlagCode = (code = ``) => {
  if (!code) {
    return ``
  }

  switch (code) {
    case `en`:
    case `EN`:
      return `gb`

    default:
      return code
  }
}
