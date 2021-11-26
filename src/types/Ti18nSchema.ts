import {TSchema} from './TSchema'
import {Ti18nConfig} from './Ti18nConfig'

export type Ti18nSchema = TSchema<{
  i18n: boolean | Ti18nConfig
}>
