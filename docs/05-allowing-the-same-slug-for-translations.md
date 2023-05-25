# Allowing the same slug on different language versions

Often your translated documents will share the same slug. You might wish to move this into the metadata document itself using the `metadataFields` option in the plugin. Alternatively, you can customize the `isUnique` function on a [slug type field](https://www.sanity.io/docs/slug-type#isUnique-**3dd89e75a768**).

```ts
// Add the isUnique option to your slug field
defineField({
  name: 'slug',
  type: 'slug',
  options: {
    isUnique: isUniqueOtherThanLanguage
  },
}),

// Create the function
// This checks that there are no other documents
// With this published or draft _id
// Or this schema type
// With the same slug and language
export async function isUniqueOtherThanLanguage(slug: string, context: SlugValidationContext) {
  const {document, getClient} = context
  if (!document?.language) {
    return true
  }
  const client = getClient({apiVersion: '2023-04-24'})
  const id = document._id.replace(/^drafts\./, '')
  const params = {
    draft: `drafts.${id}`,
    published: id,
    language: document.language,
    slug,
  }
  const query = `!defined(*[
    !(_id in [$draft, $published]) &&
    slug.current == $slug &&
    language == $language
  ][0]._id)`
  const result = await client.fetch(query, params)
  return result
}
```
