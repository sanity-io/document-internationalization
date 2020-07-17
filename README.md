# Intl plugin for Sanity
[![npm version](https://img.shields.io/npm/v/sanity-plugin-intl-input.svg?style=flat)](https://www.npmjs.com/package/sanity-plugin-intl-input)

## !! Breaking Change for V5
<div style="background: #FFDA79; color: #000; padding: 10px; border-radius: 4px;">
  The ID structure for translated documents has changed. Your queries against Sanity will continue to work until you use the maintenance tab (new in V5) to update the ID structure.
  The change was made to improve the querying structure and to make better use of GROQ. The new structure looks as follows `i18n.{baselanguage-document-id}.{language}`. This means you could query all translations for a document as follows `*[_id in path("i18n.{baselanguage-document-id}.*")]`. This vastly improves the querying experience.
</div>
<br />

## Default solution
When you want to create translations in Sanity they suggest [following approach](https://www.sanity.io/docs/localization).  
This definitely works, but makes the UI very clunky as you get more fields that require translations.  

![Default Solution](https://raw.githubusercontent.com/LiamMartens/sanity-plugin-intl-input/master/doc/img/default-solution.gif)  

## With intl-plugin
With the intl plugin you will get a cleaner UI for creating translatable documents as the translation is managed across multiple fields and it is even possible to manage document wide translations.  

| Simple translated object field | Document wide translation |
|-|-|
|![Intl Plugin Input](https://raw.githubusercontent.com/LiamMartens/sanity-plugin-intl-input/master/doc/img/intl-plugin.gif)|![Intl Plugin Document Translation](https://raw.githubusercontent.com/LiamMartens/sanity-plugin-intl-input/master/doc/img/intl-plugin-document.gif)|

### Documentation
1. [Installation Instructions](docs/installation.md)
2. [General Configuration](docs/general-configuration.md)
3. How to use
    - [Intl object input](docs/usage-intl-object.md)
    - [Document wide translation](docs/usage-intl-doc.md)
4. Datastructure
    - [Intl object input](docs/datastructure-intl-object.md)
    - [Document wide translation](docs/datastructure-intl-doc.md)
5. [GraphQL support](docs/graphql-intl-doc.md)
6. [Advanced languages](docs/advanced-languages.md)