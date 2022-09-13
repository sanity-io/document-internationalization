import React from 'react'
import {usePaneRouter} from 'sanity/desk'
import {RouterContext} from 'sanity/_unstable'

export function useOpenInNewPane(id?: string, type?: string) {
  const routerContext = React.useContext(RouterContext)
  const {routerPanesState, groupIndex} = usePaneRouter()

  const openInNewPane = React.useCallback(() => {
    if (!routerContext || !id || !type) {
      return
    }

    const panes = [...routerPanesState]
    panes.splice(groupIndex + 1, 0, [
      {
        id: id,
        params: {type},
      },
    ])

    const href = routerContext.resolvePathFromState({panes})
    routerContext.navigateUrl({path: href})
  }, [id, type, routerContext, routerPanesState, groupIndex])

  return openInNewPane
}
