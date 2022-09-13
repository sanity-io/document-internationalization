import {DocumentBadgeDescription, DocumentBadgeProps} from 'sanity'

import {Language} from '../types'

export function LanguageBadge(
  props: DocumentBadgeProps,
  supportedLanguages: Language[],
  languageField: string
): DocumentBadgeDescription | null {
  const source = props?.draft || props?.published
  const languageId = source?.[languageField]
  const language = supportedLanguages.find((l) => l.id === languageId)

  if (!language) {
    return null
  }

  return {
    label: language.id,
    title: language.title,
    color: `primary`,
  }
}
