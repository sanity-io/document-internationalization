# Intl plugin for Sanity
[![npm version](https://img.shields.io/npm/v/sanity-plugin-intl-input.svg?style=flat)](https://www.npmjs.com/package/sanity-plugin-intl-input)

> sanity-plugin-intl-input will soon be deprecated in favour of an updated version, officially released by Sanity. This is for future compatibility with Sanity Studio and to ensure dedicated maintenance of the plugin. We anticipate no breaking changes to document-level features, however the new official plugin will not support field-level internationalisation.

> Field-level internationalisation is best done using the [guidance in the official Documentation](https://www.sanity.io/docs/localization#cd568b11a09c), combined with the @sanity/language-filter [plugin to improve the UI](https://www.npmjs.com/package/@sanity/language-filter). This method is different from the existing implementation and will require you to update your configuration and schema. You can find a migration guide [in the documentation](docs/object-level-migration.md).

> If you have any questions please ask them in the [Sanity Slack community](https://slack.sanity.io/).


## Default solution
When you want to create translations in Sanity they suggest [following approach](https://www.sanity.io/docs/localization).  
This definitely works, but makes the UI very clunky as you get more fields that require translations.  

![Default Solution](https://raw.githubusercontent.com/LiamMartens/sanity-plugin-intl-input/master/docs/img/default-solution.gif)  

## With intl-plugin
With the intl plugin you will get a cleaner UI for creating translatable documents as the translation is managed across multiple fields and it is even possible to manage document wide translations.  

| Simple translated object field | Document wide translation |
|-|-|
|![Intl Plugin Input](https://raw.githubusercontent.com/LiamMartens/sanity-plugin-intl-input/master/docs/img/intl-plugin.gif)|![Intl Plugin Document Translation](https://raw.githubusercontent.com/LiamMartens/sanity-plugin-intl-input/master/docs/img/intl-plugin-document.gif)|

## Important notice
**Please make sure to read the information about ID structures before setting up your project. It is an important decision that should be made consciously. You can find out more about it [here](docs/important-configuration.md)**

### Documentation
0. [V4 to V5 migration guide](docs/v4-v5-migration.md)
1. [Installation Instructions](docs/installation.md)
2. [General Configuration](docs/general-configuration.md)
3. How to use
    - [Intl object input](docs/usage-intl-object.md)
    - [Document wide translation](docs/usage-intl-doc.md)
4. Datastructure
    - [Intl object input](docs/datastructure-intl-object.md)
    - [Document wide translation](docs/datastructure-intl-doc.md)
5. [Translation Maintenance](docs/translation-maintenance.md)
6. [GraphQL support](docs/graphql-intl-doc.md)
7. [Advanced languages](docs/advanced-languages.md)
8. [Usage with custom publish action](docs/usage-with-custom-publish.md)
9. [GROQ Cheatsheet](/docs/groq-cheatsheet.md)
## Other resources
* [Great guied by nilsnh](https://nilsnh.no/2021/08/22/guide-localizing-sanity-cms-with-the-intl-input-plugin/)
* [Sanity Starter](https://www.sanity.io/create?template=sanity-io%2Fsanity-template-translation-examples)
