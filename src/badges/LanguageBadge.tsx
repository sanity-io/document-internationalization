import {DocumentBadgeComponent} from 'sanity/desk'
import {useConfig} from '../hooks'
import {getLanguageFromDocument} from '../utils'
import {Ti18nConfig} from '../types'

export function createLanguageBadge(pluginConfig: Ti18nConfig): DocumentBadgeComponent {
  const LanguageBadge: DocumentBadgeComponent = (props) => {
    const config = useConfig(pluginConfig, props.type)
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

  return LanguageBadge
}
