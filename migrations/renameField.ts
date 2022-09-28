import sanityClient from '@sanity/client'
import {SanityDocumentLike} from 'sanity'

const client = sanityClient({
  projectId: '6h1mv88x',
  dataset: 'production-v3',
  apiVersion: `2022-06-01`,
  // eslint-disable-next-line no-process-env
  token: process.env.SANITY_TOKEN,
})

const UNSET_FIELD_NAME = `__i18n_lang`
const NEW_FIELD_NAME = `language`
const SCHEMA_TYPE = `lesson`

const fetchDocuments = () =>
  client.fetch(
    `*[_type == $type && defined(${UNSET_FIELD_NAME})][0...100] {
      _id, 
      _rev, 
      ${UNSET_FIELD_NAME}, 
      ${NEW_FIELD_NAME}
    }`,
    {type: SCHEMA_TYPE}
  )

const buildPatches = (docs: SanityDocumentLike[]) =>
  docs.map((doc) => ({
    id: doc._id,
    patch: {
      set: {[NEW_FIELD_NAME]: doc[UNSET_FIELD_NAME]},
      unset: [UNSET_FIELD_NAME],
      // this will cause the migration to fail if any of the documents has been
      // modified since it was fetched.
      ifRevisionID: doc._rev,
    },
  }))

const createTransaction = (patches) =>
  patches.reduce((tx, patch) => tx.patch(patch.id, patch.patch), client.transaction())

const commitTransaction = (tx) => tx.commit()

const migrateNextBatch = async () => {
  const documents = await fetchDocuments()
  const patches = buildPatches(documents)
  if (patches.length === 0) {
    // eslint-disable-next-line no-console
    console.debug('No more documents to migrate!')
    return null
  }
  // eslint-disable-next-line no-console
  console.debug(
    `Migrating batch:\n %s`,
    patches.map((patch) => `${patch.id} => ${JSON.stringify(patch.patch)}`).join('\n')
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
