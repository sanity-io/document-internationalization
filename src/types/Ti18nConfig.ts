import {TLanguagesOption} from './TLanguagesOption'
import {TFieldNamesConfig} from './TFieldNamesConfig'
import {IdStructure, ReferenceBehavior} from '../constants'

export type Ti18nConfig = {
  base?: string
  languages?: TLanguagesOption
  idStructure?: IdStructure
  referenceBehavior?: ReferenceBehavior
  fieldNames?: TFieldNamesConfig
}
