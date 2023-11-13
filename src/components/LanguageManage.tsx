import {CogIcon} from '@sanity/icons'
import {Box, Button, Stack, Text, Tooltip} from '@sanity/ui'
import {useTranslation} from 'sanity'

import {I18N_NAMESPACE, METADATA_SCHEMA_NAME} from '../constants'
import {useOpenInNewPane} from '../hooks/useOpenInNewPane'

type LanguageManageProps = {
  id?: string
}

export default function LanguageManage(props: LanguageManageProps) {
  const {id} = props
  const open = useOpenInNewPane(id, METADATA_SCHEMA_NAME)
  const {t} = useTranslation(I18N_NAMESPACE)
  const disabled = !id

  return (
    <Tooltip
      content={
        disabled ? (
          <Box padding={2}>
            <Text muted size={1}>
              {t('menu.manageButton.disabled')}
            </Text>
          </Box>
        ) : null
      }
      fallbackPlacements={['right', 'left']}
      placement="top"
      portal
    >
      <Stack>
        <Button
          disabled={disabled}
          mode="ghost"
          text={t('menu.manageButton.text')}
          icon={CogIcon}
          // eslint-disable-next-line react/jsx-no-bind
          onClick={() => open()}
        />
      </Stack>
    </Tooltip>
  )
}
