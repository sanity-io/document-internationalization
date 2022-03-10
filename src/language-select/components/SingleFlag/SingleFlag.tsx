import React, {useMemo} from 'react'
import emoji from 'react-easy-emoji'
import styled from 'styled-components'
import {getFlag} from '../../../utils/getFlag'

type Props = {
  className?: string
  code?: string
}

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
  const flagEmoji = useMemo(() => code && getFlag(code), [code])

  return (
    <FlagImageContainer aria-label={code} className={className}>
      {emoji(flagEmoji) ?? '🏳️‍🌈'}
    </FlagImageContainer>
  )
}
