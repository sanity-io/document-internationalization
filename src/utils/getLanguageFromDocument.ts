import type {SanityDocument} from '@sanity/client'
import type {ApplyConfigResult} from './applyConfig'

export function getLanguageFromDocument(
  doc: SanityDocument,
  config: ApplyConfigResult
): string | null {
  return doc?.[config.fieldNames.lang] || config.base || null
}
