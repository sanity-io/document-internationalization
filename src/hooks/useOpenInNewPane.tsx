import {useCallback, useContext} from 'react'
import {usePaneRouter} from 'sanity/desk'
import {RouterContext} from 'sanity/router'

export function useOpenInNewPane(id?: string, type?: string) {
  const routerContext = useContext(RouterContext)
  const {routerPanesState, groupIndex} = usePaneRouter()

  const openInNewPane = useCallback(() => {
    if (!routerContext || !id || !type) {
      return
    }

    // No panes open, function might be called outside Desk
    if (!routerPanesState.length) {
      routerContext.navigateIntent('edit', {id, type})
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
