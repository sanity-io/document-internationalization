# Document Internationalization Plugin for Sanity
[![npm version](https://img.shields.io/npm/v/sanity-plugin-intl-input.svg?style=flat)](https://www.npmjs.com/package/sanity-plugin-intl-input)

<!-- ## !! Breaking Change for V5
**The ID structure for translated documents has changed. Your queries against Sanity will continue to work until you use the maintenance tab (new in V5) to update the ID structure.
The change was made to improve the querying structure and to make better use of GROQ. The new structure looks as follows `i18n.{baselanguage-document-id}.{language}`. This means you could query all translations for a document as follows `*[_id in path("i18n.{baselanguage-document-id}.*")]`. This vastly improves the querying experience.** -->

## Default solution
When you want to create translations in Sanity they suggest [following approach](https://www.sanity.io/docs/localization).  
This definitely works, but makes the UI very clunky as you get more fields that require translations.  

![Default Solution](https://raw.githubusercontent.com/sanity-io/document-internationalization/main/docs/img/default-solution.gif)  

## With intl-plugin
With the intl plugin you will get a cleaner UI for creating translatable documents as the translations are managed document wide.  
![Intl Plugin Document Translation](https://raw.githubusercontent.com/sanity-io/document-internationalization/main/docs/img/intl-plugin-document.gif)

## Important notice before getting started
An important decision you will need to make is whether to use subpath or delimiter based IDs. Subpaths are slightly easier to query using GROQ, but they also make documents Private, meaning they can only be accessed using an Access Token. Requests with Access Tokens cannot be cached, and so API usage will dramatically increase.

## Documentation
1. [Installation Instructions](docs/installation.md)
2. [General Configuration](docs/general-configuration.md)
3. [How to use](docs/usage-intl-doc.md)
4. [Datastructure](docs/datastructure-intl-doc.md)
5. [Translation Maintenance](docs/translation-maintenance.md)
6. [GraphQL support](docs/graphql-intl-doc.md)
7. [Advanced languages](docs/advanced-languages.md)
8. [Usage with custom publish action](docs/usage-with-custom-publish.md)
9. [GROQ Cheatsheet](/docs/groq-cheatsheet.md)
## Other resources
* [Great guied by nilsnh](https://nilsnh.no/2021/08/22/guide-localizing-sanity-cms-with-the-intl-input-plugin/)
* [Sanity Starter](https://www.sanity.io/create?template=sanity-io%2Fsanity-template-translation-examples)
