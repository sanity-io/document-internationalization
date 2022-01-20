import React, {useState, useMemo} from 'react'
import Emoji from 'a11y-react-emoji'
import {getFlag, getFlagCode} from '../../../utils/getFlag'

type Props = {
  className?: string
  code: string
}

const isUsingWindows = navigator?.appVersion?.indexOf('Win') !== -1
const blank32x32Image = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAH0lEQVR42mNkoBAwjhowasCoAaMGjBowasCoAcPNAACOMAAhOO/A7wAAAABJRU5ErkJggg==`

// Windows does not have support for flag emojis
export const SingleFlag: React.FunctionComponent<Props> = ({code,className}) => {
  const [hasFlag, setHasFlag] = useState(true)
  const [opacity, setOpacity] = useState(0)
  const flagEmoji = useMemo(() => getFlag(code), [code])

  // Attempt to display flat image
  if (isUsingWindows && hasFlag) {
    return (
      <img
        alt={code}
        src={`https://www.countryflags.io/${getFlagCode(code)}/flat/32.png`}
        style={{width: `1em`, opacity}}
        onError={() => setHasFlag(false)}
        // Hide flash of alt text
        onLoad={() => setOpacity(1)}
        className={className}
      />
    )
  }

  // If flat flag image does not exist, show blank image
  if (!hasFlag) {
    return (
      <img
        alt={code}
        src={blank32x32Image}
        style={{width: `1em`, opacity}}
        onLoad={() => setOpacity(1)}
        className={className}
      />
    )
  }

  // Show nothing to windows users if above not satisfied
  if (isUsingWindows) {
    return null
  }

  // Lookup code in list of all codes that have an emoji flag
  // (Prevents double-letter emoji returning for missing flags)
  if (!flagEmoji) {
    setHasFlag(false)
    return null
  }

  // Otherwise, show accessible emoji for everyone else
  return (
    <Emoji
      symbol={flagEmoji}
      label={code}
      className={className}
    />
  )
}
