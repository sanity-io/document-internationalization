import React, {forwardRef, Ref, useMemo} from 'react'
import {Autocomplete, Card, Stack, Text} from '@sanity/ui'
import {EarthGlobeIcon} from '@sanity/icons'
import {DefaultPreview as Preview} from 'sanity/_unstable'
import {useSchema} from 'sanity'
import {Ti18nSchema} from '../../../types'
import {UiMessages} from '../../../constants'

type PreviewMedia = React.ComponentProps<typeof Preview>['media']
type Props = {
  value: string
  onChange: (value: string) => void
  onOpen: () => void
}

export const MaintenanceTabTypeSelector = forwardRef(function MaintenanceTabTypeSelector(
  {value, onChange, onOpen}: Props,
  ref: Ref<HTMLInputElement>
) {
  const schema = useSchema()
  const i18nSchemas = useMemo(
    () => schema._original?.types.filter((s: unknown) => !!(s as Ti18nSchema).i18n),
    [schema]
  )

  return (
    <Stack space={4}>
      <Text>{UiMessages.translationsMaintenance.selectSchemaPlaceholder}</Text>
      <Card>
        <Autocomplete
          ref={ref}
          fontSize={[2, 2, 3]}
          icon={EarthGlobeIcon}
          id="i18n-schema-selector"
          options={i18nSchemas?.map((option) => ({
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
                layout="default"
                title={payload.title}
                media={payload.icon as PreviewMedia}
              />
            </Card>
          )}
        />
      </Card>
    </Stack>
  )
})
