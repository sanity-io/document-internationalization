import type {SlugIsUniqueValidator} from 'sanity'
import type {SanityClient} from '@sanity/client'
import {I18nDelimiter} from '../constants'
import {getBaseIdFromId, serializePath} from '../utils'

/**
 * @README most of this is taken from the deafultUnique function in @sanity/validation
 */
export function createIsSlugUnique(client: SanityClient): SlugIsUniqueValidator {
  return (slug, context) => {
    const {document, path, type} = context
    const schemaOptions = type?.options as {disableArrayWarning?: boolean} | undefined

    if (!document) {
      throw new Error(`\`document\` was not provided in validation context.`)
    }
    if (!path) {
      throw new Error(`\`path\` was not provided in validation context.`)
    }

    const disableArrayWarning = schemaOptions?.disableArrayWarning || false
    const baseId = getBaseIdFromId(document._id)
    const docType = document._type
    const atPath = serializePath(path.concat('current'))

    if (!disableArrayWarning && atPath.includes('[]')) {
      const serializedPath = serializePath(path)
      console.warn(
        [
          `Slug field at path ${serializedPath} is within an array and cannot be automatically checked for uniqueness`,
          `If you need to check for uniqueness, provide your own "isUnique" method`,
          `To disable this message, set \`disableArrayWarning: true\` on the slug \`options\` field`,
        ].join('\n')
      )
    }

    const constraints = [
      '_type == $docType',
      '!(_id in path("drafts.**"))', // exclude drafts
      '_id != $baseId', // exclude own base document
      '!(_id in path("i18n." + $baseId + ".*"))', // exclude any subpath translations
      `!(_id match $baseId  + "${I18nDelimiter}*")`, // exclude any delimiter based translations
      `${atPath} == $slug`,
    ].join(' && ')

    return client.fetch<boolean>(
      `!defined(*[${constraints}][0]._id)`,
      {
        docType,
        baseId,
        slug,
      },
      {tag: 'validation.slug-is-unique'}
    )
  }
}
