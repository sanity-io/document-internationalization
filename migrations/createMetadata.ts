import sanityClient from '@sanity/client'
import {SanityDocumentLike} from 'sanity'

// This migration script is expecting your documents
// to have a field structure like this:
// And will create new `translation.metadata` documents
// With a similar shape

//   __i18n_refs: [
//     {
//       _key: 'en_GB',
//       _ref: '32cb7277-1cfb-4ab1-ae1e-ab844dc8ab72__i18n_en_GB',
//       _type: 'reference',
//     },
//     {
//       _key: 'nl',
//       _ref: '32cb7277-1cfb-4ab1-ae1e-ab844dc8ab72__i18n_nl',
//       _type: 'reference',
//     },
//     {
//       _key: 'no',
//       _ref: '32cb7277-1cfb-4ab1-ae1e-ab844dc8ab72__i18n_no',
//       _type: 'reference',
//     },
//   ],

const client = sanityClient({
  projectId: '6h1mv88x',
  dataset: 'production-v3',
  apiVersion: `2022-06-01`,
  // eslint-disable-next-line no-process-env
  token: process.env.SANITY_TOKEN,
})

// Values in this field will be used to create meta documents
const UNSET_REFS_FIELD = `__i18n_refs`
// This field will be unset from all documents that contain it
const UNSET_BASE_FIELD = `__i18n_base`
// Operation will be scoped to just this one document type
const SCHEMA_TYPE = `lesson`

const fetchDocuments = () =>
  client.fetch(
    `*[_type == $type && (defined(${UNSET_REFS_FIELD}) || defined(${UNSET_BASE_FIELD}))][0...100] {
      _id, 
      _rev, 
      ${UNSET_REFS_FIELD}, 
    }`,
    {type: SCHEMA_TYPE}
  )

const buildPatches = (docs: SanityDocumentLike[]) =>
  docs.map((doc) => ({
    id: doc._id,
    patch: {
      unset: [UNSET_REFS_FIELD, UNSET_BASE_FIELD],
      // this will cause the migration to fail if any of the documents has been
      // modified since it was fetched.
      ifRevisionID: doc._rev,
    },
  }))

type DocumentWithRefs = SanityDocumentLike & {
  [UNSET_REFS_FIELD]: {
    _key: string
    _ref: string
    _type: 'reference'
  }[]
}

const buildMetadata = (docs: DocumentWithRefs[]) => {
  return docs
    .filter((doc) => doc?.[UNSET_REFS_FIELD]?.length)
    .map((doc) => ({
      _type: 'translation.metadata',
      translations: doc[UNSET_REFS_FIELD].map(({_ref, _key}) => ({
        _key,
        value: {
          _type: 'reference',
          _ref,
        },
      })),
    }))
}

const createTransaction = (patches) =>
  patches.reduce(
    (tx, patch) => tx.patch(patch.id, patch.patch),
    client.transaction()
  )

const commitTransaction = (tx) => tx.commit()

const migrateNextBatch = async () => {
  // Get all docs that match query
  const documents = await fetchDocuments()

  // Create new metadata documents before unsetting
  const metadatas = buildMetadata(documents)
  if (metadatas.length) {
    const tx = client.transaction()
    metadatas.forEach((metadata) => tx.create(metadata))
    await commitTransaction(tx)
  }

  // Patch-out fields to remove
  const patches = buildPatches(documents)

  if (patches.length === 0) {
    // eslint-disable-next-line no-console
    console.debug('No more documents to create or patch!')
    return null
  }

  // eslint-disable-next-line no-console
  console.debug(
    `Checking batch:\n %s`,
    patches
      .map((patch) => `${patch.id} => ${JSON.stringify(patch.patch)}`)
      .join('\n')
  )

  const transaction = createTransaction(patches)
  await commitTransaction(transaction)
  return migrateNextBatch()
}

migrateNextBatch().catch((err) => {
  console.error(err)
  // eslint-disable-next-line no-process-exit
  process.exit(1)
})
