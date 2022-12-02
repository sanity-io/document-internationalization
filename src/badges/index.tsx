import {DocumentBadgeDescription, DocumentBadgeProps} from 'sanity'
import {useLanguages} from '../hooks/useLanguages'

import type {SupportedLanguagesConfig} from '../types'

export function LanguageBadge(
  props: DocumentBadgeProps,
  supportedLanguages: SupportedLanguagesConfig,
  languageField: string
): DocumentBadgeDescription | null {
  const [pending, languagesList] = useLanguages(supportedLanguages)
  const source = props?.draft || props?.published
  const languageId = source?.[languageField]
  const language = languagesList.find((l) => l.id === languageId)

  if (!language || pending) {
    return null
  }

  return {
    label: language.id,
    title: language.title,
    color: `primary`,
  }
}
