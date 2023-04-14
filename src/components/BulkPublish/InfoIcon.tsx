import {Box, ButtonTone, Text, Tooltip} from '@sanity/ui'
import React, {PropsWithChildren} from 'react'
import {TextWithTone} from 'sanity'

type InfoIconProps = PropsWithChildren & {
  icon: React.ComponentType
  tone: ButtonTone
  text?: string
}

export default function InfoIcon(props: InfoIconProps) {
  const {text, icon, tone, children} = props
  const Icon = icon

  return (
    <Tooltip
      portal
      content={
        children ? (
          <>{children}</>
        ) : (
          <Box padding={2}>
            <Text size={1}>{text}</Text>
          </Box>
        )
      }
    >
      <TextWithTone tone={tone} size={1}>
        <Icon />
      </TextWithTone>
    </Tooltip>
  )
}
