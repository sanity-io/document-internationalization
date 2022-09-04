import {IdStructure, ReferenceBehavior} from '../constants'
import {TLanguagesOption} from './TLanguagesOption'
import {TFieldNamesConfig} from './TFieldNamesConfig'

export type Ti18nConfig = {
  base?: string
  languages?: TLanguagesOption
  idStructure?: IdStructure
  referenceBehavior?: ReferenceBehavior
  fieldNames?: TFieldNamesConfig
}
