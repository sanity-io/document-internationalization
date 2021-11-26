export type TSchema<T = any> = T & {
  name: string
  title: string
  icon?: any
  fields: any[]
}
