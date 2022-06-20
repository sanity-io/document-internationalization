import {SchemaType} from 'sanity'
import {Ti18nConfig} from './Ti18nConfig'

export type Ti18nSchema = SchemaType & {
  i18n: boolean | Ti18nConfig
}
