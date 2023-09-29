/* eslint-disable no-unused-vars */
import type {PLUGIN_CONFIG} from './constants'
import type {PluginConfig} from './types'

export declare global {
  interface Window {
    [PLUGIN_CONFIG]: Readonly<Required<PluginConfig>>
  }
}
