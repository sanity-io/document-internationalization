import {
  type CustomValidator,
  type Id,
  isKeyedObject,
  isReference,
  type Path,
  type SanityDocument,
} from 'sanity'
import {reduce} from 'traverse'

import {API_VERSION, PLUGIN_CONFIG} from '../constants'

// Extend the declaration with an additional property
declare module 'traverse' {
  // eslint-disable-next-line no-unused-vars
  interface TraverseContext {
    sanityPath: Path
  }
}

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

  // Traverse the document to find any references
  // Can't use `@sanity/mutator` because we need
  // to collect array element `_key`s for validation targets 👇🏻
  const referencePathsById: Map<Id, Path[]> = reduce(
    document,
    // eslint-disable-next-line no-shadow
    function (referencePathsById, value) {
      try {
        // Manually track validation path
        if (this.isRoot) {
          this.sanityPath = this.path
        } else if (
          // When encountering an array element, we need to get
          // its `_key` to use in the validation path
          this.parent &&
          Array.isArray(this.parent.node) &&
          isKeyedObject(value)
        ) {
          this.sanityPath = this.parent!.sanityPath.concat({_key: value._key})
        } else {
          this.sanityPath = this.parent!.sanityPath.concat(this.path.at(-1)!)
        }

        if (isReference(value)) {
          const {_ref: id} = value

          if (referencePathsById.has(id)) {
            const referencePaths = referencePathsById.get(id)!

            // WARNING: mutating in place
            referencePaths.push(this.sanityPath)
          } else {
            referencePathsById.set(id, [this.sanityPath])
          }

          // Don't need to traverse the reference's children
          this.block()
        }
      } catch (error) {
        console.error(error)
      }

      return referencePathsById
    },
    new Map<Id, Path[]>()
  )

  const references = referencePathsById.size
    ? await client.fetch(`*[_id in $ids]{ _id, locale }`, {
        ids: Array.from(referencePathsById.keys()),
      })
    : []

  const paths = (Array.isArray(references) ? references : [])
    .filter(
      (reference) =>
        languageField in reference &&
        reference[languageField] != document[languageField]
    )
    .flatMap((reference) => referencePathsById.get(reference._id) ?? [])

  return paths.length
    ? {
        message: 'Document contains references to other languages',
        paths,
      }
    : true
}
