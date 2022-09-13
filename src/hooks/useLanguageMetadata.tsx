import React from 'react'
import {useListeningQuery} from 'sanity-plugin-utils'
import {METADATA_SCHEMA_NAME} from '../constants'

import {Metadata} from '../types'

export function useTranslationMetadata(
  id: string,
  schemaType: string
): {
  data: Metadata | null
  loading: boolean
  error: boolean
} {
  const query = `*[_type == $translationSchema && $id in translations[].value._ref][0]`
  const {data, loading, error} = useListeningQuery<Metadata>(query, {
    params: {id, translationSchema: METADATA_SCHEMA_NAME},
  })

  return {data, loading, error}
}
