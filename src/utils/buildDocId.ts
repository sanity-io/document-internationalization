import {Ti18nConfig} from '../types'
import {I18nDelimiter, I18nPrefix, IdStructure} from '../constants'

export const buildDocId = (pluginConfig: Ti18nConfig, id: string, lang?: string): string => {
  if (pluginConfig.idStructure === IdStructure.DELIMITER)
    return `${id}${I18nDelimiter}${lang || '*'}`
  return `${I18nPrefix}.${id}.${lang || '*'}`
}
