export interface ILanguageQuery {
  query: string
  value:
    | string
    | {
        id: string
        title: string
      }
    | {
        name: string
        title: string
      }
}
