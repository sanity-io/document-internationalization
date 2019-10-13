# Intl plugin for Sanity
## Default solution
When you want to create translations in Sanity they suggest [following approach](https://www.sanity.io/docs/localization).  
This definitely works, but makes the UI very clunky as you get more fields that require translations.  

![Default Solution](doc/img/default-solution.gif)  

## With intl-plugin
With the intl plugin you will get a cleaner UI for creating translatable documents as the translation is managed across multiple fields.  

![Intl Plugin](doc/img/intl-plugin.gif)

## How to use
1. Install the plugin using `npm` or `yarn`  
`yarn add sanity-plugin-intl-input`
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