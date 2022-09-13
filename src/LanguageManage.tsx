import React from 'react'
import {CogIcon} from '@sanity/icons'
import {useOpenInNewPane} from './hooks/useOpenInNewPane'
import {Button} from '@sanity/ui'

import {METADATA_SCHEMA_NAME} from './constants'

type LanguageManageProps = {
  id?: string
}

export default function LanguageManage(props: LanguageManageProps) {
  const {id} = props
  const open = useOpenInNewPane(id, METADATA_SCHEMA_NAME)

  return (
    <Button
      disabled={!id}
      mode="ghost"
      text="Manage Translations"
      icon={CogIcon}
      onClick={() => open()}
    />
  )
}
