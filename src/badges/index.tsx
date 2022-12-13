import {DocumentBadgeDescription, DocumentBadgeProps} from 'sanity'

import {SupportedLanguages} from '../types'

export function LanguageBadge(
  props: DocumentBadgeProps,
  supportedLanguages: SupportedLanguages,
  languageField: string
): DocumentBadgeDescription | null {
  const source = props?.draft || props?.published
  const languageId = source?.[languageField]

  if (!languageId) {
    return null
  }

  const language = Array.isArray(supportedLanguages)
    ? supportedLanguages.find((l) => l.id === languageId)
    : null

  // Currently we only show the language id if the supportedLanguages are async
  return {
    label: language?.id ?? String(languageId),
    title: language?.title ?? undefined,
    color: `primary`,
  }
}
