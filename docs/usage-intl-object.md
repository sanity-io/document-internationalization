# Usage - Intl Object Input
To use the intl object input you need to enable it for your object type field, which will contain all the translatable fields in your document.  
Following options can be passed to the `object` field configuration
* `i18n`: Set to `true` to enable the translated object input
* `base`: *OPTIONAL* Override the globally configured base language ID. If there is no base language ID configured at all, the first language in the list will be used.
* `languages`: *OPTIONAL* Override the globally configured languages option. If the languages aren't configured globally, this option is required.
* `css`: *OPTIONAL* You can use this option to apply additional CSS for theming purposes. The option is a `function` which receives 1 argument, being the default css classnames. It should return a string of class names. (this can not be globally configured)
* `messages`: : Use this to override the default or globally configured messages. Only the following keys are relevant here:  
  * `loading`
  * `missingTranslations`

**Example**
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
            i18n: true,
            base: 'en_US',
            languages: ['en_US', 'nl_NL'],
            css: (classNames) => `${classNames} custom-classname`,
            messages: {
              loading: 'Loading languages...',
              missingTranslations: 'Missing translations message...',
            },
        },
        fields: []
    }]
}
```