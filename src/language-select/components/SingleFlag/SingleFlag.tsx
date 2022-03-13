import React, {useMemo} from 'react'
import emoji from 'react-easy-emoji'
import styled from 'styled-components'
import * as customFlagComponents from 'part:@sanity/document-internationalization/ui/flags?'
import {getFlag} from '../../../utils/getFlag'

type Props = {
  className?: string
  code?: string
  langCulture?: string
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

export const SingleFlag: React.FunctionComponent<Props> = ({code, langCulture, className}) => {
  const flagEmoji = useMemo(() => code && getFlag(code), [code])
  const CustomFlagComponent = useMemo(() => {
    if (langCulture && customFlagComponents) {
      const exportedName = langCulture.replace(/[^a-zA-Z0-9_]/g, '_')
      if (exportedName in customFlagComponents) {
        return customFlagComponents[exportedName]
      }
    }
    return null
  }, [langCulture])

  return (
    <FlagImageContainer aria-label={code} className={className}>
      {CustomFlagComponent && code ? <CustomFlagComponent code={code} /> : emoji(flagEmoji) || '🏳️‍🌈'}
    </FlagImageContainer>
  )
}
