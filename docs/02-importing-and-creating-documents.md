# Importing and creating documents

If you are creating documents via the API this guide will show you how to create the required "shape" of documents for the Studio and plugin to use.

Say you have content that you need to import into the Studio that looks like this, and you're using @sanity/client to create Sanity documents.

```json
[
  {
    "id": "1",
    "type": "post",
    "title": "Hello world",
    "body": "This is a post",
    "locale": "en"
  },
  {
    "id": "2",
    "type": "post",
    "title": "Hei verden",
    "body": "Dette er et innlegg",
    "locale": "no"
  }
]
```

Once created as Sanity documents, they should look like this with an additional `translation.metadata` document:

```json
[
  {
    "_id": "9b4c2d23-0434-4a2d-be39-84674060d3de",
    "_type": "post",
    "title": "Hello world",
    "body": "This is a post",
    "language": "en"
  },
  {
    "_id": "0fcdc874-84f3-4981-9721-cb4c125011b8",
    "_type": "post",
    "title": "Hei verden",
    "body": "Dette er et innlegg",
    "language": "no"
  },
  {
    "_id": "89f8e852-2146-429b-83a9-4895cca84cb7",
    "_type": "translation.metadata"
    "translations": [
        {
            "_key": "en",
            "value": {
                "_type": "reference",
                "_ref": "9b4c2d23-0434-4a2d-be39-84674060d3de"
            }
        },
        {
            "_key": "no",
            "value": {
                "_type": "reference",
                "_ref": "0fcdc874-84f3-4981-9721-cb4c125011b8"
            }
        }
    ]
  }
]
```

## Modify your existing data

1: A shape that the Content Lake expects:

- Ensure you have an `_id` and a `_type`
- An `_id` can be any string but must be unique in the dataset
- You will need to know each document `_id` during this process so that you can also create references in the metadata document

2: A shape that the plugin expects:

- Ensure every document has a `language` field with a valid [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language code
- The name of that field can be changed with the `languageField` configuration option, it is `language` by default

3: Create an additional metadata document to join the translations together. For this you'll need to know each document's `_id` value to use it as a reference.

## Script to create Sanity documents with translations

Here's an example script which could be run from the Sanity CLI to create these documents:

```ts
// ./importPosts.ts

import {getCliClient} from 'sanity/cli'
import {uuid} from '@sanity/uuid'

/**
 * This script is an example of how to create
 * documents for the Sanity Content Lake
 * and the Document Internationalization plugin
 *
 * To run this script, you can use the Sanity CLI:
 * npx sanity@latest exec ./importPosts.ts --with-user-token
 */

// Uses the projectId and dataset in `./sanity.cli.ts`
const client = getCliClient()

const DATA = [
  // the array of existing "posts"
]

async function importPosts() {
    // Create a Sanity-shaped document for every piece of data
    const documents = DATA.map((post) => ({
        _id: uuid(),
        _type: 'post',
        title: post.title,
        body: post.body,
        // Optional, depending on the `languageField` setting in your plugin configuration
        language: post.locale
    }))

    // Create a separate metadata document to join the translations together
    const metadata = {
        _id: uuid(),
        _type: 'translation.metadata',
        // Use `documents` created above, not `DATA`!
        translations: documents.map((doc) => ({
            _key: doc.language,
            value: {
                _type: 'reference',
                _ref: doc._id
            }
        }))
        // Optional, used to filter references in the `translations` field
        schemaTypes: [documents[0]._type],
    }

    // Perform all document creation in a single transaction
    const transaction = client.transaction()

    documents.forEach((doc) => {
        transaction.createOrReplace(doc)
    })
    transaction.createOrReplace(metadata)

    await transaction.commit().then((res) => {
        console.log('Documents and metadata created successfully')
    }).catch((err) => {
        console.error('Error creating documents and metadata', err)
    }
}

importPosts()

```
