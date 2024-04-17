import {useListeningQuery} from 'sanity-plugin-utils'

import {METADATA_SCHEMA_NAME} from '../constants'
import type {Metadata} from '../types'

// Using references() seemed less reliable for updating the listener
// results than querying raw values in the array
// AFAIK: references is _faster_ when querying with GROQ
// const query = `*[_type == $translationSchema && references($id)]`
const query = `*[_type == $translationSchema && $id in translations[].value._ref]{
  _id,
  _createdAt,
  translations
}`

export function useTranslationMetadata(id: string): {
  data: Metadata[] | null
  loading: boolean
  error: boolean | unknown | ProgressEvent
} {
  const {data, loading, error} = useListeningQuery<Metadata[]>(query, {
    params: {id, translationSchema: METADATA_SCHEMA_NAME},
  })

  return {data, loading, error}
}
