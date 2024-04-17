import {Card, Flex, Text} from '@sanity/ui'
import type {PropsWithChildren} from 'react'

import ConstrainedBox from './ConstrainedBox'

export default function Warning({children}: PropsWithChildren) {
  return (
    <Card tone="caution" padding={3}>
      <Flex justify="center">
        <ConstrainedBox>
          <Text size={1} align="center">
            {children}
          </Text>
        </ConstrainedBox>
      </Flex>
    </Card>
  )
}
