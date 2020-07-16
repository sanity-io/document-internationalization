# Usage - Intl Object Input
Enable translations for your object type field which will contain all the translatable fields in your document type.  
```javascript
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
            base: '', // (OPTIONAL) id of the base language (if not passed the first one is considered base language)
            languages: ['..', '..', ...], // <-- eg. ['en', 'nl']
            css: (classNames) => ``, // (OPTIONAL) function to apply additional CSS for theming purposes. The classNames argument is an object with the css module classnames.
            messages: { // (OPTIONAL) You can pass a messages object to override the default messsages shown
              loading: 'Loading languages...',
              missingTranslations: 'Missing translations message...',
            },
        },
        fields: []
    }]
}
```