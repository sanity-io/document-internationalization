import {SchemaType} from 'sanity'
import {Ti18nConfig} from './Ti18nConfig'

declare module '@sanity/types' {
  // makes i18n property allowed on document when using defineTyp/defineField/defineArrayMember
  export interface DocumentDefinition {
    i18n: boolean | Ti18nConfig
  }
}

export type Ti18nSchema = SchemaType & {
  i18n: boolean | Ti18nConfig
}
