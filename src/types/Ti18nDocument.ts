import type {SanityDocument} from '@sanity/client'

// @README these types are not per-se accurate as field names can
// be manually configured and are not always these defaults
export type Ti18nDocument<D = any> = SanityDocument<D> & {
  __i18n_lang?: string
  __i18n_refs?: {
    _key: string
    _type: 'reference'
    _ref: string
    _weak: boolean
  }[]
}
