import React from 'react'
import {Box, Button, Card, Flex, Text} from '@sanity/ui'
import {UiMessages} from '../../../constants/UiMessages'

type Props = React.PropsWithChildren<{
  pending?: boolean
  count: number
  labelName?: keyof typeof UiMessages['translationsMaintenance']
  onClick?: (event: React.SyntheticEvent<HTMLButtonElement, Event>) => void
}>

export const MaintenanceTabResult: React.FC<Props> = ({
  pending,
  count,
  labelName,
  children,
  onClick,
}) => {
  return (
    <Card padding={3} radius={2} shadow={1} tone={count > 0 ? `caution` : `default`}>
      <Flex align="center">
        <Box flex={1}>
          <Text muted={count <= 0}>
            <span>{count}</span>
            <span>&nbsp;</span>
            <span>
              {labelName ? String(UiMessages.translationsMaintenance[labelName]) : children}
            </span>
          </Text>
        </Box>

        {count > 0 && (
          <Button
            padding={2}
            fontSize={2}
            disabled={pending}
            onClick={onClick}
            text={UiMessages.translationsMaintenance.fix}
          />
        )}
      </Flex>
    </Card>
  )
}
