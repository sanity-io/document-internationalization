export default {
  /** Displayed above the document pane to open the Translations menu */
  'menu.button.text': 'Translations',

  /** Displayed when the Translations Metadata document could not be fetched */
  'menu.error': 'There was an error returning translations metadata',

  /** Displayed when there are more than 4 languages in a text input box */
  'menu.filter.placeholder': 'Filter languages',

  /** Displayed when the document was found in more than one Translations Metadata document */
  'menu.warning.multipleMetadataReferences':
    'This document has been found in more than one Translations Metadata documents',

  /** Displayed in the console when the supplied "supported languages" are not valid */
  'menu.warning.invalidLanguagesConsole': `Not all languages are valid. It should be an array of objects with an "id" and "title" property. Or a function that returns an array of objects with an "id" and "title" property.`,

  /** Displayed when the supplied "supported languages" are not valid */
  'menu.warning.invalidLanguages':
    'Not all language objects are valid. See the console.',

  /** Displayed when the current document has a language that is not in the "supported languages" array */
  'menu.warning.invalidLanguage':
    'Select a supported language. Current language value:',

  /** Displayed on documents that do not yet have a 'language' field value */
  'menu.warning.missingLanguage': 'Choose a language to apply to this document',

  /** Displayed in the menu on a button to open the Translations Metadata document */
  'menu.manageButton.text': 'Manage Translations',

  /** Displayed in the menu when hovering the Manage button when there are no translations */
  'menu.manageButton.tooltip': 'Document has no other translations',

  /** Error thrown when attempting to create a translation without a source document */
  'create.error.sourceMissing':
    'Cannot create translation without source document',

  /** Error thrown when attempting to create a translation without a source language ID */
  'create.error.sourceLanguageIDMissing':
    'Cannot create translation without source language ID',

  /** Error thrown when attempting to create a translation without the ID of its Translations Metadata document */
  'create.error.metadataIDMissing':
    'Cannot create translation without a metadata ID',

  /** Tooltip message when hovering the menu item of the current document */
  'create.tooltip.current': 'Current document',

  /** Tooltip message when hovering the menu item of an existing translation document */
  'create.tooltip.open': 'Open {{language.title}} translation',

  /** Tooltip message when hovering the menu item which will create a new translation document */
  'create.tooltip.create': 'Create new {{language.title}} translation',

  /** Title of toast popup when a new translation document is created */
  'create.success.toast.title': 'Created "{{language.title}}" translation',

  /** Description of toast popup when a new Translations Metadata document is created */
  'create.success.toast.description.created': 'Created Translations Metadata',

  /** Description of toast popup when an existing Translations Metadata document is updated */
  'create.success.toast.description.updated': 'Updated Translations Metadata',

  /** Title of toast popup when a new translation document cannot be created */
  'create.error.toast.title': 'Error creating translation',
}
