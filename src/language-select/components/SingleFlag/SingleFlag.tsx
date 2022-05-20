import React, {useMemo} from 'react'
import twemoji from 'twemoji'
import parse from 'html-react-parser'
import * as customFlagComponents from 'part:@sanity/document-internationalization/ui/flags?'
import {Box} from '@sanity/ui'
import styled from 'styled-components'
import {getFlag} from '../../../utils/getFlag'

type Props = {
  code?: string
  langCulture?: string
}

const EmojiBox = styled(Box)`
  min-width: 24px;
  transform: translateY(1px);
`

export const SingleFlag: React.FunctionComponent<Props> = ({code, langCulture}) => {
  const flagEmoji = useMemo(() => code && getFlag(code), [code])
  const flagHtml = twemoji.parse(flagEmoji ?? `🇺🇳`, {folder: 'svg', ext: '.svg'})
  const flagReact = parse(flagHtml)

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
        <EmojiBox>{flagReact}</EmojiBox>
      )}
    </Box>
  )
}
