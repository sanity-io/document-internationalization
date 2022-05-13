import {polyfillCountryFlagEmojis} from 'country-flag-emoji-polyfill'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import * as customFlagComponents from 'part:@sanity/document-internationalization/ui/flags?'
import {getFlag} from '../../../utils/getFlag'

polyfillCountryFlagEmojis()

type Props = {
  className?: string
  code?: string
  langCulture?: string
}

const FlagImageContainer = styled.span`
  display: block;
  font-size: 19px;
  transform: translateY(-1px);

  & img {
    display: block;
  }
`

const EmojiSpan = styled.span`
  font-family: 'Twemoji Country Flags';
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
      {CustomFlagComponent && code ? (
        <CustomFlagComponent code={code} />
      ) : (
        <EmojiSpan>{flagEmoji}</EmojiSpan> || '🏳️‍🌈'
      )}
    </FlagImageContainer>
  )
}
