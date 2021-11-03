# Advanced Language Definition
You can also pass a language objects or a GROQ query to the languages option for more advanced language handling.

## Language objects
If you pass an object with `name` and `title` to the languages array you can separate the data key and the visualized language name in the UI.
Eg:
```
languages: [
  { name: 'en_us', title: 'English (US)' },
  { name: 'en_gb', title: 'English (UK)' }
]
```

## GROQ query
It is also possible to pass a GROQ query to the languages option to dynamically fetch the available languages.
Eg:
```
languages: {
  query: '*[_type=="language"]{_id,name}',
  // these are the object paths to get out of the results to use for name and title
  // it is also possible to pass a simple string which will then be used for both title and name
  value: {
    title: 'name',
    name: '_id'
  }
}
```

## Custom loader functionality
If you require even more control over your languages you can also provide a loader function. To do this you need to implement the `sanity-plugin-intl-input/languages/loader` part your Sanity Studio. This implementation should be a function which receives the default list of langauges and the current document as parameters. It should return a list of normalized languages (`name` + `title`) and it can be `async`

Example:

**sanity.json**
```json
{
  "parts": [
    {
      "implements": "part:sanity-plugin-intl-input/languages/loader",
      "path": "./loader.js"
    }
  ]
}
```

**loader.js**
```js
export default async (languages, document) => {
  return languages;
}
```

One thing to keep in mind is that the languages will not be reloaded everytime the document updates. It is however possible to define an additional `part` to customize this behavior. To do this you need to implement the `sanity-plugin-intl-input/languages/should-reload` part. This needs to export a function which accepts the document as input and returns a boolean defining whether to reload the languages or not. This function can not be `async`.

Example:
**sanity.json**
```json
{
  "parts": [
    {
      "implements": "part:sanity-plugin-intl-input/languages/should-reload",
      "path": "./should-reload.js"
    }
  ]
}
```

**should-reload.js**
```js
export default (document) => {
  return false;
}
```

## Override flag icons
Sometimes it is necessary to override the default flag logic. To do this you can implement the `part:sanity-plugin-intl-input/ui/flags` studio part as follows:

```flags.js
import React from 'react';

export const lang_CULTURE = ({ code }) => (
  <MyFlag />
)
```

Your custom component will receive either the language or culture code (as we render 2 flags by default). If your i18n config does not define cultures it will just receive the language code and we only display a singular flag.

**Remark:** The plugin expects the custom flag components to be named exports from your part implementation, but you could have your locales defined as follows `en-US`. In this case the language can not be used as a variable name so the plugin will look for `en_US` instead, replacing all non alphabetical characters with a `_`