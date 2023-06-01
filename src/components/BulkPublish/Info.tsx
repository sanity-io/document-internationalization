import {InfoOutlineIcon} from '@sanity/icons'
import {Box, Stack, Text} from '@sanity/ui'

import InfoIcon from './InfoIcon'

export default function Info() {
  return (
    <InfoIcon icon={InfoOutlineIcon} tone="primary">
      <Stack padding={3} space={4} style={{maxWidth: 250}}>
        <Box>
          <Text size={1}>Bulk publishing uses the Scheduling API.</Text>
        </Box>
        <Box>
          <Text size={1}>
            Customized Document Actions in the Studio will not execute. Webhooks
            will execute.
          </Text>
        </Box>
        <Box>
          <Text size={1}>
            Validation is checked before rendering the button below, but the
            Scheduling API will not check for – or enforce – validation.
          </Text>
        </Box>
      </Stack>
    </InfoIcon>
  )
}
