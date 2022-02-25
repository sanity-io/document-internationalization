import {useEditState} from '@sanity/react-hooks/dist/dts'
import documentStore from 'part:@sanity/base/datastore/document'
import {useMemo} from 'react'
import type {Observable} from 'rxjs'
import {useManyObservables} from './useManyObservables'

export function useManyEditStates(documentIds: string[], documentType: string) {
  const observables = useMemo(
    () =>
      documentIds.map((id) => documentStore.pair.editState(id, documentType)) as Observable<
        ReturnType<typeof useEditState>
      >[],
    [documentIds, documentType]
  )
  return useManyObservables(observables)
}
