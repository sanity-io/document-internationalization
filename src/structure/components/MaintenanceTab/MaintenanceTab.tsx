import React, {forwardRef, Ref, VoidFunctionComponent} from 'react'
import {Ti18nConfig} from '../../../types'
import {MaintenanceTabContent} from './MaintenanceTabContent'

export interface MaintenanceTabProps {
  config: Ti18nConfig
}

export function createMaintenanceTabComponent(props: MaintenanceTabProps): VoidFunctionComponent {
  return forwardRef(function MaintenanceTab(p: any, ref: Ref<HTMLInputElement>) {
    return <MaintenanceTabContent {...props} ref={ref} />
  })
}
