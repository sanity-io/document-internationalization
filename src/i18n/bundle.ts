import {defineLocaleResourceBundle} from 'sanity'

import {I18N_NAMESPACE} from '../constants'

export const enUSResourceBundle = defineLocaleResourceBundle({
  locale: 'en-US',
  namespace: I18N_NAMESPACE,
  resources: () => import('./resources-en-US'),
})
