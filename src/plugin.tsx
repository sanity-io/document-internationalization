import React from 'react'
import {createPlugin, defineField} from 'sanity'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'

import metadata from './schema/translation/metadata'
import MenuButton from './MenuButton'
import {PluginConfig} from './types'
import {LanguageBadge} from './badges'

const DEFAULT_CONFIG = {
  supportedLanguages: [],
  schemaTypes: [],
  languageField: `language`,
}

export const documentInternationalization = createPlugin<PluginConfig>((config) => {
  const {supportedLanguages, schemaTypes, languageField} = {...DEFAULT_CONFIG, ...config}

  const renderLanguageFilter = (schemaType: string, documentId?: string) => {
    return (
      <MenuButton
        supportedLanguages={supportedLanguages}
        schemaType={schemaType}
        documentId={documentId ?? ``}
        languageField={languageField}
      />
    )
  }

  return {
    name: '@sanity/document-internationalization',
    document: {
      unstable_languageFilter: (prev, ctx) => {
        const {schemaType, documentId} = ctx

        // TODO: Memoize this function
        // IWBN: If we could get the current document value here
        return schemaTypes.includes(schemaType)
          ? [...prev, () => renderLanguageFilter(schemaType, documentId)]
          : prev
      },
      badges: (prev, context) => {
        if (!schemaTypes.includes(context.schemaType)) {
          return prev
        }

        return [(props) => LanguageBadge(props, supportedLanguages, languageField), ...prev]
      },
    },
    schema: {
      // Create the metadata document type
      types: [metadata],

      // For every schema type this plugin is enabled on
      // Create an initial value template to set the language
      templates: (prev, {schema}) => {
        const pluginTemplates = schemaTypes.map((schemaType) => ({
          id: `${schemaType}-with-language`,
          title: `${schema?.get(schemaType)?.title ?? schemaType}: with Language`,
          schemaType,
          parameters: [{name: `languageId`, title: `Language ID`, type: `string`}],
          value: ({languageId}: {languageId: string}) => ({
            [languageField]: languageId,
          }),
        }))

        return [...prev, ...pluginTemplates]
      },
    },
    plugins: [
      // Translation metadata stores its references using this plugin
      // It cuts down on attribute usage and gives UI conveniences
      // To add new languages
      internationalizedArray({
        languages: supportedLanguages,
        fieldTypes: [
          defineField({
            name: 'reference',
            type: 'reference',
            to: schemaTypes.map((type) => ({type})),
            // initialValue: (iv) => {
            // console.log(`iv`, iv)
            // return {[languageField]: `nah`}
            // },
            options: {
              collapsed: false,
              // @ts-ignore
              filter: ({parent}: {parent: {_key: string}}) => {
                if (!parent?._key) {
                  return null
                }

                return {
                  filter: `${languageField} == $language`,
                  params: {language: parent._key},
                }
              },
            },
          }),
        ],
      }),
    ],
  }
})
