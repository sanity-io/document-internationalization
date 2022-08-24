import {IResolverProps} from '../types'
import {getConfig, getLanguageFromDocument} from '../utils'

export const LanguageBadge = (props: IResolverProps) => {
  const config = getConfig(props.type)
  const doc = props.draft || props.published
  const lang = doc ? getLanguageFromDocument(doc, config) : null
  if (lang) {
    return {
      label: lang,
      color: 'success',
    }
  }

  return null
}
