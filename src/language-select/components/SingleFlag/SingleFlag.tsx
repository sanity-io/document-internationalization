import React, {useState, useMemo} from 'react'
import emoji from 'react-easy-emoji'
import styled from 'styled-components'
import {getFlag} from '../../../utils/getFlag'

type Props = {
  className?: string
  code: string
}

const blank32x32Image = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAH0lEQVR42mNkoBAwjhowasCoAaMGjBowasCoAcPNAACOMAAhOO/A7wAAAABJRU5ErkJggg==`

const FlagImageContainer = styled.span`
  display: block;
  padding: 1px;
  font-size: 19px;
  margin: 0px -0.05em 0px -0.1em;

  & img {
    display: block;
  }
`

export const SingleFlag: React.FunctionComponent<Props> = ({code, className}) => {
  const [opacity, setOpacity] = useState(0)
  const flagEmoji = useMemo(() => getFlag(code), [code])

  const handleImageLoad = React.useCallback(() => setOpacity(1), [])

  if (!flagEmoji) {
    return (
      <FlagImageContainer className={className}>
        <img alt={code} src={blank32x32Image} style={{opacity}} onLoad={handleImageLoad} />
      </FlagImageContainer>
    )
  }

  return (
    <FlagImageContainer aria-label={code} className={className}>
      {emoji(flagEmoji)}
    </FlagImageContainer>
  )
}
