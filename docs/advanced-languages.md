# Advanced language definition

## GROQ Query

It is possible to pass a GROQ query to the languages option to dynamically fetch the available languages.

```groq
languages: {
  query: '*[_type == "language"]{ _id, name}',
  // these are the object paths to get out of the results to use for name and title
  // it is also possible to pass a simple string which will then be used for both title and name
  value: {
    title: 'name',
    name: '_id'
  }
}
```

## Custom loader functionality

If you require even more control over your languages you can also provide a loader function. To do this you need to implement the `@sanity/document-internationalization/languages/loader` part in your Sanity Studio.

This implementation should be a function which receives the default list of languages and the current document as parameters. It should return a list of normalized languages (`id` + `title`) and it can be `async`

`sanity.json`

```json
{
  "parts": [
    {
      "implements": "part:@sanity/document-internationalization/languages/loader",
      "path": "./loader.js"
    }
  ]
}
```

```js
// loader.js

export default async (languages, document) => {
  return languages
}
```

One thing to keep in mind is that the languages will not be reloaded every time the document updates. It is however possible to define an additional `part` to customize this behavior.

To do this you need to implement the `@sanity/document-internationalization/languages/should-reload` part. This needs to export a function which accepts the document as input and returns a boolean defining whether to reload the languages or not. This function can not be `async`.

`sanity.json`

```json
{
  "parts": [
    {
      "implements": "part:@sanity/document-internationalization/languages/should-reload",
      "path": "./should-reload.js"
    }
  ]
}
```

```js
// should-reload.js

export default (document) => {
  return false
}
```

## Override flag icons

Sometimes it is necessary to override the default flag logic. To do this you can implement the `part:@sanity/document-internationalization/ui/flags` studio part as follows:

```js
// flags.js
import React from 'react'

export const lang_CULTURE = ({code}) => <MyFlag />
```

Your custom component will receive either the language or culture code (as we render 2 flags by default). If your i18n config does not define cultures it will just receive the language code and we only display a singular flag.

**Remark:** The plugin expects the custom flag components to be named exports from your part implementation, but you could have your locales defined as follows `en-US`. In this case the language can not be used as a variable name so the plugin will look for `en_US` instead, replacing all non alphabetical characters with a `_`
