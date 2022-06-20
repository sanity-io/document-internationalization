import {DocumentBadgeComponent} from 'sanity/desk'
import {useConfig} from '../hooks'
import {getLanguageFromId} from '../utils'
import {Ti18nConfig} from '../types'

export function createLanguageBadge(pluginConfig: Ti18nConfig): DocumentBadgeComponent {
  const LanguageBadge: DocumentBadgeComponent = (props) => {
    const config = useConfig(pluginConfig, props.type)
    const doc = props.draft || props.published
    const idLang = getLanguageFromId(props.id)
    const fieldName = config.fieldNames.lang
    const label = (doc && (doc[fieldName] as string)) || idLang
    if (label) {
      return {
        label: label,
        color: 'success',
      }
    }

    return null
  }

  return LanguageBadge
}
