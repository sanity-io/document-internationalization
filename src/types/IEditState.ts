import type {SanityDocument} from '@sanity/client'

export interface IEditState<T extends Record<string, any> = Record<string, any>> {
  draft?: SanityDocument<T>
  published?: SanityDocument<T>
}
