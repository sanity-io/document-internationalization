import type {SanityDocument} from '@sanity/client'
import type {getConfig} from './getConfig'

export function getLanguageFromDocument(
  doc: SanityDocument,
  config: ReturnType<typeof getConfig>
): string | null {
  return doc?.[config.fieldNames.lang] || config.base || null
}
