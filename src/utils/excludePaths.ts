import {extractWithPath, Mutation} from '@sanity/mutator'
import {
  isDocumentSchemaType,
  type ObjectSchemaType,
  type Path,
  pathToString,
  type SanityDocument,
  type SchemaType,
} from 'sanity'

export interface DocumentMember {
  schemaType: SchemaType
  path: Path
  name: string
  value: unknown
}

export function removeExcludedPaths(
  doc: SanityDocument | null,
  schemaType: ObjectSchemaType
): SanityDocument | null {
  // If the supplied doc is null or the schemaType
  // isn't a document, return as is.
  if (!isDocumentSchemaType(schemaType) || !doc) {
    return doc
  }

  // The extractPaths function gets all the fields in the doc with
  // a value, along with their schemaTypes and paths. We'll end up
  // with an array of paths in string form which we want to exclude
  const pathsToExclude: string[] = extractPaths(doc, schemaType, [])
    // We filter for any fields which should be excluded from the document
    // duplicate action, based on the schemaType option being set.
    .filter(
      (field) =>
        field.schemaType?.options?.documentInternationalization?.exclude ===
        true
    )
    // then we return the stringified version of the path
    .map((field) => {
      return pathToString(field.path)
    })

  // Now we can use the Mutation class from @sanity/mutator to patch the document
  // to remove all the paths that are for one of the excluded fields. This is just
  // done locally, and the documents themselves are not patched in the Content Lake.
  const mut = new Mutation({
    mutations: [
      {
        patch: {
          id: doc._id,
          unset: pathsToExclude,
        },
      },
    ],
  })

  return mut.apply(doc) as SanityDocument
}

function extractPaths(
  doc: SanityDocument,
  schemaType: ObjectSchemaType,
  path: Path
): DocumentMember[] {
  return schemaType.fields.reduce<DocumentMember[]>((acc, field) => {
    const fieldPath = [...path, field.name]
    const fieldSchema = field.type
    const {value} = extractWithPath(pathToString(fieldPath), doc)[0] ?? {}
    if (!value) {
      return acc
    }

    const thisFieldWithPath: DocumentMember = {
      path: fieldPath,
      name: field.name,
      schemaType: fieldSchema,
      value,
    }

    if (fieldSchema.jsonType === 'object') {
      const innerFields = extractPaths(doc, fieldSchema, fieldPath)

      return [...acc, thisFieldWithPath, ...innerFields]
    } else if (
      fieldSchema.jsonType === 'array' &&
      fieldSchema.of.length &&
      fieldSchema.of.some((item) => 'fields' in item)
    ) {
      const {value: arrayValue} =
        extractWithPath(pathToString(fieldPath), doc)[0] ?? {}

      let arrayPaths: DocumentMember[] = []
      if ((arrayValue as any)?.length) {
        for (const item of arrayValue as any[]) {
          const itemPath = [...fieldPath, {_key: item._key}]
          let itemSchema = fieldSchema.of.find((t) => t.name === item._type)
          if (!item._type) {
            itemSchema = fieldSchema.of[0]
          }
          if (item._key && itemSchema) {
            const innerFields = extractPaths(
              doc,
              itemSchema as ObjectSchemaType,
              itemPath
            )
            const arrayMember = {
              path: itemPath,
              name: item._key,
              schemaType: itemSchema,
              value: item,
            }
            arrayPaths = [...arrayPaths, arrayMember, ...innerFields]
          }
        }
      }

      return [...acc, thisFieldWithPath, ...arrayPaths]
    }

    return [...acc, thisFieldWithPath]
  }, [])
}
