import React from 'react'
import schemas from 'part:@sanity/base/schema'
import {getConfig} from '../../../utils'
import {Ti18nSchema} from '../../../types'
import {Autocomplete, Stack, Text, Card, Flex, Box} from '@sanity/ui'
import {EarthGlobeIcon} from '@sanity/icons'
import Preview from 'part:@sanity/base/preview'

type Props = {
  value: string
  onChange: (value: string) => void
  onOpen: () => void
}

export const MaintenanceTabTypeSelector: React.FunctionComponent<Props> = ({
  value,
  onChange,
  onOpen,
}) => {
  const config = React.useMemo(() => getConfig(), [])
  const i18nSchemas = React.useMemo(
    () => schemas._original.types.filter((s) => !!s.i18n) as Ti18nSchema[],
    []
  )

  return (
    <Stack space={4}>
      <Text>{config.messages?.translationsMaintenance?.selectSchemaPlaceholder}</Text>
      <Card>
        <Autocomplete
          fontSize={[2, 2, 3]}
          icon={EarthGlobeIcon}
          id="i18n-schema-selector"
          options={i18nSchemas.map((option) => ({
            value: option.name,
            payload: option,
          }))}
          value={value}
          placeholder="Search"
          openButton={{onClick: () => onOpen}}
          onChange={onChange}
          renderValue={(v, option) => option?.payload.title || v}
          renderOption={({payload}) => (
            <Card padding={2} radius={2} as="button">
              <Preview
                style={{userSelect: `none`}}
                type={payload}
                value={{title: payload.title, media: payload.icon}}
              />
            </Card>
          )}
        />
      </Card>
    </Stack>
  )
}
