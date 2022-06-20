import React, {PropsWithChildren} from 'react'
import {Box, Text} from '@sanity/ui'

export function LanguageSelectLabel({children}: PropsWithChildren<Record<never, never>>) {
  return (
    <Box padding={2}>
      <Text muted size={1}>
        {children}
      </Text>
    </Box>
  )
}
