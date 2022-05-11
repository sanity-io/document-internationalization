// eslint-disable-next-line import/no-unassigned-import
import 'styled-components'
import type {Theme} from '@sanity/ui'

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
