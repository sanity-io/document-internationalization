export const getBaseId = (id: string) => {
  if (id.startsWith('drafts.')) {
    return id.substring(7)
  }
  if (id.startsWith('versions.')) {
    return id.split('.').slice(2).join('.')
  }
  return id
}
