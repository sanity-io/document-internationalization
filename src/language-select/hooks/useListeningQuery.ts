import React, {useEffect, useState, useRef} from 'react'
import documentStore from 'part:@sanity/base/datastore/document'
import {catchError, distinctUntilChanged} from 'rxjs/operators'
import isEqual from 'react-fast-compare'

type Params = Record<string, string | number | boolean | string[]>

interface ListenQueryOptions {
  tag?: string
  apiVersion?: string
}

type ReturnShape = {
  loading: boolean
  error: boolean
  data: any
}

type Observable = {
  unsubscribe: () => void
}

export default function useListeningQuery(
  query: string,
  params: Params = {},
  options: ListenQueryOptions = {apiVersion: `v2022-05-09`}
): ReturnShape {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState(null)
  const subscription = useRef<null | Observable>(null)

  useEffect(() => {
    if (query) {
      subscription.current = documentStore
        .listenQuery(query, params, options)
        .pipe(
          distinctUntilChanged(isEqual),
          catchError((err) => {
            console.error(err)
            setError(err)
            setLoading(false)
            setData(null)

            return err
          })
        )
        .subscribe((documents) => {
          // Prevent re-renders from subscription returning the same data
          if (!isEqual(data, documents)) {
            setData(documents)
          }
          setLoading(false)
          setError(false)
        })
    }

    return () => {
      return subscription.current ? subscription.current.unsubscribe() : undefined
    }
  }, [query, params, options])

  return {loading, error, data}
}
