# Intl plugin for Sanity
## Default solution
When you want to create translations in Sanity they suggest [following approach](https://www.sanity.io/docs/localization).  
This definitely works, but makes the UI very clunky as you get more fields that require translations.  

![Default Solution](https://raw.githubusercontent.com/LiamMartens/sanity-plugin-intl-input/master/doc/img/default-solution.gif)  

## With intl-plugin
With the intl plugin you will get a cleaner UI for creating translatable documents as the translation is managed across multiple fields.  

![Intl Plugin](https://raw.githubusercontent.com/LiamMartens/sanity-plugin-intl-input/master/doc/img/intl-plugin.gif)

## How to use
1. Install the plugin using `npm`, `yarn` or the sanity cli
`yarn add sanity-plugin-intl-input`
`sanity install intl-input`
2. Add the plugin in the `sanity.json` of your project
```
{
  "root": true,
  "project": {
    "name": "..."
  },
  "plugins": [
    "...",
    "intl-input" // <--
  ]
}
```
3. Enable translations for your object type field which will contain all the translatable fields in your document type.  
```
export default {
    type: 'document',
    name: '...',
    title: '...',
    fields: [{
        name: '...',
        title: '...',
        type: 'object',
        options: {
            i18n: true, // enables localization
            languages: ['..', '..', ...] // <-- eg. ['en', 'nl']
        },
        fields: []
    }]
}
```

## Resulting data structure
Your resulting object will not look much different than before apart from the fact that it will now group it's content within the langauge keys. eg:
```
{
  "en": {
    "...": "..."
  },
  "fr": {
    "...": "...
  }
}
```

## Advanced languages
You can also pass a language objects or a GROQ query to the languages option for more advanced language handling.

### Language objects
If you pass an object with `name` and `title` to the languages array you can separate the data key and the visualized language name in the UI.
Eg:
```
languages: [
  { name: 'en_us', title: 'English (US)' },
  { name: 'en_gb', title: 'English (UK)' }
]
```

### GROQ query
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