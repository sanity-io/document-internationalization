import 'styled-components'
import type {Theme} from '@sanity/ui'

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}