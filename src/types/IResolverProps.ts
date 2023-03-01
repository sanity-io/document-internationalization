import {SanityDocument} from '@sanity/client'

export interface IResolverProps<T extends Record<string, any> = Record<string, any>> {
  id: string
  type: string
  liveEdit: boolean
  draft?: SanityDocument<T>
  published?: SanityDocument<T>
  onComplete?: () => void
}
