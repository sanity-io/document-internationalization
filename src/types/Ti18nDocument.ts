import type { SanityDocument } from '@sanity/client';

export type Ti18nDocument<D = any> = SanityDocument<D> & {
  __i18n_lang?: string;
  __i18n_refs?: {
    _key: string;
    lang: string;
    ref: {
      _type: 'reference';
      _ref: string;
      _weak: boolean;
    };
  }[];
};