import {SanityDocument, SchemaType} from 'sanity'
import type {ComponentType, FC} from 'react'
import {IdStructure, ReferenceBehavior} from '../constants'
import {TLanguagesOption} from './TLanguagesOption'
import {TFieldNamesConfig} from './TFieldNamesConfig'
import {ILanguageObject} from './ILanguageObject'

export type Ti18nConfig = {
  base?: string
  languages?: TLanguagesOption
  idStructure?: IdStructure
  referenceBehavior?: ReferenceBehavior
  fieldNames?: TFieldNamesConfig
  withTranslationsMaintenance?: boolean
  languagesLoader?: (
    languages: ILanguageObject[],
    doc: SanityDocument | undefined
  ) => Promise<ILanguageObject[]> | ILanguageObject[]
  shouldReload?: (doc: SanityDocument | undefined | null) => boolean
  fallbackLanguageSelect?: FC<{
    schemaType?: SchemaType & {
      i18n?: boolean | Ti18nConfig
    }
  }>
  customFlagComponents?: Record<
    string,
    ComponentType<{
      className?: string
      code?: string
      langCulture?: string
    }>
  >
}
