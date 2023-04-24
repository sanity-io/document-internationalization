import {useListeningQuery} from 'sanity-plugin-utils'

import {METADATA_SCHEMA_NAME} from '../constants'
import {Metadata} from '../types'

const query = `*[_type == $translationSchema && references($id)]`

export function useTranslationMetadata(id: string): {
  data: Metadata[] | null
  loading: boolean
  error: boolean
} {
  const {data, loading, error} = useListeningQuery<Metadata[]>(query, {
    params: {id, translationSchema: METADATA_SCHEMA_NAME},
  })

  return {data, loading, error}
}
