import {I18nDelimiter, I18nPrefix, IdStructure} from '../constants'
import {getConfig} from './getConfig'

export const buildDocId = (id: string, lang: string | null) => {
  const config = getConfig()
  if (config.idStructure === IdStructure.DELIMITER) return `${id}${I18nDelimiter}${lang || '*'}`
  return `${I18nPrefix}.${id}.${lang || '*'}`
}
