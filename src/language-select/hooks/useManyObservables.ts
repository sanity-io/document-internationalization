import {useLayoutEffect, useEffect, useRef, useState} from 'react'
import type {Observable, Subscription} from 'rxjs'

const useIsomorphicEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function useManyObservables<T>(observables: Observable<T>[]): (T | null)[] {
  const subscriptions = useRef<Subscription[]>([])
  const isInitial = useRef(true)
  const [value, setState] = useState(() => {
    const isSync = observables.map(() => true)
    const syncValues = observables.map(() => null) as (T | null)[]
    subscriptions.current = observables.map((observable, index) =>
      observable.subscribe((nextVal) => {
        syncValues[index] = nextVal
        if (!isSync[index]) {
          setState([...syncValues])
        }
        isSync[index] = false
      })
    )
    return syncValues
  })

  useIsomorphicEffect(() => {
    // when the observable changes after initial (possibly sync render)
    if (!isInitial.current) {
      subscriptions.current = observables.map((observable, index) =>
        observable.subscribe((nextVal) => {
          value[index] = nextVal
          setState([...value])
        })
      )
    }
    isInitial.current = false

    return () => {
      subscriptions.current.forEach((sub) => {
        sub.unsubscribe()
      })
      subscriptions.current = []
    }
  }, [observables])

  return value
}
