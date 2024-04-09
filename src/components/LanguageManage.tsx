import {CogIcon} from '@sanity/icons'
import {Box, Button, Stack, Text, Tooltip} from '@sanity/ui'

import {METADATA_SCHEMA_NAME} from '../constants'
import {useOpenInNewPane} from '../hooks/useOpenInNewPane'

type LanguageManageProps = {
  id?: string
}

export default function LanguageManage(props: LanguageManageProps) {
  const {id} = props
  const open = useOpenInNewPane(id, METADATA_SCHEMA_NAME)

  return (
    <Tooltip
      animate
      content={
        id ? null : (
          <Box padding={2}>
            <Text muted size={1}>
              Document has no other translations
            </Text>
          </Box>
        )
      }
      fallbackPlacements={['right', 'left']}
      placement="top"
      portal
    >
      <Stack>
        <Button
          disabled={!id}
          mode="ghost"
          text="Manage Translations"
          icon={CogIcon}
          onClick={() => open()}
        />
      </Stack>
    </Tooltip>
  )
}
