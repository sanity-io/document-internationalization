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

If you require even more control over your languages you can also provide a loader function. 
To do this you need to provide a `languagesLoader` function through plugin config.

This implementation should be a function which receives the default list of languages and the current document as parameters. 
It should return a list of normalized languages (`id` + `title`) and it can be `async`

`sanity.json`

```js
documentI18n({
  // ... other config
  languagesLoader: async (languages, doc) => {
    // perhaps await some remote service
    return [{
      id: 'languageId',
      title: 'languageTitle'
    }]
  } 
})
```

One thing to keep in mind is that the languages will not be reloaded every time the document updates. 
It is however possible to provide additional configuration customize this behavior.

To do this you need to provide the `shouldReload` config prop. 
The function should accept the document as input and return a boolean defining whether to reload the languages or not.
This function can _not_ be `async`.

`sanity.json`

```js
documentI18n({
  // ... other config
  shouldReload: (doc) => {
    return false
  }  
})
```

## Override flag icons

Sometimes it is necessary to override the default flag logic. 
To do this you `customFlagComponents`plugin prop.

```js
import React from 'react'
import {MyFlag} from './MyFlag'

documentI18n({
  // ... other config
  customFlagComponents: {
    'lang_CULTURE': ({code, langCulture, className}) => <MyFlag />
  }
})
```


Your custom component will receive either the language or culture code (as we render 2 flags by default). 
If your i18n config does not define cultures it will just receive the language code and we only display a singular flag.
