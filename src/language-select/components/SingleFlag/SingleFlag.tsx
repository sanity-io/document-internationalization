import {polyfillCountryFlagEmojis} from 'country-flag-emoji-polyfill'
import React, {useMemo} from 'react'
import Twemoji from 'react-twemoji'
import * as customFlagComponents from 'part:@sanity/document-internationalization/ui/flags?'
import {Box} from '@sanity/ui'
import {getFlag} from '../../../utils/getFlag'

polyfillCountryFlagEmojis()

type Props = {
  code?: string
  langCulture?: string
}

export const SingleFlag: React.FunctionComponent<Props> = ({code, langCulture}) => {
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
    <Box aria-label={code}>
      {CustomFlagComponent && code ? (
        <CustomFlagComponent code={code} />
      ) : (
        <Twemoji options={{size: 48}}>{flagEmoji}</Twemoji>
      )}
    </Box>
  )
}
