import React from 'react'
import {Box, Text} from '@sanity/ui'

export const LanguageSelectLabel: React.FC = ({children}) => {
  return (
    <Box padding={2}>
      <Text muted size={1}>
        {children}
      </Text>
    </Box>
  )
}
