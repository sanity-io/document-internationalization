import {
  type CustomValidator,
  type Id,
  isKeyedObject,
  isReference,
  type Path,
  type Reference,
  type SanityDocument,
} from 'sanity'
import {forEach as traverse, type TraverseContext} from 'traverse'

import {API_VERSION, PLUGIN_CONFIG} from '../constants'

export const referenceLanguageValidator: CustomValidator<
  SanityDocument | undefined
> = async (document, {getClient}) => {
  const languageField = window[PLUGIN_CONFIG].languageField

  if (!(document && document[languageField])) {
    return true
  }

  const client = getClient({apiVersion: API_VERSION}).withConfig({
    perspective: 'previewDrafts',
  })

  /**
   * Tracks validation subroutines
   */
  const checks: Promise<Path | null>[] = []

  /**
   * Manage sending up to one requests per reference
   */
  const referenceRequestsById = new Map<Id, Promise<string | null>>()

  async function validateReference(
    this: TraverseContext,
    reference: Reference,
    onError: (path: Path) => Path = (path) => path
  ) {
    try {
      const {_ref: id} = reference

      // Check for a pending request for the same reference
      if (!referenceRequestsById.has(id)) {
        referenceRequestsById.set(
          id,
          client.fetch<string | null, {id: Id}>(
            `*[_id == $id][0].${languageField}`,
            {id},
            {tag: 'validate-language'}
          )
        )
      }

      const referencedLanguage = await referenceRequestsById.get(id)!

      return !(referencedLanguage && document?.[languageField]) ||
        (referencedLanguage && referencedLanguage === document[languageField])
        ? null
        : onError(this.path as Path)
    } catch (error) {
      console.error(error)
      return null
    }
  }

  // Recursively visit every property in the object to find any document references
  traverse(document, function (value) {
    if (Array.isArray(value)) {
      for (const element of value) {
        if (isReference(element) && isKeyedObject(element)) {
          checks.push(
            validateReference.bind(this)(element, (path) =>
              path.concat({_key: element._key})
            )
          )
        }
      }

      // Prevents traversing array's elements (non-mutating)
      this.delete(true)
    }

    if (isReference(value)) {
      checks.push(validateReference.bind(this)(value))
    }
  })

  const paths = (await Promise.all(checks)).filter(
    // eslint-disable-next-line no-eq-null
    (value): value is Path => value != null
  )

  return paths.length
    ? {
        message: 'Document contains references to other languages',
        paths,
      }
    : true
}
